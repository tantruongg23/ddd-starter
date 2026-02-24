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

## Snapshots

For aggregates with many events, replaying all events can become slow. **Snapshots** periodically save the aggregate's current state:

```java
// Snapshot-aware repository
public class EventSourcedOrderRepository implements OrderRepository {
    
    private final EventStore eventStore;
    private final SnapshotStore snapshotStore;
    
    @Override
    public Optional<Order> findById(OrderId id) {
        String streamId = id.getValue();
        
        // 1. Try to load from snapshot first
        Optional<Snapshot> snapshot = snapshotStore.findLatest(streamId);
        
        Order order;
        long fromVersion;
        
        if (snapshot.isPresent()) {
            // Restore from snapshot, then replay only newer events
            order = (Order) snapshot.get().getState();
            fromVersion = snapshot.get().getVersion() + 1;
        } else {
            order = new Order();
            fromVersion = 0;
        }
        
        // 2. Replay events since snapshot
        List<DomainEvent> events = eventStore.loadFrom(streamId, fromVersion);
        if (events.isEmpty() && snapshot.isEmpty()) return Optional.empty();
        
        for (DomainEvent event : events) {
            order.apply(event);
        }
        
        return Optional.of(order);
    }
    
    @Override
    public void save(Order order) {
        eventStore.save(
            order.getId().getValue(),
            order.getUncommittedEvents(),
            order.getVersion()
        );
        
        // Create snapshot every N events
        if (order.getVersion() % 100 == 0) {
            snapshotStore.save(new Snapshot(
                order.getId().getValue(),
                order.getVersion(),
                order  // serialized state
            ));
        }
    }
}
```

---

## Event Versioning

As your domain evolves, event schemas change. You need strategies to handle old events:

```java
// Strategy 1: Upcasters - transform old events to new format
public interface EventUpcaster {
    boolean canUpcast(String eventType, int version);
    DomainEvent upcast(RawEvent rawEvent);
}

// Example: OrderCreated v1 → v2 (added shippingAddress field)
public class OrderCreatedV1ToV2Upcaster implements EventUpcaster {
    
    @Override
    public boolean canUpcast(String eventType, int version) {
        return "OrderCreated".equals(eventType) && version == 1;
    }
    
    @Override
    public DomainEvent upcast(RawEvent raw) {
        // v1 didn't have shippingAddress, default to "UNKNOWN"
        return new OrderCreatedEvent(
            raw.get("orderId"),
            raw.get("customerId"),
            raw.getOrDefault("shippingAddress", "UNKNOWN")
        );
    }
}

// Strategy 2: Weak Schema - tolerate missing fields
public class OrderCreatedEvent {
    // New field added in v2, nullable for backward compatibility
    @Nullable
    private final String shippingAddress;
}
```

---

## Concurrency and Version Conflicts

The `expectedVersion` parameter in `EventStore.save()` provides **optimistic concurrency control**:

```java
public interface EventStore {
    /**
     * @param expectedVersion The version this aggregate was at when loaded.
     *                        If another process saved events since then,
     *                        this will throw ConcurrencyException.
     */
    void save(String streamId, List<DomainEvent> events, long expectedVersion);
    List<DomainEvent> load(String streamId);
}

// What happens on conflict:
// 1. Process A loads Order (version 5)
// 2. Process B loads Order (version 5)
// 3. Process A saves new events (expectedVersion=5) → succeeds, version=6
// 4. Process B saves new events (expectedVersion=5) → FAILS! 
//    Throws ConcurrencyException because version is now 6

// Handling the conflict:
@Service
public class OrderCommandHandler {
    
    private final EventSourcedOrderRepository repository;
    private static final int MAX_RETRIES = 3;
    
    @Transactional
    public void handle(AddItemCommand command) {
        int attempt = 0;
        while (attempt < MAX_RETRIES) {
            try {
                Order order = repository.findById(command.orderId())
                    .orElseThrow();
                order.addLine(command.productId(), command.quantity(), command.price());
                repository.save(order);
                return; // Success
            } catch (ConcurrencyException e) {
                attempt++;
                if (attempt >= MAX_RETRIES) throw e;
                // Retry: reload and re-apply
            }
        }
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
│   ✗ Storage growth over time (mitigate with snapshots)             │
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
