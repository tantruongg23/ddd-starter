# Chapter 13: Commands and Command Handlers

> *"Segregate operations that read data from operations that update data."*
> — Greg Young (CQRS)

---

## What is a Command?

A **Command** is an object that represents an intention to change the system's state. It encapsulates all the information needed to perform a specific action.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMMAND CONCEPT                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Commands represent INTENTIONS:                                    │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                              │   │
│   │  "PlaceOrder"        - Intent to submit an order            │   │
│   │  "CancelOrder"       - Intent to cancel an existing order   │   │
│   │  "UpdateAddress"     - Intent to change shipping address    │   │
│   │  "ProcessPayment"    - Intent to charge customer            │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Key characteristics:                                              │
│                                                                      │
│   • Named as IMPERATIVE (do something)                              │
│   • Contains all data needed to perform the action                  │
│   • Targets a specific aggregate or use case                        │
│   • Can be REJECTED if business rules not satisfied                 │
│   • Results in domain events if successful                          │
│                                                                      │
│   COMMAND vs EVENT:                                                 │
│   ─────────────────                                                 │
│   Command: "PlaceOrder" (request to do something)                   │
│   Event:   "OrderPlaced" (record of what happened)                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Command Structure

### Basic Command Pattern

```java
// Marker interface for all commands
public interface Command {
}

// Command with target aggregate
public interface Command<T> {
    // T is the expected result type
}

// Example commands
public record PlaceOrderCommand(
    String customerId,
    List<OrderLineRequest> items,
    String shippingAddressId,
    String promotionCode
) implements Command<OrderId> {}

public record CancelOrderCommand(
    String orderId,
    String reason
) implements Command<Void> {}

public record UpdateOrderAddressCommand(
    String orderId,
    String newAddressId
) implements Command<Void> {}

public record AddItemToOrderCommand(
    String orderId,
    String productId,
    int quantity
) implements Command<OrderLineId> {}
```

### Command with Validation

```java
public record PlaceOrderCommand(
    String customerId,
    List<OrderLineRequest> items,
    String shippingAddressId,
    String promotionCode
) implements Command<OrderId> {
    
    // Compact constructor for validation
    public PlaceOrderCommand {
        Objects.requireNonNull(customerId, "Customer ID required");
        Objects.requireNonNull(items, "Items required");
        if (items.isEmpty()) {
            throw new IllegalArgumentException("At least one item required");
        }
        Objects.requireNonNull(shippingAddressId, "Shipping address required");
        // promotionCode can be null
    }
}

public record OrderLineRequest(
    String productId,
    int quantity
) {
    public OrderLineRequest {
        Objects.requireNonNull(productId, "Product ID required");
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
    }
}
```

---

## Command Handlers

### Handler Pattern

```java
// Generic command handler interface
public interface CommandHandler<C extends Command<R>, R> {
    R handle(C command);
}

// Specific handler implementation
@Component
public class PlaceOrderCommandHandler implements CommandHandler<PlaceOrderCommand, OrderId> {
    
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductCatalog productCatalog;
    private final DomainEventPublisher eventPublisher;
    
    @Override
    @Transactional
    public OrderId handle(PlaceOrderCommand command) {
        // 1. Validate command and load dependencies
        Customer customer = customerRepository.findById(new CustomerId(command.customerId()))
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));
        
        ShippingAddress address = customer.getAddress(new AddressId(command.shippingAddressId()))
            .orElseThrow(() -> new AddressNotFoundException(command.shippingAddressId()));
        
        // 2. Create aggregate
        Order order = Order.create(customer.getId(), address);
        
        // 3. Execute domain logic
        for (OrderLineRequest lineRequest : command.items()) {
            Product product = productCatalog.findById(new ProductId(lineRequest.productId()))
                .orElseThrow(() -> new ProductNotFoundException(lineRequest.productId()));
            
            order.addLine(
                product.getId(),
                product.getName(),
                Quantity.of(lineRequest.quantity()),
                product.getPrice()
            );
        }
        
        // Apply promotion if provided
        if (command.promotionCode() != null) {
            order.applyPromotion(new PromotionCode(command.promotionCode()));
        }
        
        // Place the order
        order.place();
        
        // 4. Save and publish events
        orderRepository.save(order);
        eventPublisher.publish(order.getDomainEvents());
        order.clearDomainEvents();
        
        return order.getId();
    }
}

@Component
public class CancelOrderCommandHandler implements CommandHandler<CancelOrderCommand, Void> {
    
    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;
    
    @Override
    @Transactional
    public Void handle(CancelOrderCommand command) {
        Order order = orderRepository.findById(new OrderId(command.orderId()))
            .orElseThrow(() -> new OrderNotFoundException(command.orderId()));
        
        order.cancel(CancellationReason.fromCode(command.reason()));
        
        orderRepository.save(order);
        eventPublisher.publish(order.getDomainEvents());
        order.clearDomainEvents();
        
        return null;
    }
}
```

### Command Bus Pattern

```java
// Command bus dispatches commands to handlers
public interface CommandBus {
    <R> R dispatch(Command<R> command);
}

@Component
public class SimpleCommandBus implements CommandBus {
    
    private final ApplicationContext context;
    
    @Override
    public <R> R dispatch(Command<R> command) {
        CommandHandler<Command<R>, R> handler = findHandler(command);
        return handler.handle(command);
    }
    
    @SuppressWarnings("unchecked")
    private <R> CommandHandler<Command<R>, R> findHandler(Command<R> command) {
        String handlerName = command.getClass().getSimpleName() + "Handler";
        return (CommandHandler<Command<R>, R>) context.getBean(
            StringUtils.uncapitalize(handlerName)
        );
    }
}

// Usage
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private final CommandBus commandBus;
    
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody PlaceOrderRequest request) {
        PlaceOrderCommand command = new PlaceOrderCommand(
            request.getCustomerId(),
            request.getItems().stream()
                .map(i -> new OrderLineRequest(i.getProductId(), i.getQuantity()))
                .toList(),
            request.getShippingAddressId(),
            request.getPromotionCode()
        );
        
        OrderId orderId = commandBus.dispatch(command);
        
        return ResponseEntity.created(URI.create("/api/orders/" + orderId.getValue()))
            .body(new OrderResponse(orderId.getValue()));
    }
    
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable String orderId,
            @RequestBody CancelOrderRequest request) {
        
        commandBus.dispatch(new CancelOrderCommand(orderId, request.getReason()));
        
        return ResponseEntity.noContent().build();
    }
}
```

---

## Application Service Pattern

### Alternative: Direct Application Service

Instead of command bus, use application services directly:

```java
@Service
public class OrderApplicationService {
    
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductCatalog productCatalog;
    private final DomainEventPublisher eventPublisher;
    
    @Transactional
    public OrderId placeOrder(PlaceOrderCommand command) {
        // Validate and load
        Customer customer = customerRepository.findById(new CustomerId(command.customerId()))
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));
        
        ShippingAddress address = customer.getAddress(new AddressId(command.shippingAddressId()))
            .orElseThrow(() -> new AddressNotFoundException(command.shippingAddressId()));
        
        // Create and populate order
        Order order = Order.create(customer.getId(), address);
        
        for (OrderLineRequest line : command.items()) {
            Product product = productCatalog.findById(new ProductId(line.productId()))
                .orElseThrow(() -> new ProductNotFoundException(line.productId()));
            
            order.addLine(product.getId(), product.getName(), 
                         Quantity.of(line.quantity()), product.getPrice());
        }
        
        if (command.promotionCode() != null) {
            order.applyPromotion(new PromotionCode(command.promotionCode()));
        }
        
        order.place();
        
        // Persist and publish
        orderRepository.save(order);
        eventPublisher.publish(order.getDomainEvents());
        order.clearDomainEvents();
        
        return order.getId();
    }
    
    @Transactional
    public void cancelOrder(CancelOrderCommand command) {
        Order order = orderRepository.findById(new OrderId(command.orderId()))
            .orElseThrow(() -> new OrderNotFoundException(command.orderId()));
        
        order.cancel(CancellationReason.fromCode(command.reason()));
        
        orderRepository.save(order);
        eventPublisher.publish(order.getDomainEvents());
        order.clearDomainEvents();
    }
    
    @Transactional
    public void addItemToOrder(AddItemToOrderCommand command) {
        Order order = orderRepository.findById(new OrderId(command.orderId()))
            .orElseThrow(() -> new OrderNotFoundException(command.orderId()));
        
        Product product = productCatalog.findById(new ProductId(command.productId()))
            .orElseThrow(() -> new ProductNotFoundException(command.productId()));
        
        order.addLine(product.getId(), product.getName(),
                     Quantity.of(command.quantity()), product.getPrice());
        
        orderRepository.save(order);
        eventPublisher.publish(order.getDomainEvents());
        order.clearDomainEvents();
    }
}
```

---

## Command Validation

### Multi-Level Validation

```
┌─────────────────────────────────────────────────────────────────────┐
│                   VALIDATION LEVELS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Level 1: SYNTAX (Command construction)                            │
│   ──────────────────────────────────────                            │
│   • Required fields present                                         │
│   • Correct data types                                              │
│   • Format validation (email, phone)                                │
│   • Range checks                                                    │
│                                                                      │
│   Level 2: SEMANTIC (Command handler)                               │
│   ─────────────────────────────────────                             │
│   • References exist (customer, product)                            │
│   • User has permission                                             │
│   • State allows operation                                          │
│                                                                      │
│   Level 3: BUSINESS RULES (Domain/Aggregate)                        │
│   ────────────────────────────────────────                          │
│   • Invariants maintained                                           │
│   • Business constraints                                            │
│   • Domain-specific rules                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// Level 1: Syntax validation in command
public record TransferMoneyCommand(
    String fromAccountId,
    String toAccountId,
    BigDecimal amount,
    String currency,
    String description
) implements Command<TransferId> {
    
    public TransferMoneyCommand {
        // Syntax validation
        Objects.requireNonNull(fromAccountId, "Source account required");
        Objects.requireNonNull(toAccountId, "Destination account required");
        Objects.requireNonNull(amount, "Amount required");
        Objects.requireNonNull(currency, "Currency required");
        
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        
        if (fromAccountId.equals(toAccountId)) {
            throw new IllegalArgumentException("Cannot transfer to same account");
        }
    }
}

// Level 2: Semantic validation in handler
@Component
public class TransferMoneyCommandHandler implements CommandHandler<TransferMoneyCommand, TransferId> {
    
    @Override
    @Transactional
    public TransferId handle(TransferMoneyCommand command) {
        // Semantic validation
        Account fromAccount = accountRepository.findById(new AccountId(command.fromAccountId()))
            .orElseThrow(() -> new AccountNotFoundException(command.fromAccountId()));
        
        Account toAccount = accountRepository.findById(new AccountId(command.toAccountId()))
            .orElseThrow(() -> new AccountNotFoundException(command.toAccountId()));
        
        // Check permissions
        if (!securityContext.canAccessAccount(fromAccount.getId())) {
            throw new AccessDeniedException("No access to source account");
        }
        
        Money amount = Money.of(command.amount(), command.currency());
        
        // Level 3: Business rules in domain
        fromAccount.transfer(toAccount, amount);  // Domain validates
        
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
        
        return TransferId.generate();
    }
}

// Level 3: Business rules in aggregate
public class Account {
    
    public void transfer(Account destination, Money amount) {
        // Business rule: account must be active
        if (this.status != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException(this.id);
        }
        
        // Business rule: sufficient funds
        if (this.balance.isLessThan(amount)) {
            throw new InsufficientFundsException(this.id, this.balance, amount);
        }
        
        // Business rule: daily limit not exceeded
        if (this.dailyTransferAmount.add(amount).isGreaterThan(this.dailyLimit)) {
            throw new DailyLimitExceededException(this.id, this.dailyLimit);
        }
        
        // Execute transfer
        this.balance = this.balance.subtract(amount);
        destination.balance = destination.balance.add(amount);
        this.dailyTransferAmount = this.dailyTransferAmount.add(amount);
        
        raise(new MoneyTransferredEvent(this.id, destination.getId(), amount));
    }
}
```

---

## Command vs Query (CQRS Preview)

```
┌─────────────────────────────────────────────────────────────────────┐
│              COMMAND vs QUERY                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   COMMANDS (Write Side)              QUERIES (Read Side)            │
│   ─────────────────────              ──────────────────             │
│                                                                      │
│   • Change state                     • Read state                   │
│   • Return minimal info              • Return rich data             │
│   • Use domain model                 • Can bypass domain            │
│   • Must be validated                • No validation needed         │
│   • Go through aggregates            • Can query directly           │
│                                                                      │
│   PlaceOrderCommand                  GetOrderDetailsQuery           │
│   CancelOrderCommand                 ListCustomerOrdersQuery        │
│   UpdateAddressCommand               SearchProductsQuery            │
│                                                                      │
│   ┌─────────────┐                   ┌─────────────┐                │
│   │   Command   │                   │    Query    │                │
│   │   Handler   │                   │   Handler   │                │
│   │             │                   │             │                │
│   │ ┌─────────┐ │                   │ SELECT *    │                │
│   │ │Aggregate│ │                   │ FROM orders │                │
│   │ │ (Domain)│ │                   │ WHERE ...   │                │
│   │ └─────────┘ │                   │             │                │
│   │      │      │                   │ (Direct DB) │                │
│   │      ▼      │                   │             │                │
│   │  Database   │                   │             │                │
│   └─────────────┘                   └─────────────┘                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### Command Design Guidelines

```
┌─────────────────────────────────────────────────────────────────────┐
│              COMMAND DESIGN GUIDELINES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✓ Use imperative naming                                            │
│    • PlaceOrder, not OrderPlacement                                 │
│    • CancelSubscription, not SubscriptionCancellation               │
│                                                                      │
│  ✓ Make commands immutable                                          │
│    • Use records or final fields                                    │
│    • No setters                                                     │
│                                                                      │
│  ✓ Include all needed data                                          │
│    • Handler shouldn't need to look up basic info                   │
│    • Self-contained                                                 │
│                                                                      │
│  ✓ Validate at construction                                         │
│    • Fail fast on invalid commands                                  │
│    • Separate from business validation                              │
│                                                                      │
│  ✓ One command = one intent                                         │
│    • Don't combine multiple operations                              │
│    • Clear, focused responsibility                                  │
│                                                                      │
│  ✗ Don't include entities in commands                               │
│    • Use IDs and primitive data                                     │
│    • Handler loads aggregates                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Commands express intent** - "Do this" vs events "This happened"

2. **Commands are validated at multiple levels** - Syntax, semantic, business

3. **Handlers orchestrate** - Load aggregates, call domain methods, save

4. **Commands target aggregates** - One command affects one aggregate (usually)

5. **Command handlers are the use case boundary** - Entry point for writes

6. **Commands are immutable** - Create once, execute once

---

## What's Next?

In [Chapter 14: Repositories](./14-repositories.md), we'll explore how to persist and retrieve aggregates while maintaining domain model integrity.

---

**[← Previous: Domain Events](./12-domain-events.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Repositories →](./14-repositories.md)**
