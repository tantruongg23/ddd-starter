# Chapter 12: Domain Events

> *"Model information about activity in the domain as a series of discrete events."*
> — Eric Evans

---

## What is a Domain Event?

A **Domain Event** is something significant that happened in the domain that domain experts care about. It captures the fact that something occurred, along with all the relevant data about what happened.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DOMAIN EVENTS                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Domain Events represent:                                          │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                              │   │
│   │  "OrderPlaced"     - A customer submitted an order          │   │
│   │  "PaymentReceived" - Payment was successfully processed     │   │
│   │  "ItemShipped"     - A package left the warehouse           │   │
│   │  "AccountLocked"   - An account was locked for security     │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Key characteristics:                                              │
│                                                                      │
│   • Named in PAST TENSE (something that happened)                   │
│   • IMMUTABLE (history doesn't change)                              │
│   • Contains all data needed to understand what happened            │
│   • Part of the UBIQUITOUS LANGUAGE                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Why Domain Events?

### Decoupling Aggregates

```
┌─────────────────────────────────────────────────────────────────────┐
│                WITHOUT DOMAIN EVENTS                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Order Service directly calls all dependent services:              │
│                                                                      │
│   ┌─────────────┐                                                   │
│   │   Order     │─────► InventoryService.reserve()                 │
│   │   Service   │─────► PaymentService.capture()                   │
│   │             │─────► ShippingService.prepare()                  │
│   │             │─────► NotificationService.send()                 │
│   │             │─────► AnalyticsService.track()                   │
│   │             │─────► LoyaltyService.awardPoints()               │
│   └─────────────┘                                                   │
│                                                                      │
│   Problems:                                                         │
│   • Order knows about ALL downstream services                       │
│   • Adding new reaction = changing Order code                       │
│   • Single transaction with ALL services                            │
│   • One failure = entire operation fails                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                 WITH DOMAIN EVENTS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Order publishes event, handlers react:                            │
│                                                                      │
│   ┌─────────────┐                                                   │
│   │   Order     │──── raises ────► OrderPlacedEvent                │
│   │   Service   │                        │                          │
│   └─────────────┘                        │                          │
│                                          ▼                          │
│                                   ┌──────────────┐                  │
│                      ┌────────────│ Event Bus    │────────────┐     │
│                      │            └──────────────┘            │     │
│                      ▼                   ▼                    ▼     │
│               ┌──────────┐        ┌──────────┐        ┌──────────┐ │
│               │Inventory │        │Shipping  │        │Analytics │ │
│               │Handler   │        │Handler   │        │Handler   │ │
│               └──────────┘        └──────────┘        └──────────┘ │
│                                                                      │
│   Benefits:                                                         │
│   • Order only knows about the event                               │
│   • Add new handlers without changing Order                        │
│   • Each handler can be separate transaction                        │
│   • Handlers can fail independently                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementing Domain Events

### Event Structure

```java
// Base interface for all domain events
public interface DomainEvent {
    Instant occurredAt();
    String eventType();
}

// Abstract base with common properties
public abstract class BaseDomainEvent implements DomainEvent {
    private final String eventId;
    private final Instant occurredAt;
    
    protected BaseDomainEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.occurredAt = Instant.now();
    }
    
    public String getEventId() { return eventId; }
    
    @Override
    public Instant occurredAt() { return occurredAt; }
    
    @Override
    public String eventType() {
        return this.getClass().getSimpleName();
    }
}
```

### Example Domain Events (Internal)

Internal events use **rich domain types** and are handled within the same bounded context:

```java
// Internal events - use rich domain types
public class OrderPlacedEvent extends BaseDomainEvent {
    private final OrderId orderId;
    private final CustomerId customerId;
    private final List<OrderLine> lines;
    private final Money total;
    
    public OrderPlacedEvent(OrderId orderId, CustomerId customerId, 
                           List<OrderLine> lines, Money total) {
        super();
        this.orderId = orderId;
        this.customerId = customerId;
        this.lines = List.copyOf(lines);
        this.total = total;
    }
    
    // Getters...
}

public class OrderCancelledEvent extends BaseDomainEvent {
    private final OrderId orderId;
    private final CancellationReason reason;
    
    public OrderCancelledEvent(OrderId orderId, CancellationReason reason) {
        super();
        this.orderId = orderId;
        this.reason = reason;
    }
}

public class PaymentReceivedEvent extends BaseDomainEvent {
    private final PaymentId paymentId;
    private final OrderId orderId;
    private final Money amount;
    private final PaymentMethod paymentMethod;
    
    public PaymentReceivedEvent(PaymentId paymentId, OrderId orderId, 
                               Money amount, PaymentMethod method) {
        super();
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.amount = amount;
        this.paymentMethod = method;
    }
}

// Use Java Records for concise events (Java 16+)
public record CustomerRegisteredEvent(
    String eventId,
    Instant occurredAt,
    CustomerId customerId,
    Email email,
    Name name
) implements DomainEvent {
    
    public CustomerRegisteredEvent(CustomerId customerId, Email email, Name name) {
        this(
            UUID.randomUUID().toString(),
            Instant.now(),
            customerId,
            email,
            name
        );
    }
    
    @Override
    public String eventType() {
        return "CustomerRegistered";
    }
}
```

---

## Raising Events from Aggregates

### Collecting Events Pattern

```java
public abstract class AggregateRoot<ID> {
    
    private final List<DomainEvent> domainEvents = new ArrayList<>();
    
    protected void raise(DomainEvent event) {
        this.domainEvents.add(event);
    }
    
    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }
    
    public void clearDomainEvents() {
        this.domainEvents.clear();
    }
}

// Usage in Order aggregate
public class Order extends AggregateRoot<OrderId> {
    
    public void place() {
        ensureDraft();
        ensureHasLines();
        
        this.status = OrderStatus.PLACED;
        this.placedAt = LocalDateTime.now();
        
        // Raise event - collected but not published yet
        raise(new OrderPlacedEvent(
            this.id,
            this.customerId,
            this.getLineSnapshots(),
            this.total
        ));
    }
    
    public void cancel(CancellationReason reason) {
        ensureCancellable();
        
        this.status = OrderStatus.CANCELLED;
        
        raise(new OrderCancelledEvent(this.id, reason));
    }
}
```

### Publishing Events

```java
// Application Service publishes after save
@Service
public class OrderApplicationService {
    
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    
    @Transactional
    public OrderId placeOrder(PlaceOrderCommand command) {
        Order order = // ... create order
        
        order.place();
        
        // Save aggregate
        orderRepository.save(order);
        
        // Publish collected events using Spring's ApplicationEventPublisher
        // These will be handled by @TransactionalEventListener (see below)
        order.getDomainEvents().forEach(applicationEventPublisher::publishEvent);
        order.clearDomainEvents();
        
        return order.getId();
    }
}

// Event publisher interface
public interface DomainEventPublisher {
    void publish(DomainEvent event);
    void publish(Collection<DomainEvent> events);
}

// Spring implementation using @TransactionalEventListener for safe publishing
@Component
public class SpringDomainEventPublisher implements DomainEventPublisher {
    
    private final ApplicationEventPublisher applicationEventPublisher;
    
    @Override
    public void publish(DomainEvent event) {
        applicationEventPublisher.publishEvent(event);
    }
    
    @Override
    public void publish(Collection<DomainEvent> events) {
        events.forEach(this::publish);
    }
}
```

### Reliable Event Publishing

The pattern above publishes events _during_ the transaction. If the transaction rolls back after events are dispatched, consumers may process events for changes that never persisted. There are two main solutions:

#### Option 1: `@TransactionalEventListener` (Recommended for In-Process)

```java
// Events are delivered ONLY after the transaction commits successfully
@Component
public class SafeInventoryEventHandler {
    
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(OrderPlacedEvent event) {
        // This only runs if the transaction committed
        inventoryService.reserve(event.getOrderId(), event.getLines());
    }
}
```

#### Option 2: Transactional Outbox Pattern (For Cross-Service)

```
┌─────────────────────────────────────────────────────────────────────┐
│                   TRANSACTIONAL OUTBOX                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Same Transaction:                                                 │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │  1. Save aggregate to database                             │    │
│   │  2. Write event to OUTBOX table (same TX)                  │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│   Separate Process:                                                 │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │  3. Poller/CDC reads outbox table                          │    │
│   │  4. Publishes event to message broker                      │    │
│   │  5. Marks outbox row as published                          │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│   Guarantee: Event is published if and only if state was saved.    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// Outbox-based event publisher
@Component
public class OutboxEventPublisher implements DomainEventPublisher {
    
    private final OutboxRepository outboxRepository;
    
    @Override
    public void publish(DomainEvent event) {
        // Store event in outbox table — same transaction as aggregate save
        outboxRepository.save(new OutboxEntry(
            event.getEventId(),
            event.eventType(),
            serialize(event),
            event.occurredAt()
        ));
        // A separate poller or CDC process picks up outbox entries
        // and publishes them to the message broker
    }
}
```

---

## Handling Events

### Event Handlers

```java
// Inventory handler - reserves stock
@Component
public class InventoryEventHandler {
    
    private final InventoryService inventoryService;
    
    @EventListener
    public void on(OrderPlacedEvent event) {
        for (OrderLineSnapshot line : event.getLines()) {
            inventoryService.reserve(
                new Sku(line.getSku()),
                Quantity.of(line.getQuantity()),
                new OrderId(event.getOrderId())
            );
        }
    }
    
    @EventListener
    public void on(OrderCancelledEvent event) {
        inventoryService.releaseReservation(new OrderId(event.getOrderId()));
    }
}

// Notification handler - sends emails
@Component
public class NotificationEventHandler {
    
    private final EmailService emailService;
    private final CustomerRepository customerRepository;
    
    @EventListener
    public void on(OrderPlacedEvent event) {
        Customer customer = customerRepository.findById(
            new CustomerId(event.getCustomerId())
        );
        
        emailService.sendOrderConfirmation(
            customer.getEmail(),
            event.getOrderId(),
            event.getTotalAmount()
        );
    }
    
    @EventListener
    public void on(OrderShippedEvent event) {
        // Send shipping notification
        emailService.sendShippingNotification(
            event.getCustomerEmail(),
            event.getTrackingNumber()
        );
    }
}

// Analytics handler - tracks metrics
@Component
public class AnalyticsEventHandler {
    
    private final AnalyticsService analytics;
    
    @EventListener
    public void on(OrderPlacedEvent event) {
        analytics.track("order_placed", Map.of(
            "order_id", event.getOrderId(),
            "amount", event.getTotalAmount(),
            "item_count", event.getLines().size()
        ));
    }
}
```

### Async Event Handling

```java
// Async handler for non-critical operations
@Component
public class AsyncEventHandler {
    
    @Async
    @EventListener
    public void on(OrderPlacedEvent event) {
        // Send to external analytics - can fail without affecting order
        externalAnalytics.track(event);
    }
    
    @Async
    @EventListener  
    public void on(CustomerRegisteredEvent event) {
        // Send welcome email - async, can retry
        welcomeEmailService.send(event.getEmail(), event.getName());
    }
}
```

---

## Event Patterns

### Internal vs External Events

```
┌─────────────────────────────────────────────────────────────────────┐
│              INTERNAL VS EXTERNAL EVENTS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   INTERNAL EVENTS                    EXTERNAL EVENTS                │
│   (Within bounded context)           (Published outside)            │
│                                                                      │
│   • Rich domain objects              • Primitive types only         │
│   • Can reference entities           • IDs as strings               │
│   • Can change freely                • Versioned, stable schema     │
│   • In-process handling              • Message queue/broker         │
│                                                                      │
│   ┌─────────────────────┐            ┌─────────────────────┐       │
│   │ OrderPlacedEvent    │            │ OrderPlacedEvent    │       │
│   │ (Internal)          │────────────│ (External/Public)   │       │
│   │                     │            │                     │       │
│   │ orderId: OrderId    │  Translate │ orderId: String     │       │
│   │ customer: Customer  │  ────────► │ customerId: String  │       │
│   │ lines: List<Line>   │            │ lines: List<LineDto>│       │
│   │ total: Money        │            │ totalAmount: decimal│       │
│   └─────────────────────┘            │ currency: String    │       │
│                                      │ version: "1.0"      │       │
│                                      └─────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// Internal event - rich types
public class OrderPlacedEvent extends BaseDomainEvent {
    private final OrderId orderId;
    private final CustomerId customerId;
    private final List<OrderLine> lines;
    private final Money total;
}

// External event - for message queue
public record OrderPlacedIntegrationEvent(
    String eventId,
    String eventType,
    String version,
    Instant timestamp,
    OrderPlacedPayload payload
) {
    public static OrderPlacedIntegrationEvent from(OrderPlacedEvent event) {
        return new OrderPlacedIntegrationEvent(
            event.getEventId(),
            "order.placed",
            "1.0",
            event.getOccurredAt(),
            new OrderPlacedPayload(
                event.getOrderId().getValue(),
                event.getCustomerId().getValue(),
                event.getLines().stream()
                    .map(OrderLineDto::from)
                    .toList(),
                event.getTotal().getAmount().toString(),
                event.getTotal().getCurrency().getCurrencyCode()
            )
        );
    }
}
```

### Event Sourcing Preview

Events can be the source of truth:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EVENT SOURCING                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Instead of storing current state, store ALL events:               │
│                                                                      │
│   Events:                            Current State:                 │
│   ─────────────────────────────────  ──────────────────────        │
│   1. OrderCreated(id, customer)      │                              │
│   2. ItemAdded(sku: ABC, qty: 2)     │  Order:                      │
│   3. ItemAdded(sku: XYZ, qty: 1)     │    id: order-123             │
│   4. ItemRemoved(sku: ABC)           │    items: [{XYZ, 1}]         │
│   5. ItemAdded(sku: ABC, qty: 1)  ─► │    status: PLACED            │
│   6. OrderPlaced()                   │    total: $150               │
│   ─────────────────────────────────  │                              │
│                                      └──────────────────────        │
│   "Replay" events to get current state                              │
│                                                                      │
│   Benefits:                                                         │
│   • Complete audit trail                                            │
│   • Can rebuild state at any point                                  │
│   • Natural fit with DDD events                                     │
│                                                                      │
│   (Covered in detail in Chapter 23)                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Event Design Guidelines

### Naming Conventions

```
┌─────────────────────────────────────────────────────────────────────┐
│                 EVENT NAMING GUIDELINES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ✓ Use past tense (something that HAPPENED)                        │
│     • OrderPlaced, not PlaceOrder                                   │
│     • PaymentReceived, not ReceivePayment                           │
│     • CustomerRegistered, not RegisterCustomer                      │
│                                                                      │
│   ✓ Use domain language                                             │
│     • PolicyBound (insurance term)                                  │
│     • ClaimFiled (insurance term)                                   │
│     • TradeExecuted (finance term)                                  │
│                                                                      │
│   ✓ Be specific about what happened                                 │
│     • CustomerAddressChanged, not CustomerUpdated                   │
│     • OrderItemRemoved, not OrderModified                           │
│     • AccountSuspended, not AccountStatusChanged                    │
│                                                                      │
│   ✗ Don't use technical names                                       │
│     • Not: OrderEntityPersisted                                     │
│     • Not: OrderRowInserted                                         │
│     • Not: OrderSaved                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Event Content

```java
// ✓ Include enough data to understand what happened
public record OrderPlacedEvent(
    String eventId,
    Instant occurredAt,
    
    // What order?
    String orderId,
    
    // Who placed it?
    String customerId,
    
    // What's in it?
    List<OrderLineSnapshot> lines,
    
    // Financial summary
    BigDecimal subtotal,
    BigDecimal tax,
    BigDecimal total,
    String currency,
    
    // Context
    String shippingAddressId,
    String promotionCode  // if any was applied
) {}

// ✗ Don't include just IDs (requires lookup)
public record BadOrderPlacedEvent(
    String orderId  // Forces consumers to query for details
) {}

// ✗ Don't include entire aggregates (too coupled)
public record BadOrderPlacedEvent(
    Order order,       // Whole aggregate - tight coupling
    Customer customer  // Related aggregate - very bad
) {}
```

---

## Key Takeaways

1. **Events capture what happened** - Past tense, immutable facts

2. **Events decouple aggregates** - Publish facts, let others react

3. **Events enable eventual consistency** - Across aggregate boundaries

4. **Name events in domain language** - Part of Ubiquitous Language

5. **Include sufficient data** - Handlers shouldn't need to query

6. **Separate internal and external events** - Different needs, different schemas

---

## What's Next?

In [Chapter 13: Commands and Command Handlers](./13-commands.md), we'll explore how to express intentions to change the system and handle them appropriately.

---

**[← Previous: Aggregates](./11-aggregates.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Commands →](./13-commands.md)**
