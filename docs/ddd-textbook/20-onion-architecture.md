# Chapter 20: Onion Architecture

> *"The fundamental rule is that all code can depend on layers more central, but code cannot depend on layers further out from the core."*
> — Jeffrey Palermo

---

## What is Onion Architecture?

**Onion Architecture** visualizes the application as concentric layers, with the domain model at the center. Like an onion, each layer wraps around the inner layers, and dependencies always point inward.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ONION ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│          ┌──────────────────────────────────────────────┐           │
│          │              INFRASTRUCTURE                   │           │
│          │         (UI, DB, External Services)          │           │
│          │                                               │           │
│          │    ┌────────────────────────────────────┐    │           │
│          │    │         APPLICATION SERVICES        │    │           │
│          │    │         (Use Cases, Commands)       │    │           │
│          │    │                                     │    │           │
│          │    │   ┌───────────────────────────┐    │    │           │
│          │    │   │      DOMAIN SERVICES       │    │    │           │
│          │    │   │                            │    │    │           │
│          │    │   │   ┌───────────────────┐   │    │    │           │
│          │    │   │   │   DOMAIN MODEL    │   │    │    │           │
│          │    │   │   │                   │   │    │    │           │
│          │    │   │   │  Entities         │   │    │    │           │
│          │    │   │   │  Value Objects    │   │    │    │           │
│          │    │   │   │  Aggregates       │   │    │    │           │
│          │    │   │   │                   │   │    │    │           │
│          │    │   │   └───────────────────┘   │    │    │           │
│          │    │   │                            │    │    │           │
│          │    │   └───────────────────────────┘    │    │           │
│          │    │                                     │    │           │
│          │    └────────────────────────────────────┘    │           │
│          │                                               │           │
│          └──────────────────────────────────────────────┘           │
│                                                                      │
│   Key: Dependencies ALWAYS point toward the center                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The Layers

### Layer 1: Domain Model (Core)

```java
// The innermost layer - pure domain logic
// NO dependencies on any other layer

package com.company.domain.model;

public class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> lines;
    private OrderStatus status;
    
    public void place() {
        if (lines.isEmpty()) {
            throw new EmptyOrderException();
        }
        this.status = OrderStatus.PLACED;
    }
    
    public void cancel() {
        if (!status.isCancellable()) {
            throw new OrderNotCancellableException(this.id);
        }
        this.status = OrderStatus.CANCELLED;
    }
}
```

### Layer 2: Domain Services

```java
// Domain services that don't fit in entities
// Depends only on Domain Model

package com.company.domain.service;

public class PricingService {
    
    public Money calculatePrice(Product product, Customer customer, Quantity qty) {
        Money basePrice = product.getPrice();
        Discount discount = customer.getApplicableDiscount();
        return basePrice.multiply(qty.getValue()).apply(discount);
    }
}
```

### Layer 3: Application Services

```java
// Orchestrates domain objects
// Depends on Domain Model and Domain Services
// Defines interfaces for what it needs (ports)

package com.company.application;

public interface OrderRepository {  // Interface defined in application layer
    Optional<Order> findById(OrderId id);
    void save(Order order);
}

@Service
public class PlaceOrderService {
    
    private final OrderRepository orderRepository;
    private final PricingService pricingService;
    
    @Transactional
    public OrderId placeOrder(PlaceOrderCommand command) {
        Order order = Order.create(command.customerId());
        // ... build order
        order.place();
        orderRepository.save(order);
        return order.getId();
    }
}
```

### Layer 4: Infrastructure

```java
// Implements interfaces, connects to external world
// Depends on all inner layers

package com.company.infrastructure.persistence;

@Repository
public class JpaOrderRepository implements OrderRepository {
    
    private final OrderJpaRepository jpaRepo;
    
    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepo.findById(id.getValue())
            .map(this::toDomain);
    }
    
    @Override
    public void save(Order order) {
        jpaRepo.save(toEntity(order));
    }
}
```

---

## Comparison with Other Architectures

```
┌─────────────────────────────────────────────────────────────────────┐
│        LAYERED vs HEXAGONAL vs ONION                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   LAYERED                HEXAGONAL             ONION                │
│   ───────                ─────────             ─────                │
│                                                                      │
│   ┌────────┐           ┌──────────────┐     ┌──────────────────┐   │
│   │   UI   │           │   Adapters   │     │  Infrastructure  │   │
│   ├────────┤           │ ┌──────────┐ │     │ ┌──────────────┐ │   │
│   │  App   │           │ │  Ports   │ │     │ │  Application │ │   │
│   ├────────┤           │ │ ┌──────┐ │ │     │ │ ┌──────────┐ │ │   │
│   │ Domain │           │ │ │ Core │ │ │     │ │ │ Domain   │ │ │   │
│   ├────────┤           │ │ └──────┘ │ │     │ │ │  Model   │ │ │   │
│   │Infrastr│           │ └──────────┘ │     │ │ └──────────┘ │ │   │
│   └────────┘           │   Adapters   │     │ └──────────────┘ │   │
│       │                └──────────────┘     └──────────────────┘   │
│       ▼                       ◄──►                  ◄──            │
│   Dependencies          Dependencies           Dependencies        │
│   point DOWN            point INWARD           point INWARD        │
│                                                                      │
│   Infrastructure        All external           Infrastructure      │
│   at bottom             same distance          at outermost        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Domain at center** - Most stable, most important

2. **Dependencies point inward** - Outer depends on inner, never reverse

3. **Infrastructure at edge** - Easily replaceable

4. **Interfaces in application layer** - Dependency inversion

5. **Similar to hexagonal** - Different visualization, same principles

---

**[← Previous: Hexagonal](./19-hexagonal-architecture.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Clean Architecture →](./21-clean-architecture.md)**
