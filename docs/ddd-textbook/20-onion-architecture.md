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
// Uses interfaces defined in the DOMAIN layer (not here)

package com.company.application;

@Service
public class PlaceOrderService {
    
    private final OrderRepository orderRepository;  // Interface from domain layer
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

> **Note:** The `OrderRepository` interface is defined in the **domain layer** (Layer 1/2), not the application layer. This is consistent with the Dependency Inversion Principle — the domain defines the contract, infrastructure implements it.

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

## Project Structure

```
src/main/java/com/company/
├── domain/                        # Layer 1 & 2: Domain Model + Domain Services
│   ├── model/
│   │   ├── Order.java             # Aggregate Root
│   │   ├── OrderLine.java         # Entity
│   │   ├── OrderId.java           # Value Object
│   │   └── OrderStatus.java       # Value Object
│   ├── repository/
│   │   └── OrderRepository.java   # Interface (defined here!)
│   └── service/
│       └── PricingService.java    # Domain Service
│
├── application/                   # Layer 3: Application Services
│   ├── PlaceOrderService.java
│   ├── CancelOrderService.java
│   └── command/
│       ├── PlaceOrderCommand.java
│       └── CancelOrderCommand.java
│
└── infrastructure/                # Layer 4: Infrastructure
    ├── persistence/
    │   ├── JpaOrderRepository.java  # Implements OrderRepository
    │   └── entity/
    │       └── OrderJpaEntity.java
    └── web/
        └── OrderController.java
```

---

## When to Choose Onion Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│            ONION vs HEXAGONAL vs LAYERED                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Choose ONION when:                                                │
│   • You want a visual model that emphasizes "domain at center"     │
│   • Your team thinks in terms of concentric dependency layers       │
│   • You want a simple mental model for enforcing dependency rules  │
│                                                                      │
│   Choose HEXAGONAL when:                                            │
│   • You have many external integrations (APIs, queues, DBs)        │
│   • You want to emphasize "ports and adapters" for testability     │
│   • Multiple entry points (REST, CLI, message handlers)            │
│                                                                      │
│   Choose LAYERED when:                                              │
│   • Simpler applications with fewer integration concerns            │
│   • Team is not familiar with port/adapter concepts                 │
│   • You want the simplest possible structure                        │
│                                                                      │
│   KEY INSIGHT: These architectures share the SAME core principle:  │
│   domain at center, dependencies point inward, infrastructure      │
│   at the edge. The differences are mostly in visualization and     │
│   terminology.                                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
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

4. **Repository interfaces in domain layer** - Not in application layer

5. **Similar to hexagonal** - Different visualization, same dependency inversion principle

6. **Choose based on team mental model** - All three architectures share the same core principle

---

**[← Previous: Hexagonal](./19-hexagonal-architecture.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Clean Architecture →](./21-clean-architecture.md)**
