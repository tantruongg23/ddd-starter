# Appendix B: Quick Reference Card

> *One-page summary of DDD patterns and practices*

---

## Strategic Design Checklist

```
□ Identify the CORE DOMAIN (competitive advantage)
□ Define BOUNDED CONTEXTS (model boundaries)
□ Create CONTEXT MAP (how contexts relate)
□ Establish UBIQUITOUS LANGUAGE (shared vocabulary)
□ Classify SUBDOMAINS (core, supporting, generic)
```

---

## Tactical Building Blocks

| Pattern | Purpose | Key Characteristics |
|---------|---------|---------------------|
| **Entity** | Things with identity | Has ID, mutable, lifecycle |
| **Value Object** | Descriptive elements | No ID, immutable, equality by attributes |
| **Aggregate** | Consistency boundary | Has root, transactional unit |
| **Repository** | Persistence abstraction | One per aggregate, collection-like |
| **Domain Event** | Things that happened | Past tense, immutable |
| **Domain Service** | Stateless operations | Cross-aggregate logic |
| **Factory** | Complex creation | Returns valid aggregates |

---

## Aggregate Rules

```
1. Reference by ID only (between aggregates)
2. One aggregate per transaction
3. All changes through the root
4. Eventual consistency across aggregates
5. Keep aggregates small
```

---

## Value Object Checklist

```java
□ Immutable (final fields, no setters)
□ Equality by attributes (equals/hashCode)
□ Self-validating (validate in constructor)
□ Side-effect free methods (return new instances)
```

---

## Entity Checklist

```java
□ Has unique identity (typed ID)
□ Identity never changes
□ Equality by identity only
□ Encapsulates behavior with state
□ No public setters (meaningful operations)
```

---

## Application Service Pattern

```java
@Service
public class OrderApplicationService {
    
    @Transactional
    public OrderId placeOrder(PlaceOrderCommand command) {
        // 1. Load aggregates
        Customer customer = customerRepo.findById(...);
        
        // 2. Create/modify aggregate
        Order order = Order.create(customer.getId());
        order.addItems(...);
        order.place();
        
        // 3. Save
        orderRepo.save(order);
        
        // 4. Publish events
        eventPublisher.publish(order.getDomainEvents());
        
        // 5. Return result
        return order.getId();
    }
}
```

---

## Architecture Comparison

| Architecture | Key Idea | Domain Location |
|--------------|----------|-----------------|
| **Layered** | Horizontal layers | Domain layer in middle |
| **Hexagonal** | Ports & Adapters | Core with ports |
| **Onion** | Concentric circles | Center |
| **Clean** | Dependency rule | Entities at center |

---

## Context Mapping Patterns

| Pattern | Relationship | When to Use |
|---------|-------------|-------------|
| **Partnership** | Equal, coordinated | Close collaboration possible |
| **Shared Kernel** | Shared code | Minimal common model |
| **Customer-Supplier** | Upstream serves downstream | Can negotiate needs |
| **Conformist** | Adopt upstream model | No influence on upstream |
| **ACL** | Translation layer | Protect from foreign model |
| **Open Host Service** | Published API | Many consumers |
| **Separate Ways** | No integration | Not worth integrating |

---

## Event Storming Colors

| Color | Represents | Example |
|-------|------------|---------|
| 🟧 Orange | Domain Event | "OrderPlaced" |
| 🟦 Blue | Command | "Place Order" |
| 🟨 Yellow | Aggregate | "Order" |
| 🟪 Purple | Policy | "When X → do Y" |
| 🟩 Green | Read Model | "Dashboard" |
| 🔴 Red | Problem | "What if...?" |

---

## Project Structure (Hexagonal)

```
src/main/java/com/company/context/
├── domain/
│   ├── model/          # Entities, VOs, Aggregates
│   ├── repository/     # Repository interfaces
│   └── service/        # Domain services
├── application/
│   ├── service/        # Use cases
│   └── command/        # Commands
└── infrastructure/
    ├── persistence/    # Repository implementations
    └── web/            # Controllers
```

---

## Common Mistakes to Avoid

```
✗ Anemic domain model (data bags with services)
✗ Large aggregates (load everything)
✗ Sharing domain objects between contexts
✗ Business logic in application services
✗ Primitive types for domain concepts
✗ Multiple aggregates in one transaction
✗ Direct database queries from domain
✗ Everything is "core domain"
```

---

**[Back to Table of Contents](./README.md)**
