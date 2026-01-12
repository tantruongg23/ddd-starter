# Chapter 18: Layered Architecture in DDD

> *"Isolate the domain layer from other functionality of the system."*
> — Eric Evans

---

## The Classic Layered Architecture

DDD traditionally recommends a layered architecture to separate concerns and protect the domain model:

```
┌─────────────────────────────────────────────────────────────────────┐
│                   LAYERED ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   USER INTERFACE LAYER                       │   │
│   │                                                              │   │
│   │  • Controllers (REST, GraphQL)                              │   │
│   │  • Views and Templates                                      │   │
│   │  • Request/Response DTOs                                    │   │
│   │  • Input validation                                         │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  APPLICATION LAYER                           │   │
│   │                                                              │   │
│   │  • Application Services (Use Cases)                         │   │
│   │  • Commands and Command Handlers                            │   │
│   │  • Transaction management                                   │   │
│   │  • Security/Authorization                                   │   │
│   │  • Orchestration (no business logic)                        │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     DOMAIN LAYER                             │   │
│   │                                                              │   │
│   │  • Entities and Aggregates                                  │   │
│   │  • Value Objects                                            │   │
│   │  • Domain Events                                            │   │
│   │  • Domain Services                                          │   │
│   │  • Repository Interfaces                                    │   │
│   │  • Business Rules and Logic                                 │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                 INFRASTRUCTURE LAYER                         │   │
│   │                                                              │   │
│   │  • Repository Implementations (JPA, MongoDB)                │   │
│   │  • External Service Integrations                            │   │
│   │  • Message Queues                                           │   │
│   │  • File Storage                                             │   │
│   │  • Email/SMS Services                                       │   │
│   │  • Caching                                                  │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Dependency Rules

### The Golden Rule: Dependencies Point Inward

```
┌─────────────────────────────────────────────────────────────────────┐
│                   DEPENDENCY DIRECTION                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                     ┌──────────────┐                                │
│                     │     UI       │                                │
│                     └──────┬───────┘                                │
│                            │ depends on                             │
│                            ▼                                         │
│                     ┌──────────────┐                                │
│                     │ Application  │                                │
│                     └──────┬───────┘                                │
│                            │ depends on                             │
│                            ▼                                         │
│                     ┌──────────────┐                                │
│                     │   Domain     │  ◄── The heart (no deps!)     │
│                     └──────────────┘                                │
│                            ▲                                         │
│                            │ implements interfaces from             │
│                     ┌──────┴───────┐                                │
│                     │Infrastructure│                                │
│                     └──────────────┘                                │
│                                                                      │
│   KEY INSIGHT: Domain defines interfaces, Infrastructure            │
│   implements them. This is DEPENDENCY INVERSION.                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### What Each Layer Knows

| Layer | Knows About | Doesn't Know About |
|-------|-------------|-------------------|
| UI | Application, Domain | Infrastructure |
| Application | Domain | UI, Infrastructure |
| Domain | Nothing! | Everything else |
| Infrastructure | Domain (interfaces) | UI, Application |

---

## Project Structure

```
src/main/java/com/company/ordering/
│
├── interfaces/                    # UI / Presentation Layer
│   ├── rest/
│   │   ├── OrderController.java
│   │   ├── dto/
│   │   │   ├── PlaceOrderRequest.java
│   │   │   ├── OrderResponse.java
│   │   │   └── ErrorResponse.java
│   │   └── mapper/
│   │       └── OrderDtoMapper.java
│   └── messaging/
│       └── OrderEventListener.java
│
├── application/                   # Application Layer
│   ├── OrderApplicationService.java
│   ├── commands/
│   │   ├── PlaceOrderCommand.java
│   │   └── CancelOrderCommand.java
│   └── handlers/
│       ├── PlaceOrderHandler.java
│       └── CancelOrderHandler.java
│
├── domain/                        # Domain Layer
│   ├── model/
│   │   ├── Order.java             # Aggregate Root
│   │   ├── OrderLine.java         # Entity
│   │   ├── OrderId.java           # Value Object
│   │   ├── OrderStatus.java       # Value Object (enum)
│   │   └── Money.java             # Value Object
│   ├── repository/
│   │   └── OrderRepository.java   # Interface
│   ├── service/
│   │   └── PricingService.java    # Domain Service
│   └── event/
│       ├── OrderPlacedEvent.java
│       └── OrderCancelledEvent.java
│
└── infrastructure/                # Infrastructure Layer
    ├── persistence/
    │   ├── JpaOrderRepository.java
    │   ├── entity/
    │   │   ├── OrderEntity.java
    │   │   └── OrderLineEntity.java
    │   └── mapper/
    │       └── OrderPersistenceMapper.java
    ├── messaging/
    │   └── RabbitMqEventPublisher.java
    └── external/
        └── StripePaymentGateway.java
```

---

## Layer Implementation Examples

### UI Layer

```java
// interfaces/rest/OrderController.java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private final OrderApplicationService orderService;
    private final OrderDtoMapper mapper;
    
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request) {
        
        // Transform DTO to Command
        PlaceOrderCommand command = mapper.toCommand(request);
        
        // Delegate to application layer
        OrderId orderId = orderService.placeOrder(command);
        
        // Transform result to DTO
        return ResponseEntity
            .created(URI.create("/api/orders/" + orderId.getValue()))
            .body(new OrderResponse(orderId.getValue(), "Order placed successfully"));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailsResponse> getOrder(@PathVariable String id) {
        OrderDetails details = orderService.getOrderDetails(new OrderId(id));
        return ResponseEntity.ok(mapper.toResponse(details));
    }
}

// interfaces/rest/dto/PlaceOrderRequest.java
public record PlaceOrderRequest(
    @NotBlank String customerId,
    @NotEmpty List<OrderLineRequest> items,
    @NotBlank String shippingAddressId
) {}
```

### Application Layer

```java
// application/OrderApplicationService.java
@Service
public class OrderApplicationService {
    
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final PricingService pricingService;
    private final DomainEventPublisher eventPublisher;
    
    @Transactional
    public OrderId placeOrder(PlaceOrderCommand command) {
        // Load domain objects
        Customer customer = customerRepository.findById(
            new CustomerId(command.customerId())
        ).orElseThrow(() -> new CustomerNotFoundException(command.customerId()));
        
        // Create aggregate using domain
        Order order = Order.create(customer.getId(), command.shippingAddress());
        
        // Domain logic
        for (var item : command.items()) {
            Money price = pricingService.calculatePrice(
                item.productId(), customer, item.quantity()
            );
            order.addLine(item.productId(), item.name(), item.quantity(), price);
        }
        
        order.place();
        
        // Persist
        orderRepository.save(order);
        
        // Publish events
        eventPublisher.publish(order.getDomainEvents());
        
        return order.getId();
    }
}
```

### Domain Layer

```java
// domain/model/Order.java
public class Order extends AggregateRoot<OrderId> {
    
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> lines;
    private ShippingAddress shippingAddress;
    private OrderStatus status;
    private Money total;
    
    // Domain logic - NO infrastructure dependencies
    public void place() {
        ensureDraft();
        ensureHasLines();
        
        this.status = OrderStatus.PLACED;
        raise(new OrderPlacedEvent(this.id, this.customerId, this.total));
    }
    
    public void addLine(ProductId productId, String name, Quantity qty, Money price) {
        ensureDraft();
        this.lines.add(new OrderLine(productId, name, qty, price));
        recalculateTotal();
    }
}

// domain/repository/OrderRepository.java
public interface OrderRepository {
    Optional<Order> findById(OrderId id);
    void save(Order order);
    // Interface only - implementation in infrastructure
}
```

### Infrastructure Layer

```java
// infrastructure/persistence/JpaOrderRepository.java
@Repository
public class JpaOrderRepository implements OrderRepository {
    
    private final OrderJpaRepository jpaRepository;
    private final OrderPersistenceMapper mapper;
    
    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }
    
    @Override
    public void save(Order order) {
        OrderEntity entity = mapper.toEntity(order);
        jpaRepository.save(entity);
    }
}

// infrastructure/persistence/entity/OrderEntity.java
@Entity
@Table(name = "orders")
public class OrderEntity {
    @Id
    private String id;
    
    private String customerId;
    
    @Enumerated(EnumType.STRING)
    private String status;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLineEntity> lines;
    
    // JPA annotations, getters, setters...
}
```

---

## Enforcing Boundaries with ArchUnit

```java
@AnalyzeClasses(packages = "com.company.ordering")
public class ArchitectureTest {
    
    @ArchTest
    static final ArchRule domain_should_not_depend_on_other_layers =
        noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAnyPackage(
                "..application..",
                "..interfaces..",
                "..infrastructure.."
            );
    
    @ArchTest
    static final ArchRule application_should_not_depend_on_infrastructure =
        noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat()
            .resideInAPackage("..infrastructure..");
    
    @ArchTest
    static final ArchRule interfaces_should_only_use_application_and_domain =
        classes()
            .that().resideInAPackage("..interfaces..")
            .should().onlyDependOnClassesThat()
            .resideInAnyPackage(
                "..interfaces..",
                "..application..",
                "..domain..",
                "java..",
                "javax..",
                "org.springframework.."
            );
}
```

---

## Key Takeaways

1. **Domain layer has no dependencies** - It's the pure business logic

2. **Dependencies point inward** - Outer layers depend on inner layers

3. **Dependency inversion for infrastructure** - Domain defines interfaces

4. **Each layer has a specific responsibility** - Don't mix concerns

5. **Protect the domain** - It's the most valuable part

---

## What's Next?

In [Chapter 19: Hexagonal Architecture](./19-hexagonal-architecture.md), we'll explore a more flexible approach that treats all external interfaces equally.

---

**[← Previous: Factories](./17-factories.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Hexagonal Architecture →](./19-hexagonal-architecture.md)**
