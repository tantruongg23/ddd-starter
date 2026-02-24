# Chapter 22: CQRS Pattern

> *"Use a different model to update information than the model you use to read information."*
> — Greg Young

---

## What is CQRS?

**CQRS** (Command Query Responsibility Segregation) separates read and write operations into different models. Commands modify state; Queries read state.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CQRS PATTERN                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                         CLIENT                                       │
│                        /       \                                     │
│                       /         \                                    │
│               Commands           Queries                             │
│                  │                  │                                │
│                  ▼                  ▼                                │
│   ┌─────────────────────┐  ┌─────────────────────┐                  │
│   │    WRITE SIDE       │  │    READ SIDE        │                  │
│   │                     │  │                     │                  │
│   │  ┌───────────────┐  │  │  ┌───────────────┐  │                  │
│   │  │Command Handler│  │  │  │ Query Handler │  │                  │
│   │  └───────┬───────┘  │  │  └───────┬───────┘  │                  │
│   │          │          │  │          │          │                  │
│   │  ┌───────▼───────┐  │  │  ┌───────▼───────┐  │                  │
│   │  │ Domain Model  │  │  │  │  Read Model   │  │                  │
│   │  │ (Aggregates)  │  │  │  │  (Optimized)  │  │                  │
│   │  └───────┬───────┘  │  │  └───────┬───────┘  │                  │
│   │          │          │  │          │          │                  │
│   │  ┌───────▼───────┐  │  │  ┌───────▼───────┐  │                  │
│   │  │  Write DB     │  │  │  │   Read DB     │  │                  │
│   │  │ (Normalized)  │──┼──┼─▶│ (Denormalized)│  │                  │
│   │  └───────────────┘  │  │  └───────────────┘  │                  │
│   │                     │  │                     │                  │
│   └─────────────────────┘  └─────────────────────┘                  │
│                    │                                                 │
│                    └── Events sync read model                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Write Side (Commands)

```java
// Command - intent to change state
public record PlaceOrderCommand(
    String customerId,
    List<OrderLineData> items,
    String shippingAddressId
) {}

// Command Handler - processes the command
@Service
public class PlaceOrderCommandHandler {
    
    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;
    
    @Transactional
    public OrderId handle(PlaceOrderCommand command) {
        // Use rich domain model for writes
        Order order = Order.create(new CustomerId(command.customerId()));
        
        for (var item : command.items()) {
            order.addLine(item.productId(), item.quantity(), item.price());
        }
        
        order.place();
        
        orderRepository.save(order);
        eventPublisher.publish(order.getDomainEvents());
        
        return order.getId();
    }
}
```

---

## Read Side (Queries)

```java
// Query - request for data
public record GetOrderDetailsQuery(String orderId) {}

// Read Model - optimized for display
public record OrderDetailsView(
    String orderId,
    String customerName,
    String customerEmail,
    String status,
    LocalDateTime placedAt,
    List<OrderLineView> items,
    String shippingAddress,
    BigDecimal subtotal,
    BigDecimal tax,
    BigDecimal total
) {}

// Query Handler - retrieves data
@Service
public class GetOrderDetailsQueryHandler {
    
    private final OrderReadRepository readRepository;
    
    public OrderDetailsView handle(GetOrderDetailsQuery query) {
        // Direct database query, no domain model
        return readRepository.findOrderDetails(query.orderId())
            .orElseThrow(() -> new OrderNotFoundException(query.orderId()));
    }
}

// Read Repository - optimized queries
@Repository
public class OrderReadRepository {
    
    private final JdbcTemplate jdbc;
    
    public Optional<OrderDetailsView> findOrderDetails(String orderId) {
        // Direct SQL query - no ORM overhead
        String sql = """
            SELECT o.id, c.name, c.email, o.status, o.placed_at,
                   a.full_address, o.subtotal, o.tax, o.total
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN addresses a ON o.shipping_address_id = a.id
            WHERE o.id = ?
            """;
        
        return jdbc.queryForOptional(sql, this::mapToView, orderId);
    }
}
```

---

## Synchronizing Read Models

```java
// Event Handler updates read model when domain changes
@Component
public class OrderReadModelUpdater {
    
    private final OrderReadModelRepository readModelRepo;
    
    @EventListener
    @Transactional
    public void on(OrderPlacedEvent event) {
        // Update denormalized read model
        OrderReadModel readModel = new OrderReadModel();
        readModel.setOrderId(event.getOrderId());
        readModel.setCustomerId(event.getCustomerId());
        readModel.setStatus("PLACED");
        readModel.setTotal(event.getTotal());
        readModel.setPlacedAt(event.getOccurredAt());
        
        readModelRepo.save(readModel);
    }
    
    @EventListener
    @Transactional
    public void on(OrderShippedEvent event) {
        // Update status in read model
        readModelRepo.updateStatus(event.getOrderId(), "SHIPPED");
    }
}
```

---

## Simple CQRS (Same Database)

You don't need separate databases to benefit from CQRS. Start simple with separate models sharing the same database:

```java
// WRITE SIDE: Uses rich domain model
@Service
public class OrderCommandService {
    
    private final OrderRepository orderRepository;
    
    @Transactional
    public OrderId placeOrder(PlaceOrderCommand command) {
        Order order = Order.create(new CustomerId(command.customerId()));
        command.items().forEach(item -> 
            order.addLine(item.productId(), item.quantity(), item.price()));
        order.place();
        orderRepository.save(order);
        return order.getId();
    }
}

// READ SIDE: Bypasses domain model, queries directly
@Service
public class OrderQueryService {
    
    private final JdbcTemplate jdbc;
    
    public OrderSummaryView getOrderSummary(String orderId) {
        return jdbc.queryForObject("""
            SELECT o.id, o.status, o.total, c.name as customer_name,
                   o.created_at, COUNT(ol.id) as item_count
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN order_lines ol ON ol.order_id = o.id
            WHERE o.id = ?
            GROUP BY o.id, o.status, o.total, c.name, o.created_at
            """, this::mapToSummary, orderId);
    }
    
    public List<OrderListView> getOrdersByCustomer(String customerId) {
        return jdbc.query("""
            SELECT o.id, o.status, o.total, o.created_at
            FROM orders o
            WHERE o.customer_id = ?
            ORDER BY o.created_at DESC
            """, this::mapToListView, customerId);
    }
}
```

```
┌─────────────────────────────────────────────────────────────────────┐
│           SIMPLE vs FULL CQRS                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   SIMPLE CQRS (Start Here):                                        │
│   ┌──────────────────┐  ┌──────────────────┐                       │
│   │   Write Model    │  │   Read Model     │                       │
│   │   (Aggregates)   │  │   (SQL queries)  │                       │
│   │        │         │  │        │         │                       │
│   │        ▼         │  │        ▼         │                       │
│   │   ┌──────────────┼──┼──────────────┐   │                       │
│   │   │         SAME DATABASE          │   │                       │
│   │   └────────────────────────────────┘   │                       │
│   └──────────────────┘  └──────────────────┘                       │
│   ✓ Immediate consistency                                          │
│   ✓ Simple to implement                                            │
│   ✓ No event synchronization needed                                │
│                                                                      │
│   FULL CQRS (When Needed):                                         │
│   ┌──────────────────┐  ┌──────────────────┐                       │
│   │   Write Model    │  │   Read Model     │                       │
│   │   (Aggregates)   │  │   (Projections)  │                       │
│   │        │         │  │        ▲         │                       │
│   │        ▼         │  │        │         │                       │
│   │   ┌──────────┐   │  │   ┌──────────┐   │                       │
│   │   │ Write DB │───┼──┼──►│ Read DB  │   │                       │
│   │   └──────────┘   │  │   └──────────┘   │                       │
│   └──────────────────┘  └──────────────────┘                       │
│   ✓ Independent scaling                                            │
│   ✓ Optimized read stores (Elasticsearch, Redis)                   │
│   ✗ Eventual consistency                                           │
│   ✗ Higher complexity                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## When to Use CQRS

```
┌─────────────────────────────────────────────────────────────────────┐
│                  CQRS DECISION GUIDE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   USE CQRS WHEN:                                                    │
│   ✓ Read and write patterns are very different                     │
│   ✓ Complex queries that don't fit domain model                    │
│   ✓ Need to scale reads and writes independently                   │
│   ✓ Using event sourcing                                           │
│   ✓ Different consistency requirements for reads/writes            │
│                                                                      │
│   SKIP CQRS WHEN:                                                   │
│   ✗ Simple CRUD application                                        │
│   ✗ Read and write patterns are similar                            │
│   ✗ Small team / limited complexity                                │
│   ✗ Eventual consistency is problematic                            │
│                                                                      │
│   SIMPLE CQRS (Same DB):                                           │
│   • Separate models, same database                                  │
│   • Lower complexity                                                │
│   • Immediate consistency                                           │
│                                                                      │
│   FULL CQRS (Separate DBs):                                        │
│   • Separate databases for read/write                              │
│   • Higher complexity                                               │
│   • Eventual consistency                                            │
│   • Maximum scalability                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

**[← Previous: Clean Architecture](./21-clean-architecture.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Event Sourcing →](./23-event-sourcing.md)**
