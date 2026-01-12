# Chapter 19: Hexagonal (Ports & Adapters) Architecture

> *"Allow an application to equally be driven by users, programs, automated tests, or batch scripts, and to be developed and tested in isolation from its eventual run-time devices and databases."*
> — Alistair Cockburn

---

## What is Hexagonal Architecture?

**Hexagonal Architecture** (also called Ports and Adapters) organizes code so that the application core is independent of external concerns. The "hexagon" shape is symbolic—it could have any number of sides, each representing an external interface.

```
┌─────────────────────────────────────────────────────────────────────┐
│                 HEXAGONAL ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                        DRIVING SIDE                                  │
│                     (Primary Adapters)                               │
│                                                                      │
│        REST         GraphQL       Message        CLI                │
│       Adapter       Adapter       Handler       Adapter             │
│          │            │             │             │                  │
│          ▼            ▼             ▼             ▼                  │
│       ┌─────────────────────────────────────────────────┐           │
│       │                INPUT PORTS                       │           │
│       │           (Use Case Interfaces)                  │           │
│       ├─────────────────────────────────────────────────┤           │
│       │                                                  │           │
│       │           ╔════════════════════════╗            │           │
│       │           ║                        ║            │           │
│       │           ║    APPLICATION CORE    ║            │           │
│       │           ║                        ║            │           │
│       │           ║  • Domain Model        ║            │           │
│       │           ║  • Business Logic      ║            │           │
│       │           ║  • Use Cases           ║            │           │
│       │           ║                        ║            │           │
│       │           ╚════════════════════════╝            │           │
│       │                                                  │           │
│       ├─────────────────────────────────────────────────┤           │
│       │               OUTPUT PORTS                       │           │
│       │         (Repository/Service Interfaces)          │           │
│       └─────────────────────────────────────────────────┘           │
│          │            │             │             │                  │
│          ▼            ▼             ▼             ▼                  │
│       Database      Message      External       File                │
│       Adapter       Queue        API           System               │
│                                                                      │
│                        DRIVEN SIDE                                  │
│                    (Secondary Adapters)                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Ports and Adapters Explained

### Ports

**Ports** are interfaces defined by the application core:

```java
// ═══════════════════════════════════════════════════════════════════
// INPUT PORTS (Driving Ports)
// Define what the application CAN DO (use cases)
// ═══════════════════════════════════════════════════════════════════

// Input port - defines a use case
public interface PlaceOrderUseCase {
    OrderId execute(PlaceOrderCommand command);
}

public interface CancelOrderUseCase {
    void execute(CancelOrderCommand command);
}

public interface GetOrderDetailsUseCase {
    OrderDetails execute(OrderId orderId);
}

// ═══════════════════════════════════════════════════════════════════
// OUTPUT PORTS (Driven Ports)  
// Define what the application NEEDS (dependencies)
// ═══════════════════════════════════════════════════════════════════

// Output port - defines what we need from persistence
public interface OrderRepository {
    Optional<Order> findById(OrderId id);
    void save(Order order);
}

// Output port - defines what we need from external payment system
public interface PaymentGateway {
    PaymentResult charge(CustomerId customerId, Money amount);
    void refund(PaymentId paymentId);
}

// Output port - defines what we need for notifications
public interface NotificationSender {
    void sendOrderConfirmation(Email email, OrderId orderId);
}
```

### Adapters

**Adapters** implement the ports, connecting the core to the outside world:

```java
// ═══════════════════════════════════════════════════════════════════
// PRIMARY ADAPTERS (Driving Adapters)
// Implement ways to CALL the application
// ═══════════════════════════════════════════════════════════════════

// REST Adapter - drives the application via HTTP
@RestController
@RequestMapping("/api/orders")
public class OrderRestAdapter {
    
    private final PlaceOrderUseCase placeOrderUseCase;
    private final CancelOrderUseCase cancelOrderUseCase;
    private final GetOrderDetailsUseCase getOrderDetailsUseCase;
    
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody PlaceOrderRequest request) {
        PlaceOrderCommand command = mapToCommand(request);
        OrderId orderId = placeOrderUseCase.execute(command);
        return ResponseEntity.created(/*...*/).body(new OrderResponse(orderId));
    }
    
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable String id) {
        cancelOrderUseCase.execute(new CancelOrderCommand(id));
        return ResponseEntity.noContent().build();
    }
}

// Message Adapter - drives the application via message queue
@Component
public class OrderMessageAdapter {
    
    private final PlaceOrderUseCase placeOrderUseCase;
    
    @RabbitListener(queues = "orders.place")
    public void handlePlaceOrder(PlaceOrderMessage message) {
        PlaceOrderCommand command = mapToCommand(message);
        placeOrderUseCase.execute(command);
    }
}

// ═══════════════════════════════════════════════════════════════════
// SECONDARY ADAPTERS (Driven Adapters)
// Implement what the application NEEDS
// ═══════════════════════════════════════════════════════════════════

// Database Adapter - implements persistence port
@Repository
public class PostgresOrderRepository implements OrderRepository {
    
    private final JpaOrderRepository jpaRepository;
    private final OrderMapper mapper;
    
    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }
    
    @Override
    public void save(Order order) {
        jpaRepository.save(mapper.toEntity(order));
    }
}

// External API Adapter - implements payment gateway port
@Component
public class StripePaymentAdapter implements PaymentGateway {
    
    private final StripeClient stripeClient;
    
    @Override
    public PaymentResult charge(CustomerId customerId, Money amount) {
        try {
            PaymentIntent intent = stripeClient.createPaymentIntent(
                amount.getAmount().longValue(),
                amount.getCurrency().getCurrencyCode()
            );
            return PaymentResult.success(new PaymentId(intent.getId()));
        } catch (StripeException e) {
            return PaymentResult.failed(e.getMessage());
        }
    }
}
```

---

## Application Core

The core contains the domain model and use case implementations:

```java
// ═══════════════════════════════════════════════════════════════════
// APPLICATION CORE - Domain + Use Cases
// ═══════════════════════════════════════════════════════════════════

// Use case implementation
@Service
public class PlaceOrderService implements PlaceOrderUseCase {
    
    // Dependencies defined as OUTPUT PORTS (interfaces)
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final PaymentGateway paymentGateway;
    private final NotificationSender notificationSender;
    
    @Override
    @Transactional
    public OrderId execute(PlaceOrderCommand command) {
        // Load domain objects
        Customer customer = customerRepository.findById(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));
        
        // Create and populate order (domain logic)
        Order order = Order.create(customer.getId(), command.shippingAddress());
        
        for (var item : command.items()) {
            order.addLine(item.productId(), item.quantity(), item.price());
        }
        
        // Domain behavior
        order.place();
        
        // Use output ports - don't know implementations!
        orderRepository.save(order);
        
        // Trigger payment
        PaymentResult payment = paymentGateway.charge(customer.getId(), order.getTotal());
        if (payment.isSuccessful()) {
            order.confirmPayment(payment.getPaymentId());
            orderRepository.save(order);
        }
        
        // Send notification
        notificationSender.sendOrderConfirmation(customer.getEmail(), order.getId());
        
        return order.getId();
    }
}
```

---

## Project Structure

```
src/main/java/com/company/ordering/
│
├── application/                   # APPLICATION CORE
│   ├── domain/                    # Domain Model
│   │   ├── model/
│   │   │   ├── Order.java
│   │   │   ├── OrderLine.java
│   │   │   └── OrderId.java
│   │   ├── event/
│   │   │   └── OrderPlacedEvent.java
│   │   └── service/
│   │       └── PricingService.java
│   │
│   ├── port/                      # PORTS
│   │   ├── in/                    # Input Ports (use cases)
│   │   │   ├── PlaceOrderUseCase.java
│   │   │   ├── CancelOrderUseCase.java
│   │   │   └── command/
│   │   │       ├── PlaceOrderCommand.java
│   │   │       └── CancelOrderCommand.java
│   │   └── out/                   # Output Ports (dependencies)
│   │       ├── OrderRepository.java
│   │       ├── PaymentGateway.java
│   │       └── NotificationSender.java
│   │
│   └── service/                   # Use Case Implementations
│       ├── PlaceOrderService.java
│       └── CancelOrderService.java
│
└── adapter/                       # ADAPTERS
    ├── in/                        # Primary/Driving Adapters
    │   ├── web/
    │   │   ├── OrderController.java
    │   │   └── dto/
    │   │       ├── PlaceOrderRequest.java
    │   │       └── OrderResponse.java
    │   └── messaging/
    │       └── OrderMessageListener.java
    │
    └── out/                       # Secondary/Driven Adapters
        ├── persistence/
        │   ├── PostgresOrderRepository.java
        │   └── entity/
        │       └── OrderJpaEntity.java
        ├── payment/
        │   └── StripePaymentAdapter.java
        └── notification/
            └── EmailNotificationAdapter.java
```

---

## Benefits of Hexagonal Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                 HEXAGONAL BENEFITS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. TESTABILITY                                                    │
│   ─────────────                                                     │
│   Can test core with fake adapters:                                 │
│                                                                      │
│   @Test                                                             │
│   void placeOrder_shouldSaveAndNotify() {                          │
│       // Use in-memory fakes                                        │
│       OrderRepository fakeRepo = new InMemoryOrderRepository();     │
│       PaymentGateway fakePayment = new AlwaysSuccessfulPayment();  │
│       NotificationSender fakeSender = new RecordingNotifier();     │
│                                                                      │
│       PlaceOrderUseCase useCase = new PlaceOrderService(           │
│           fakeRepo, fakePayment, fakeSender                        │
│       );                                                            │
│                                                                      │
│       // Test without real database, payment system, or email      │
│   }                                                                 │
│                                                                      │
│   2. FLEXIBILITY                                                    │
│   ─────────────                                                     │
│   Swap implementations without changing core:                       │
│   • PostgresOrderRepository → MongoOrderRepository                 │
│   • StripePaymentAdapter → PayPalPaymentAdapter                    │
│   • EmailNotifier → SmsNotifier                                    │
│                                                                      │
│   3. MULTIPLE ENTRY POINTS                                         │
│   ─────────────────────────                                         │
│   Same use case, different triggers:                                │
│   • REST API                                                        │
│   • Message Queue                                                   │
│   • CLI                                                             │
│   • Scheduled Jobs                                                  │
│                                                                      │
│   4. DEFERRED DECISIONS                                            │
│   ─────────────────────                                             │
│   Start with simple adapters, upgrade later:                        │
│   • Start: InMemoryOrderRepository                                 │
│   • Later: PostgresOrderRepository                                 │
│   • Even later: ElasticsearchOrderRepository (for search)          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Testing with Hexagonal

```java
// Unit test - use fake adapters
class PlaceOrderServiceTest {
    
    private InMemoryOrderRepository orderRepository;
    private InMemoryCustomerRepository customerRepository;
    private FakePaymentGateway paymentGateway;
    private RecordingNotificationSender notificationSender;
    private PlaceOrderService placeOrderService;
    
    @BeforeEach
    void setUp() {
        orderRepository = new InMemoryOrderRepository();
        customerRepository = new InMemoryCustomerRepository();
        paymentGateway = new FakePaymentGateway();
        notificationSender = new RecordingNotificationSender();
        
        placeOrderService = new PlaceOrderService(
            orderRepository,
            customerRepository,
            paymentGateway,
            notificationSender
        );
    }
    
    @Test
    void shouldCreateOrderAndChargePayment() {
        // Given
        Customer customer = TestCustomers.johndoe();
        customerRepository.save(customer);
        
        PlaceOrderCommand command = new PlaceOrderCommand(
            customer.getId().getValue(),
            List.of(new OrderLineData("PROD-1", 2, Money.of(50, "USD"))),
            customer.getDefaultAddress()
        );
        
        // When
        OrderId orderId = placeOrderService.execute(command);
        
        // Then
        assertThat(orderId).isNotNull();
        assertThat(orderRepository.findById(orderId)).isPresent();
        assertThat(paymentGateway.getCharges()).hasSize(1);
        assertThat(notificationSender.getSentNotifications()).hasSize(1);
    }
}

// Fake adapter for testing
class FakePaymentGateway implements PaymentGateway {
    
    private final List<ChargeRecord> charges = new ArrayList<>();
    private boolean shouldFail = false;
    
    @Override
    public PaymentResult charge(CustomerId customerId, Money amount) {
        if (shouldFail) {
            return PaymentResult.failed("Simulated failure");
        }
        charges.add(new ChargeRecord(customerId, amount));
        return PaymentResult.success(PaymentId.generate());
    }
    
    public void setShouldFail(boolean shouldFail) {
        this.shouldFail = shouldFail;
    }
    
    public List<ChargeRecord> getCharges() {
        return List.copyOf(charges);
    }
}
```

---

## Key Takeaways

1. **Ports define boundaries** - Input ports for use cases, output ports for dependencies

2. **Adapters connect to outside world** - Multiple adapters can use same port

3. **Core is isolated** - No framework dependencies in domain

4. **Easy to test** - Replace adapters with fakes/mocks

5. **Flexible** - Swap implementations without changing core

6. **Symmetric** - Driving and driven sides treated equally

---

## What's Next?

In [Chapter 20: Onion Architecture](./20-onion-architecture.md), we'll explore another layered approach that emphasizes the dependency rule even more strongly.

---

**[← Previous: Layered Architecture](./18-layered-architecture.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Onion Architecture →](./20-onion-architecture.md)**
