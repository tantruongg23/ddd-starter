# Chapter 26: Testing in Domain-Driven Design

> *"Legacy code is code without tests."*
> — Michael Feathers

---

## Testing Strategy

DDD's layered architecture naturally guides your testing strategy. Each layer has different testing concerns and techniques.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DDD TESTING PYRAMID                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                      ┌──────────┐                                    │
│                     /  E2E /     \                                   │
│                    /   Integration \                                  │
│                   /  (Controllers,  \                                │
│                  /    Full Stack)     \                               │
│                 ┌─────────────────────┐                              │
│                /   Integration Tests   \                             │
│               /   (App Services with    \                            │
│              /     Real/Fake Infra)       \                          │
│             ┌─────────────────────────────┐                         │
│            /        UNIT TESTS             \                        │
│           /   (Domain Model, Value Objects, \                       │
│          /     Aggregates, Domain Services)   \                     │
│         └─────────────────────────────────────┘                     │
│                                                                      │
│   Most tests should be at the UNIT level for domain logic.          │
│   DDD makes this easy because domain objects are POJOs.             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Unit Testing Domain Objects

### Testing Value Objects

```java
class MoneyTest {
    
    @Test
    void shouldCreateMoney() {
        Money money = Money.of(100, "USD");
        assertThat(money.getAmount()).isEqualByComparingTo(new BigDecimal("100"));
        assertThat(money.getCurrency()).isEqualTo(Currency.getInstance("USD"));
    }
    
    @Test
    void shouldBeEqualByValue() {
        Money a = Money.of(100, "USD");
        Money b = Money.of(100, "USD");
        assertThat(a).isEqualTo(b);
        assertThat(a.hashCode()).isEqualTo(b.hashCode());
    }
    
    @Test
    void shouldNotBeEqualWithDifferentValues() {
        Money a = Money.of(100, "USD");
        Money b = Money.of(200, "USD");
        assertThat(a).isNotEqualTo(b);
    }
    
    @Test
    void shouldAddMoney() {
        Money a = Money.of(100, "USD");
        Money b = Money.of(50, "USD");
        Money result = a.add(b);
        assertThat(result).isEqualTo(Money.of(150, "USD"));
        // Original is unchanged (immutable)
        assertThat(a).isEqualTo(Money.of(100, "USD"));
    }
    
    @Test
    void shouldRejectDifferentCurrencies() {
        Money usd = Money.of(100, "USD");
        Money eur = Money.of(50, "EUR");
        assertThatThrownBy(() -> usd.add(eur))
            .isInstanceOf(CurrencyMismatchException.class);
    }
    
    @Test
    void shouldRejectNegativeAmount() {
        assertThatThrownBy(() -> Money.of(-1, "USD"))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
```

### Testing Entities

```java
class OrderTest {
    
    @Test
    void shouldCreateOrder() {
        CustomerId customerId = new CustomerId("cust-1");
        Order order = Order.create(customerId, Address.of("123 Main St"));
        
        assertThat(order.getId()).isNotNull();
        assertThat(order.getCustomerId()).isEqualTo(customerId);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.DRAFT);
    }
    
    @Test
    void shouldAddLineItems() {
        Order order = createDraftOrder();
        
        order.addLine(new ProductId("prod-1"), Quantity.of(2), Money.of(25, "USD"));
        
        assertThat(order.getLineCount()).isEqualTo(1);
        assertThat(order.getTotal()).isEqualTo(Money.of(50, "USD"));
    }
    
    @Test
    void shouldPlaceOrderWithItems() {
        Order order = createDraftOrder();
        order.addLine(new ProductId("prod-1"), Quantity.of(1), Money.of(10, "USD"));
        
        order.place();
        
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PLACED);
    }
    
    @Test
    void shouldNotPlaceEmptyOrder() {
        Order order = createDraftOrder();
        
        assertThatThrownBy(() -> order.place())
            .isInstanceOf(EmptyOrderException.class);
    }
    
    @Test
    void shouldCancelPlacedOrder() {
        Order order = createPlacedOrder();
        
        order.cancel(CancellationReason.customerRequest());
        
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }
    
    @Test
    void shouldNotCancelShippedOrder() {
        Order order = createShippedOrder();
        
        assertThatThrownBy(() -> order.cancel(CancellationReason.customerRequest()))
            .isInstanceOf(OrderNotCancellableException.class);
    }
    
    // Test helpers — keep them close to the tests
    private Order createDraftOrder() {
        return Order.create(new CustomerId("cust-1"), Address.of("123 Main St"));
    }
    
    private Order createPlacedOrder() {
        Order order = createDraftOrder();
        order.addLine(new ProductId("prod-1"), Quantity.of(1), Money.of(10, "USD"));
        order.place();
        return order;
    }
    
    private Order createShippedOrder() {
        Order order = createPlacedOrder();
        order.ship(new TrackingNumber("TRK-123"));
        return order;
    }
}
```

### Testing Domain Events Are Raised

```java
class OrderDomainEventsTest {
    
    @Test
    void shouldRaiseOrderPlacedEventWhenPlaced() {
        Order order = Order.create(new CustomerId("cust-1"), Address.of("123 Main St"));
        order.addLine(new ProductId("prod-1"), Quantity.of(2), Money.of(25, "USD"));
        
        order.place();
        
        List<DomainEvent> events = order.getDomainEvents();
        assertThat(events).hasSize(1);
        assertThat(events.get(0)).isInstanceOf(OrderPlacedEvent.class);
        
        OrderPlacedEvent event = (OrderPlacedEvent) events.get(0);
        assertThat(event.getOrderId()).isEqualTo(order.getId());
        assertThat(event.getTotal()).isEqualTo(Money.of(50, "USD"));
    }
    
    @Test
    void shouldRaiseCancelledEventWhenCancelled() {
        Order order = createPlacedOrder();
        
        order.cancel(CancellationReason.customerRequest());
        
        // Filter for cancel events (place event already raised)
        List<DomainEvent> cancelEvents = order.getDomainEvents().stream()
            .filter(e -> e instanceof OrderCancelledEvent)
            .toList();
        
        assertThat(cancelEvents).hasSize(1);
    }
}
```

---

## Testing Application Services

Application services are tested with **in-memory fakes** for repositories and other ports. This avoids database dependencies while still testing the orchestration logic.

### In-Memory Repository

```java
// Fake repository for testing — no database needed
public class InMemoryOrderRepository implements OrderRepository {
    
    private final Map<OrderId, Order> store = new ConcurrentHashMap<>();
    
    @Override
    public Optional<Order> findById(OrderId id) {
        return Optional.ofNullable(store.get(id));
    }
    
    @Override
    public void save(Order order) {
        store.put(order.getId(), order);
    }
    
    @Override
    public void delete(OrderId id) {
        store.remove(id);
    }
    
    // Helper methods for assertions
    public int count() {
        return store.size();
    }
    
    public List<Order> findAll() {
        return List.copyOf(store.values());
    }
}
```

### Application Service Test

```java
class PlaceOrderServiceTest {
    
    private InMemoryOrderRepository orderRepository;
    private InMemoryCustomerRepository customerRepository;
    private FakePaymentGateway paymentGateway;
    private RecordingEventPublisher eventPublisher;
    
    private PlaceOrderService placeOrderService;
    
    @BeforeEach
    void setUp() {
        orderRepository = new InMemoryOrderRepository();
        customerRepository = new InMemoryCustomerRepository();
        paymentGateway = new FakePaymentGateway();
        eventPublisher = new RecordingEventPublisher();
        
        placeOrderService = new PlaceOrderService(
            orderRepository,
            customerRepository,
            paymentGateway,
            eventPublisher
        );
        
        // Seed test data
        customerRepository.save(TestCustomers.john());
    }
    
    @Test
    void shouldPlaceOrderSuccessfully() {
        PlaceOrderCommand command = new PlaceOrderCommand(
            TestCustomers.JOHN_ID,
            List.of(new OrderLineData("PROD-1", 2, Money.of(50, "USD"))),
            TestCustomers.JOHN_ADDRESS
        );
        
        OrderId orderId = placeOrderService.execute(command);
        
        // Verify order was saved
        assertThat(orderId).isNotNull();
        Optional<Order> savedOrder = orderRepository.findById(orderId);
        assertThat(savedOrder).isPresent();
        assertThat(savedOrder.get().getStatus()).isEqualTo(OrderStatus.PLACED);
        
        // Verify events were published
        assertThat(eventPublisher.getPublishedEvents())
            .hasSize(1)
            .first()
            .isInstanceOf(OrderPlacedEvent.class);
    }
    
    @Test
    void shouldRejectOrderForUnknownCustomer() {
        PlaceOrderCommand command = new PlaceOrderCommand(
            "unknown-customer-id",
            List.of(new OrderLineData("PROD-1", 1, Money.of(10, "USD"))),
            Address.of("123 Main St")
        );
        
        assertThatThrownBy(() -> placeOrderService.execute(command))
            .isInstanceOf(CustomerNotFoundException.class);
        
        // No order should be saved
        assertThat(orderRepository.count()).isZero();
    }
    
    @Test
    void shouldHandlePaymentFailure() {
        paymentGateway.setShouldFail(true);
        
        PlaceOrderCommand command = new PlaceOrderCommand(
            TestCustomers.JOHN_ID,
            List.of(new OrderLineData("PROD-1", 1, Money.of(10, "USD"))),
            TestCustomers.JOHN_ADDRESS
        );
        
        // Depending on design: exception or result object
        assertThatThrownBy(() -> placeOrderService.execute(command))
            .isInstanceOf(PaymentFailedException.class);
    }
}

// Helper: Event publisher that records events for assertions
class RecordingEventPublisher implements DomainEventPublisher {
    
    private final List<DomainEvent> publishedEvents = new ArrayList<>();
    
    @Override
    public void publish(DomainEvent event) {
        publishedEvents.add(event);
    }
    
    @Override
    public void publish(Collection<DomainEvent> events) {
        publishedEvents.addAll(events);
    }
    
    public List<DomainEvent> getPublishedEvents() {
        return List.copyOf(publishedEvents);
    }
}
```

---

## Testing Domain Services

```java
class PricingServiceTest {
    
    private PricingService pricingService = new PricingService();
    
    @Test
    void shouldCalculateBasePriceForRegularCustomer() {
        Product product = TestProducts.laptop();  // $999
        Customer customer = TestCustomers.regularCustomer();
        Quantity quantity = Quantity.of(2);
        
        Money price = pricingService.calculatePrice(product, customer, quantity);
        
        assertThat(price).isEqualTo(Money.of(1998, "USD"));
    }
    
    @Test
    void shouldApplyVIPDiscount() {
        Product product = TestProducts.laptop();  // $999
        Customer customer = TestCustomers.vipCustomer();  // 10% discount
        Quantity quantity = Quantity.of(1);
        
        Money price = pricingService.calculatePrice(product, customer, quantity);
        
        // 999 * 0.9 = 899.10
        assertThat(price).isEqualTo(Money.of(new BigDecimal("899.10"), "USD"));
    }
}
```

---

## Architecture Tests with ArchUnit

ArchUnit enforces architectural rules at compile/test time, ensuring your layered architecture rules are not violated.

```java
// Enforce DDD architectural boundaries
class DddArchitectureTest {
    
    private final JavaClasses importedClasses = new ClassFileImporter()
        .importPackages("com.company.ordering");
    
    @Test
    void domainShouldNotDependOnApplication() {
        noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("..application..")
            .check(importedClasses);
    }
    
    @Test
    void domainShouldNotDependOnInfrastructure() {
        noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("..infrastructure..")
            .check(importedClasses);
    }
    
    @Test
    void applicationShouldNotDependOnInfrastructure() {
        noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat()
            .resideInAPackage("..infrastructure..")
            .check(importedClasses);
    }
    
    @Test
    void domainShouldNotUseSpringAnnotations() {
        noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("org.springframework..")
            .check(importedClasses);
    }
    
    @Test
    void aggregatesShouldOnlyBeAccessedViaRepositories() {
        // Enforce that infrastructure persistence entities
        // are not used directly by application services
        noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat()
            .resideInAPackage("..infrastructure.persistence.entity..")
            .check(importedClasses);
    }
}
```

---

## Integration Testing

### Repository Integration Tests

These tests verify that the repository implementation works correctly with a real (or testcontainer-based) database.

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Testcontainers
class JpaOrderRepositoryIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Autowired
    private JpaOrderRepository orderRepository;
    
    @Test
    void shouldSaveAndRetrieveOrder() {
        // Given
        Order order = Order.create(new CustomerId("cust-1"), Address.of("123 Main St"));
        order.addLine(new ProductId("prod-1"), Quantity.of(2), Money.of(50, "USD"));
        order.place();
        
        // When
        orderRepository.save(order);
        Optional<Order> retrieved = orderRepository.findById(order.getId());
        
        // Then
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(OrderStatus.PLACED);
        assertThat(retrieved.get().getTotal()).isEqualTo(Money.of(100, "USD"));
    }
    
    @Test
    void shouldReturnEmptyForNonExistentOrder() {
        Optional<Order> result = orderRepository.findById(new OrderId("non-existent"));
        assertThat(result).isEmpty();
    }
}
```

---

## Testing Best Practices

```
┌─────────────────────────────────────────────────────────────────────┐
│                 DDD TESTING BEST PRACTICES                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. TEST DOMAIN OBJECTS EXTENSIVELY                                │
│      • They contain the business logic                              │
│      • They are pure POJOs — fast and easy to test                 │
│      • Test invariants, state transitions, and domain rules        │
│                                                                      │
│   2. USE IN-MEMORY FAKES, NOT MOCKS                                │
│      • Fakes implement the real interface                          │
│      • They behave like real implementations                       │
│      • Tests are less brittle than mock-based tests                │
│                                                                      │
│   3. CREATE TEST FIXTURES/BUILDERS                                  │
│      • TestCustomers.john(), TestProducts.laptop()                 │
│      • Keep test setup readable and reusable                       │
│      • Use the Builder pattern for complex aggregates              │
│                                                                      │
│   4. NAME TESTS IN DOMAIN LANGUAGE                                  │
│      • shouldPlaceOrderWithValidItems()                            │
│      • shouldRejectEmptyOrder()                                    │
│      • shouldApplyVIPDiscount()                                    │
│                                                                      │
│   5. TEST EVENTS                                                    │
│      • Verify events are raised for significant state changes      │
│      • Test event handlers in isolation                            │
│      • Test event content (not just event type)                    │
│                                                                      │
│   6. ENFORCE ARCHITECTURE                                           │
│      • Use ArchUnit to verify dependency rules                     │
│      • Prevent domain from depending on infrastructure             │
│      • Run architecture tests in CI/CD                             │
│                                                                      │
│   AVOID:                                                            │
│   ✗ Testing getters/setters (no business value)                    │
│   ✗ Over-mocking (masks integration issues)                        │
│   ✗ Testing private methods (test via public API)                  │
│   ✗ Coupling tests to implementation details                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Domain objects are the easiest to test** — pure logic, no framework dependencies

2. **Use in-memory fakes** for repositories and ports in application service tests

3. **Test state transitions and invariants** — these are the heart of your domain

4. **Verify domain events** are raised for significant business occurrences

5. **Use ArchUnit** to enforce architectural boundaries automatically

6. **Name tests in domain language** — tests become executable specifications

---

**[← Previous: Event Storming](./25-event-storming.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Appendix A →](./appendix-a-glossary.md)**
