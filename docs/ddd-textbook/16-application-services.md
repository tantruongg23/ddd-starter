# Chapter 16: Application Services

> *"Application Services are the direct clients of the domain model... they coordinate tasks and delegate work to domain objects."*
> — Vaughn Vernon

---

## What is an Application Service?

An **Application Service** (also called Use Case or Application Layer Service) orchestrates the execution of domain logic. It doesn't contain business rules itself but coordinates domain objects, handles transactions, and manages the overall workflow of a use case.

```
┌─────────────────────────────────────────────────────────────────────┐
│                  APPLICATION SERVICE ROLE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   External World                                                    │
│   (Controllers, Message Handlers, CLI)                              │
│               │                                                      │
│               ▼                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              APPLICATION SERVICE                             │   │
│   │                                                              │   │
│   │  Responsibilities:                                           │   │
│   │  • Accept commands/requests from outside                     │   │
│   │  • Begin/commit transactions                                 │   │
│   │  • Load aggregates from repositories                         │   │
│   │  • Call domain methods                                       │   │
│   │  • Save aggregates                                           │   │
│   │  • Publish domain events                                     │   │
│   │  • Handle security/authorization                             │   │
│   │  • Return results                                            │   │
│   │                                                              │   │
│   │  Does NOT contain:                                           │   │
│   │  • Business rules (belong in domain)                        │   │
│   │  • Data validation beyond format (domain does this)         │   │
│   │  • Complex calculations (domain service)                     │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│               │                                                      │
│               ▼                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    DOMAIN LAYER                              │   │
│   │  (Aggregates, Entities, Value Objects, Domain Services)      │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Application Service Pattern

### Basic Structure

```java
@Service
public class OrderApplicationService {
    
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductCatalog productCatalog;
    private final PricingService pricingService;
    private final DomainEventPublisher eventPublisher;
    
    // Dependency injection via constructor
    public OrderApplicationService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ProductCatalog productCatalog,
            PricingService pricingService,
            DomainEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productCatalog = productCatalog;
        this.pricingService = pricingService;
        this.eventPublisher = eventPublisher;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // USE CASE: Place Order
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public OrderId placeOrder(PlaceOrderCommand command) {
        // 1. Load dependencies
        Customer customer = customerRepository.findById(new CustomerId(command.customerId()))
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));
        
        ShippingAddress address = customer.getAddress(new AddressId(command.addressId()))
            .orElseThrow(() -> new AddressNotFoundException(command.addressId()));
        
        // 2. Create aggregate
        Order order = Order.create(customer.getId(), address);
        
        // 3. Execute domain logic
        for (OrderLineRequest item : command.items()) {
            Product product = productCatalog.findById(new ProductId(item.productId()))
                .orElseThrow(() -> new ProductNotFoundException(item.productId()));
            
            Money price = pricingService.calculatePrice(
                product, customer, Quantity.of(item.quantity())
            );
            
            order.addLine(product.getId(), product.getName(), 
                         Quantity.of(item.quantity()), price);
        }
        
        order.place();
        
        // 4. Persist
        orderRepository.save(order);
        
        // 5. Publish events
        eventPublisher.publish(order.getDomainEvents());
        order.clearDomainEvents();
        
        // 6. Return result
        return order.getId();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // USE CASE: Cancel Order
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public void cancelOrder(CancelOrderCommand command) {
        Order order = orderRepository.findById(new OrderId(command.orderId()))
            .orElseThrow(() -> new OrderNotFoundException(command.orderId()));
        
        order.cancel(CancellationReason.of(command.reason()));
        
        orderRepository.save(order);
        eventPublisher.publish(order.getDomainEvents());
        order.clearDomainEvents();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // USE CASE: Add Item to Order
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public void addItemToOrder(AddItemCommand command) {
        Order order = orderRepository.findById(new OrderId(command.orderId()))
            .orElseThrow(() -> new OrderNotFoundException(command.orderId()));
        
        Product product = productCatalog.findById(new ProductId(command.productId()))
            .orElseThrow(() -> new ProductNotFoundException(command.productId()));
        
        Customer customer = customerRepository.findById(order.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException(order.getCustomerId().getValue()));
        
        Money price = pricingService.calculatePrice(
            product, customer, Quantity.of(command.quantity())
        );
        
        order.addLine(product.getId(), product.getName(),
                     Quantity.of(command.quantity()), price);
        
        orderRepository.save(order);
        eventPublisher.publish(order.getDomainEvents());
        order.clearDomainEvents();
    }
}
```

---

## Responsibilities Breakdown

### What Application Services DO

```java
@Service
public class AccountApplicationService {
    
    // ✓ TRANSACTION MANAGEMENT
    @Transactional
    public void transfer(TransferCommand command) {
        // Entire operation in one transaction
    }
    
    // ✓ LOAD AGGREGATES
    public void withdraw(WithdrawCommand command) {
        Account account = accountRepository.findById(command.accountId())
            .orElseThrow(() -> new AccountNotFoundException(command.accountId()));
    }
    
    // ✓ COORDINATE DOMAIN OBJECTS
    public TransferId transfer(TransferCommand command) {
        Account source = accountRepository.findById(command.sourceId()).get();
        Account destination = accountRepository.findById(command.destinationId()).get();
        
        // Call domain service that coordinates the transfer
        transferService.transfer(source, destination, command.amount());
    }
    
    // ✓ SAVE AGGREGATES
    public void withdraw(WithdrawCommand command) {
        Account account = accountRepository.findById(command.accountId()).get();
        account.withdraw(command.amount());
        accountRepository.save(account);  // Persist changes
    }
    
    // ✓ PUBLISH EVENTS
    public void withdraw(WithdrawCommand command) {
        Account account = // ...
        account.withdraw(command.amount());
        accountRepository.save(account);
        eventPublisher.publish(account.getDomainEvents());  // Notify listeners
    }
    
    // ✓ AUTHORIZATION
    @PreAuthorize("hasRole('ACCOUNT_MANAGER')")
    public void closeAccount(CloseAccountCommand command) {
        // Only authorized users can close accounts
    }
    
    // ✓ INPUT TRANSFORMATION
    public void createAccount(CreateAccountCommand command) {
        // Transform primitives to domain types
        Money initialDeposit = Money.of(command.amount(), command.currency());
        CustomerId customerId = new CustomerId(command.customerId());
        // ...
    }
}
```

### What Application Services DON'T DO

```java
@Service
public class OrderApplicationService {
    
    // ✗ DON'T: Business logic in application service
    @Transactional
    public void placeOrderWRONG(PlaceOrderCommand command) {
        Order order = orderRepository.findById(command.orderId()).get();
        
        // ✗ WRONG: Business rules should be in domain
        if (order.getLines().isEmpty()) {
            throw new EmptyOrderException();
        }
        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new InvalidStateException();
        }
        
        // ✗ WRONG: Calculations should be in domain
        BigDecimal total = BigDecimal.ZERO;
        for (OrderLine line : order.getLines()) {
            total = total.add(line.getPrice().multiply(
                BigDecimal.valueOf(line.getQuantity())));
        }
        
        order.setTotal(total);
        order.setStatus(OrderStatus.PLACED);
    }
    
    // ✓ RIGHT: Delegate to domain
    @Transactional
    public void placeOrderRIGHT(PlaceOrderCommand command) {
        Order order = orderRepository.findById(command.orderId()).get();
        
        order.place();  // All business logic in domain
        
        orderRepository.save(order);
    }
}
```

---

## Application Service Patterns

### Command-Based Pattern

```java
@Service
public class OrderApplicationService {
    
    // Each method handles one command type
    public OrderId handle(PlaceOrderCommand command) { ... }
    public void handle(CancelOrderCommand command) { ... }
    public void handle(AddItemCommand command) { ... }
    public void handle(RemoveItemCommand command) { ... }
    public void handle(UpdateQuantityCommand command) { ... }
}

// Or with specific handler classes
public class PlaceOrderHandler {
    
    @Transactional
    public OrderId handle(PlaceOrderCommand command) {
        // Handle the specific command
    }
}
```

### Use Case-Based Pattern

```java
// One class per use case - clearer separation
@Service
public class PlaceOrderUseCase {
    
    @Transactional
    public OrderId execute(PlaceOrderCommand command) {
        // ...
    }
}

@Service
public class CancelOrderUseCase {
    
    @Transactional
    public void execute(CancelOrderCommand command) {
        // ...
    }
}
```

### Result Objects

```java
// Instead of throwing exceptions, return result objects
public class OrderApplicationService {
    
    @Transactional
    public PlaceOrderResult placeOrder(PlaceOrderCommand command) {
        try {
            // ... execute use case
            return PlaceOrderResult.success(order.getId());
            
        } catch (CustomerNotFoundException e) {
            return PlaceOrderResult.customerNotFound(command.customerId());
            
        } catch (ProductNotFoundException e) {
            return PlaceOrderResult.productNotFound(e.getProductId());
            
        } catch (InsufficientInventoryException e) {
            return PlaceOrderResult.insufficientInventory(e.getProductId());
        }
    }
}

// Result object
public sealed interface PlaceOrderResult {
    
    record Success(String orderId) implements PlaceOrderResult {}
    record CustomerNotFound(String customerId) implements PlaceOrderResult {}
    record ProductNotFound(String productId) implements PlaceOrderResult {}
    record InsufficientInventory(String productId, int available) implements PlaceOrderResult {}
    
    static PlaceOrderResult success(OrderId id) {
        return new Success(id.getValue());
    }
    
    static PlaceOrderResult customerNotFound(String id) {
        return new CustomerNotFound(id);
    }
}
```

---

## Integration with Infrastructure

### Controller → Application Service

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private final OrderApplicationService orderService;
    
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        // Transform request to command
        PlaceOrderCommand command = new PlaceOrderCommand(
            request.getCustomerId(),
            request.getItems().stream()
                .map(i -> new OrderLineRequest(i.getProductId(), i.getQuantity()))
                .toList(),
            request.getShippingAddressId(),
            request.getPromotionCode()
        );
        
        // Delegate to application service
        OrderId orderId = orderService.placeOrder(command);
        
        // Transform result to response
        return ResponseEntity
            .created(URI.create("/api/orders/" + orderId.getValue()))
            .body(new OrderResponse(orderId.getValue()));
    }
    
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable String orderId,
            @RequestBody CancelOrderRequest request) {
        
        orderService.cancelOrder(new CancelOrderCommand(orderId, request.getReason()));
        
        return ResponseEntity.noContent().build();
    }
}
```

### Message Handler → Application Service

```java
@Component
public class OrderMessageHandler {
    
    private final OrderApplicationService orderService;
    
    @RabbitListener(queues = "order-commands")
    public void handlePlaceOrder(PlaceOrderMessage message) {
        PlaceOrderCommand command = new PlaceOrderCommand(
            message.getCustomerId(),
            message.getItems(),
            message.getAddressId(),
            message.getPromotionCode()
        );
        
        try {
            orderService.placeOrder(command);
        } catch (Exception e) {
            // Handle failure - maybe send to DLQ
            log.error("Failed to place order", e);
            throw new AmqpRejectAndDontRequeueException(e);
        }
    }
}
```

---

## Testing Application Services

```java
@ExtendWith(MockitoExtension.class)
class OrderApplicationServiceTest {
    
    @Mock private OrderRepository orderRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private ProductCatalog productCatalog;
    @Mock private PricingService pricingService;
    @Mock private DomainEventPublisher eventPublisher;
    
    @InjectMocks
    private OrderApplicationService orderService;
    
    @Test
    void placeOrder_shouldCreateOrderAndPublishEvent() {
        // Given
        var command = new PlaceOrderCommand(
            "customer-1",
            List.of(new OrderLineRequest("product-1", 2)),
            "address-1",
            null
        );
        
        var customer = TestCustomer.withId("customer-1");
        var product = TestProduct.withId("product-1");
        
        when(customerRepository.findById(any())).thenReturn(Optional.of(customer));
        when(productCatalog.findById(any())).thenReturn(Optional.of(product));
        when(pricingService.calculatePrice(any(), any(), any()))
            .thenReturn(Money.of(100, "USD"));
        
        // When
        OrderId result = orderService.placeOrder(command);
        
        // Then
        assertThat(result).isNotNull();
        verify(orderRepository).save(any(Order.class));
        verify(eventPublisher).publish(anyList());
    }
    
    @Test
    void placeOrder_shouldThrowWhenCustomerNotFound() {
        // Given
        var command = new PlaceOrderCommand("unknown", List.of(), "addr-1", null);
        when(customerRepository.findById(any())).thenReturn(Optional.empty());
        
        // When/Then
        assertThatThrownBy(() -> orderService.placeOrder(command))
            .isInstanceOf(CustomerNotFoundException.class);
    }
}
```

---

## Key Takeaways

1. **Orchestration, not business logic** - Coordinate domain objects, don't contain rules

2. **Transaction boundary** - Each public method is typically one transaction

3. **Thin layer** - Should be relatively simple, delegating to domain

4. **Entry point for use cases** - Called by controllers, message handlers, etc.

5. **Handle infrastructure concerns** - Security, transactions, event publishing

6. **Transform data** - Convert primitives to domain types and back

---

## What's Next?

In [Chapter 17: Factories](./17-factories.md), we'll explore how to encapsulate complex object creation logic.

---

**[← Previous: Domain Services](./15-domain-services.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Factories →](./17-factories.md)**
