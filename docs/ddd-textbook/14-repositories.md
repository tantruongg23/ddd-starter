# Chapter 14: Repositories

> *"A Repository mediates between the domain and data mapping layers, acting like an in-memory domain object collection."*
> — Martin Fowler

---

## What is a Repository?

A **Repository** is an abstraction that provides the illusion of an in-memory collection of domain objects (aggregates). It encapsulates all the logic needed to access data sources while keeping the domain model ignorant of persistence details.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REPOSITORY CONCEPT                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   The Domain Model sees:          Behind the scenes:                │
│   ──────────────────────          ─────────────────────             │
│                                                                      │
│   ┌─────────────────────┐         ┌─────────────────────┐          │
│   │                     │         │                     │          │
│   │   "A collection of  │         │   SQL/NoSQL         │          │
│   │    Orders that I    │  ─────► │   ORM mapping       │          │
│   │    can query and    │         │   Caching           │          │
│   │    persist"         │         │   Transactions      │          │
│   │                     │         │   Connection pools  │          │
│   └─────────────────────┘         └─────────────────────┘          │
│                                                                      │
│   Domain doesn't know or care HOW aggregates are stored            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Repository Rules

### Rule 1: One Repository Per Aggregate

```java
// ✓ CORRECT: Repository for aggregate root only
public interface OrderRepository {
    Optional<Order> findById(OrderId id);
    void save(Order order);
}

public interface CustomerRepository {
    Optional<Customer> findById(CustomerId id);
    void save(Customer customer);
}

// ✗ WRONG: Repository for non-root entity
public interface OrderLineRepository {
    // OrderLine is part of Order aggregate
    // Should NOT have its own repository!
}

// ✗ WRONG: Single repository for multiple aggregates
public interface AllEntitiesRepository {
    // Don't do this!
}
```

### Rule 2: Aggregates In, Aggregates Out

```java
public interface OrderRepository {
    
    // Returns complete aggregate
    Optional<Order> findById(OrderId id);
    
    // Saves complete aggregate (including internal entities)
    void save(Order order);
    
    // Returns list of complete aggregates
    List<Order> findByCustomer(CustomerId customerId);
    
    // ✗ WRONG: Returning internal entities
    // List<OrderLine> findOrderLines(OrderId orderId);
    
    // ✗ WRONG: Updating internal entities directly
    // void updateOrderLine(OrderLine line);
}
```

### Rule 3: Repository Interface in Domain Layer

```
┌─────────────────────────────────────────────────────────────────────┐
│                   REPOSITORY ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   DOMAIN LAYER                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                              │   │
│   │   Order (Aggregate)                                         │   │
│   │                                                              │   │
│   │   OrderRepository (Interface)    ◄── Domain defines contract│   │
│   │   │                                                          │   │
│   │   │  findById(OrderId): Order                               │   │
│   │   │  save(Order): void                                      │   │
│   │   │                                                          │   │
│   └───┼──────────────────────────────────────────────────────────┘   │
│       │                                                              │
│       │ implements                                                   │
│       │                                                              │
│   INFRASTRUCTURE LAYER                                              │
│   ┌───┼──────────────────────────────────────────────────────────┐   │
│   │   ▼                                                          │   │
│   │   JpaOrderRepository (Implementation)                        │   │
│   │   │                                                          │   │
│   │   │  Uses JPA/Hibernate                                     │   │
│   │   │  Maps to database tables                                │   │
│   │   │  Handles SQL                                            │   │
│   │   │                                                          │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Repository Interface Design

### Basic Repository Interface

```java
// Domain layer - defines what we need
package com.company.ordering.domain.repository;

public interface OrderRepository {
    
    /**
     * Find an order by its unique identifier.
     * @param id The order ID
     * @return The order if found, empty otherwise
     */
    Optional<Order> findById(OrderId id);
    
    /**
     * Persist an order (insert or update).
     * @param order The order to save
     */
    void save(Order order);
    
    /**
     * Remove an order from persistence.
     * @param order The order to delete
     */
    void delete(Order order);
    
    /**
     * Find all orders for a customer.
     * @param customerId The customer's ID
     * @return List of orders
     */
    List<Order> findByCustomerId(CustomerId customerId);
    
    /**
     * Check if an order exists.
     * @param id The order ID
     * @return true if exists
     */
    boolean exists(OrderId id);
}
```

### Extended Query Methods

```java
public interface OrderRepository {
    
    // Basic CRUD
    Optional<Order> findById(OrderId id);
    void save(Order order);
    void delete(Order order);
    
    // Query by attributes
    List<Order> findByCustomerId(CustomerId customerId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByDateRange(LocalDate from, LocalDate to);
    
    // Complex queries
    List<Order> findPendingOrdersOlderThan(Duration duration);
    List<Order> findHighValueOrders(Money threshold);
    
    // Pagination
    Page<Order> findByCustomerId(CustomerId customerId, Pageable pageable);
    
    // Count
    long countByStatus(OrderStatus status);
    
    // Existence
    boolean existsByCustomerIdAndStatus(CustomerId customerId, OrderStatus status);
}
```

### Generic Repository Base

```java
// Generic base interface
public interface Repository<T, ID> {
    Optional<T> findById(ID id);
    void save(T aggregate);
    void delete(T aggregate);
    boolean exists(ID id);
}

// Specific repository extends base
public interface OrderRepository extends Repository<Order, OrderId> {
    
    // Additional order-specific queries
    List<Order> findByCustomerId(CustomerId customerId);
    List<Order> findPendingOrders();
}
```

---

## Repository Implementation

### JPA Implementation

```java
// Infrastructure layer - implements the interface
package com.company.ordering.infrastructure.persistence;

@Repository
public class JpaOrderRepository implements OrderRepository {
    
    private final OrderJpaRepository jpaRepository;
    private final OrderMapper mapper;
    
    public JpaOrderRepository(OrderJpaRepository jpaRepository, OrderMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }
    
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
    
    @Override
    public void delete(Order order) {
        jpaRepository.deleteById(order.getId().getValue());
    }
    
    @Override
    public List<Order> findByCustomerId(CustomerId customerId) {
        return jpaRepository.findByCustomerId(customerId.getValue())
            .stream()
            .map(mapper::toDomain)
            .toList();
    }
    
    @Override
    public List<Order> findPendingOrdersOlderThan(Duration duration) {
        LocalDateTime threshold = LocalDateTime.now().minus(duration);
        return jpaRepository.findByStatusAndCreatedAtBefore(
                OrderStatus.PENDING.name(), 
                threshold
            )
            .stream()
            .map(mapper::toDomain)
            .toList();
    }
}

// Spring Data JPA repository (infrastructure detail)
interface OrderJpaRepository extends JpaRepository<OrderEntity, String> {
    List<OrderEntity> findByCustomerId(String customerId);
    List<OrderEntity> findByStatusAndCreatedAtBefore(String status, LocalDateTime threshold);
}
```

### Mapping Between Domain and Persistence

```java
@Component
public class OrderMapper {
    
    public Order toDomain(OrderEntity entity) {
        List<OrderLine> lines = entity.getLines().stream()
            .map(this::toOrderLine)
            .toList();
        
        return Order.reconstitute(
            new OrderId(entity.getId()),
            new CustomerId(entity.getCustomerId()),
            lines,
            new ShippingAddress(
                entity.getShippingStreet(),
                entity.getShippingCity(),
                entity.getShippingPostalCode(),
                entity.getShippingCountry()
            ),
            OrderStatus.valueOf(entity.getStatus()),
            Money.of(entity.getSubtotal(), entity.getCurrency()),
            Money.of(entity.getTax(), entity.getCurrency()),
            Money.of(entity.getTotal(), entity.getCurrency()),
            entity.getCreatedAt(),
            entity.getPlacedAt()
        );
    }
    
    public OrderEntity toEntity(Order order) {
        OrderEntity entity = new OrderEntity();
        entity.setId(order.getId().getValue());
        entity.setCustomerId(order.getCustomerId().getValue());
        entity.setStatus(order.getStatus().name());
        entity.setSubtotal(order.getSubtotal().getAmount());
        entity.setTax(order.getTax().getAmount());
        entity.setTotal(order.getTotal().getAmount());
        entity.setCurrency(order.getTotal().getCurrency().getCurrencyCode());
        entity.setCreatedAt(order.getCreatedAt());
        entity.setPlacedAt(order.getPlacedAt());
        
        ShippingAddress address = order.getShippingAddress();
        entity.setShippingStreet(address.getStreet());
        entity.setShippingCity(address.getCity());
        entity.setShippingPostalCode(address.getPostalCode());
        entity.setShippingCountry(address.getCountry());
        
        entity.setLines(
            order.getLines().stream()
                .map(line -> toLineEntity(line, entity))
                .toList()
        );
        
        return entity;
    }
    
    private OrderLine toOrderLine(OrderLineEntity entity) {
        return new OrderLine(
            new OrderLineId(entity.getId()),
            new ProductId(entity.getProductId()),
            new ProductName(entity.getProductName()),
            Quantity.of(entity.getQuantity()),
            Money.of(entity.getUnitPrice(), entity.getCurrency())
        );
    }
    
    private OrderLineEntity toLineEntity(OrderLine line, OrderEntity order) {
        OrderLineEntity entity = new OrderLineEntity();
        entity.setId(line.getId().getValue());
        entity.setOrder(order);
        entity.setProductId(line.getProductId().getValue());
        entity.setProductName(line.getProductName().getValue());
        entity.setQuantity(line.getQuantity().getValue());
        entity.setUnitPrice(line.getUnitPrice().getAmount());
        entity.setCurrency(line.getUnitPrice().getCurrency().getCurrencyCode());
        return entity;
    }
}
```

---

## In-Memory Repository (Testing)

```java
// Useful for unit testing domain logic
public class InMemoryOrderRepository implements OrderRepository {
    
    private final Map<OrderId, Order> orders = new ConcurrentHashMap<>();
    
    @Override
    public Optional<Order> findById(OrderId id) {
        return Optional.ofNullable(orders.get(id));
    }
    
    @Override
    public void save(Order order) {
        orders.put(order.getId(), order);
    }
    
    @Override
    public void delete(Order order) {
        orders.remove(order.getId());
    }
    
    @Override
    public List<Order> findByCustomerId(CustomerId customerId) {
        return orders.values().stream()
            .filter(o -> o.getCustomerId().equals(customerId))
            .toList();
    }
    
    @Override
    public List<Order> findPendingOrdersOlderThan(Duration duration) {
        LocalDateTime threshold = LocalDateTime.now().minus(duration);
        return orders.values().stream()
            .filter(o -> o.getStatus() == OrderStatus.PENDING)
            .filter(o -> o.getCreatedAt().isBefore(threshold))
            .toList();
    }
    
    // Test helpers
    public void clear() {
        orders.clear();
    }
    
    public int count() {
        return orders.size();
    }
}
```

---

## Specification Pattern

For complex queries, use the Specification pattern:

```java
// Specification interface
public interface Specification<T> {
    boolean isSatisfiedBy(T candidate);
    
    default Specification<T> and(Specification<T> other) {
        return candidate -> this.isSatisfiedBy(candidate) && other.isSatisfiedBy(candidate);
    }
    
    default Specification<T> or(Specification<T> other) {
        return candidate -> this.isSatisfiedBy(candidate) || other.isSatisfiedBy(candidate);
    }
    
    default Specification<T> not() {
        return candidate -> !this.isSatisfiedBy(candidate);
    }
}

// Order specifications
public class OrderSpecifications {
    
    public static Specification<Order> hasStatus(OrderStatus status) {
        return order -> order.getStatus() == status;
    }
    
    public static Specification<Order> belongsToCustomer(CustomerId customerId) {
        return order -> order.getCustomerId().equals(customerId);
    }
    
    public static Specification<Order> totalGreaterThan(Money threshold) {
        return order -> order.getTotal().isGreaterThan(threshold);
    }
    
    public static Specification<Order> createdBefore(LocalDateTime date) {
        return order -> order.getCreatedAt().isBefore(date);
    }
    
    public static Specification<Order> isPending() {
        return hasStatus(OrderStatus.PENDING);
    }
    
    public static Specification<Order> isHighValue() {
        return totalGreaterThan(Money.of(1000, "USD"));
    }
}

// Repository with specification support
public interface OrderRepository {
    List<Order> findAll(Specification<Order> spec);
    long count(Specification<Order> spec);
    boolean exists(Specification<Order> spec);
}

// Usage
Specification<Order> spec = OrderSpecifications.isPending()
    .and(OrderSpecifications.belongsToCustomer(customerId))
    .and(OrderSpecifications.createdBefore(LocalDateTime.now().minusDays(7)));

List<Order> stalePendingOrders = orderRepository.findAll(spec);
```

---

## Key Takeaways

1. **One repository per aggregate root** - Not for every entity

2. **Interface in domain, implementation in infrastructure** - Dependency inversion

3. **Return complete aggregates** - Not partial data or internal entities

4. **Repository is a collection abstraction** - Hides persistence details

5. **Use in-memory implementations for testing** - Fast, isolated tests

6. **Specification pattern for complex queries** - Composable, reusable

---

## What's Next?

In [Chapter 15: Domain Services](./15-domain-services.md), we'll explore operations that don't naturally belong to any single entity or value object.

---

**[← Previous: Commands](./13-commands.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Domain Services →](./15-domain-services.md)**
