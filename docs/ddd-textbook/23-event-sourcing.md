# Chapter 23: Event Sourcing

> *"Capture all changes to application state as a sequence of events."*
> — Martin Fowler

---

## What is Event Sourcing?

**Event Sourcing** stores the state of an entity as a sequence of events. Instead of storing current state, you store every change that occurred, and reconstruct state by replaying events.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EVENT SOURCING                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   TRADITIONAL:                                                      │
│   ┌───────────────────────────────────────┐                        │
│   │ orders table                          │                        │
│   │ ─────────────────────────────────────│                        │
│   │ id: order-123                         │                        │
│   │ status: SHIPPED    ◄── Current state  │                        │
│   │ total: $150                           │                        │
│   └───────────────────────────────────────┘                        │
│   (History is lost)                                                 │
│                                                                      │
│   EVENT SOURCING:                                                   │
│   ┌───────────────────────────────────────┐                        │
│   │ events table (for order-123)          │                        │
│   │ ─────────────────────────────────────│                        │
│   │ 1. OrderCreated(customer: john)       │                        │
│   │ 2. ItemAdded(sku: ABC, qty: 2)        │                        │
│   │ 3. ItemAdded(sku: XYZ, qty: 1)        │                        │
│   │ 4. ItemRemoved(sku: ABC)              │                        │
│   │ 5. ItemAdded(sku: ABC, qty: 1)        │                        │
│   │ 6. OrderPlaced()                      │                        │
│   │ 7. PaymentReceived(amount: $150)      │                        │
│   │ 8. OrderShipped(tracking: TRK123)     │                        │
│   └───────────────────────────────────────┘                        │
│   (Complete history preserved)                                      │
│                                                                      │
│   Current state = Replay(Event 1..8) → Order(status: SHIPPED)      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation

```java
// Event-sourced aggregate
public class Order {
    
    private OrderId id;
    private CustomerId customerId;
    private List<OrderLine> lines = new ArrayList<>();
    private OrderStatus status;
    private Money total;
    
    // Events that occurred
    private final List<DomainEvent> uncommittedEvents = new ArrayList<>();
    
    // Reconstitute from events
    public static Order fromEvents(List<DomainEvent> events) {
        Order order = new Order();
        for (DomainEvent event : events) {
            order.apply(event);
        }
        return order;
    }
    
    // Command methods raise events
    public void place() {
        if (lines.isEmpty()) {
            throw new EmptyOrderException();
        }
        raiseEvent(new OrderPlacedEvent(this.id, this.customerId, this.total));
    }
    
    public void addLine(ProductId productId, Quantity qty, Money price) {
        raiseEvent(new ItemAddedEvent(this.id, productId, qty, price));
    }
    
    // Apply event to state
    private void apply(DomainEvent event) {
        if (event instanceof OrderCreatedEvent e) {
            this.id = e.orderId();
            this.customerId = e.customerId();
            this.status = OrderStatus.DRAFT;
        } else if (event instanceof ItemAddedEvent e) {
            this.lines.add(new OrderLine(e.productId(), e.quantity(), e.price()));
            recalculateTotal();
        } else if (event instanceof OrderPlacedEvent e) {
            this.status = OrderStatus.PLACED;
        }
        // ... other events
    }
    
    private void raiseEvent(DomainEvent event) {
        uncommittedEvents.add(event);
        apply(event);  // Apply to current state
    }
    
    public List<DomainEvent> getUncommittedEvents() {
        return List.copyOf(uncommittedEvents);
    }
}

// Event Store
public interface EventStore {
    void save(String streamId, List<DomainEvent> events, long expectedVersion);
    List<DomainEvent> load(String streamId);
}

// Repository using Event Store
public class EventSourcedOrderRepository implements OrderRepository {
    
    private final EventStore eventStore;
    
    @Override
    public Optional<Order> findById(OrderId id) {
        List<DomainEvent> events = eventStore.load(id.getValue());
        if (events.isEmpty()) return Optional.empty();
        return Optional.of(Order.fromEvents(events));
    }
    
    @Override
    public void save(Order order) {
        eventStore.save(
            order.getId().getValue(),
            order.getUncommittedEvents(),
            order.getVersion()
        );
    }
}
```

---

## Benefits and Trade-offs

```
┌─────────────────────────────────────────────────────────────────────┐
│               EVENT SOURCING TRADE-OFFS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   BENEFITS:                                                         │
│   ✓ Complete audit trail                                           │
│   ✓ Time travel (reconstruct past states)                          │
│   ✓ Debug production issues (replay events)                        │
│   ✓ Natural fit with CQRS and event-driven systems                 │
│   ✓ Easy to add new read models (replay events)                    │
│                                                                      │
│   CHALLENGES:                                                       │
│   ✗ Event versioning (schema changes)                              │
│   ✗ Eventual consistency complexity                                │
│   ✗ Learning curve                                                 │
│   ✗ Querying is harder (need projections)                         │
│   ✗ Storage growth over time                                       │
│                                                                      │
│   USE WHEN:                                                         │
│   • Audit trail is critical (finance, healthcare)                  │
│   • Need to understand "how we got here"                           │
│   • Complex domain with many state transitions                     │
│   • Already using CQRS                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

**[← Previous: CQRS](./22-cqrs.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Starting a DDD Project →](./24-starting-ddd-project.md)**
