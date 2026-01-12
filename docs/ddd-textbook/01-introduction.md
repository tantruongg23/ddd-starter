# Chapter 1: Introduction to Domain-Driven Design

> *"The heart of software is its ability to solve domain-related problems for its user."*
> — Eric Evans

---

## What is Domain-Driven Design?

**Domain-Driven Design (DDD)** is a software development philosophy and methodology that places the primary focus on the core business domain and domain logic. It was introduced by Eric Evans in his seminal 2003 book "Domain-Driven Design: Tackling Complexity in the Heart of Software."

### Definition

```
Domain-Driven Design is an approach to software development that:
1. Places the project's primary focus on the core domain and domain logic
2. Bases complex designs on a model of the domain
3. Initiates a creative collaboration between technical and domain experts
   to iteratively refine a conceptual model that addresses domain problems
```

### The Three Pillars of DDD

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOMAIN-DRIVEN DESIGN                              │
├─────────────────┬─────────────────────┬─────────────────────────────┤
│   PHILOSOPHY    │    STRATEGIC        │      TACTICAL               │
│                 │    DESIGN           │      DESIGN                 │
├─────────────────┼─────────────────────┼─────────────────────────────┤
│ • Domain Focus  │ • Bounded Contexts  │ • Entities                  │
│ • Collaboration │ • Context Mapping   │ • Value Objects             │
│ • Modeling      │ • Ubiquitous Lang.  │ • Aggregates                │
│ • Iteration     │ • Subdomains        │ • Repositories              │
│                 │                     │ • Domain Events             │
│                 │                     │ • Services                  │
└─────────────────┴─────────────────────┴─────────────────────────────┘
```

---

## Understanding the "Domain"

### What is a Domain?

A **domain** is the sphere of knowledge and activity around which the application logic revolves. It's the subject area to which the software is applied.

**Examples of Domains:**
| Industry | Domain Examples |
|----------|-----------------|
| E-commerce | Product catalog, Shopping cart, Order fulfillment, Payments |
| Healthcare | Patient management, Appointment scheduling, Medical records |
| Finance | Account management, Transactions, Risk assessment, Compliance |
| Logistics | Route planning, Inventory, Shipment tracking, Warehouse management |

### Domain vs. Technical Concerns

```
┌────────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION                             │
├────────────────────────────┬───────────────────────────────────────┤
│      DOMAIN CONCERNS       │        TECHNICAL CONCERNS             │
│      (The "What")          │        (The "How")                    │
├────────────────────────────┼───────────────────────────────────────┤
│ • Business rules           │ • Database technology                 │
│ • Business processes       │ • Web frameworks                      │
│ • Domain concepts          │ • API protocols                       │
│ • Business logic           │ • Caching strategies                  │
│ • Domain events            │ • Message queues                      │
│ • Business policies        │ • Authentication mechanisms           │
└────────────────────────────┴───────────────────────────────────────┘

DDD Focus: Maximize investment in DOMAIN CONCERNS
           Minimize coupling to TECHNICAL CONCERNS
```

---

## The Problem DDD Solves

### Traditional Development Challenges

In traditional software development, teams often face these challenges:

#### 1. The Translation Problem
```
Business Expert:     "When a customer places an order, we need to 
                      check inventory and reserve the items."

Developer (thinks):  "So I need a POST endpoint that updates the 
                      database and sends a message to a queue..."

Result:             The business logic gets lost in technical details
```

#### 2. The Anemic Domain Model
```java
// ANTI-PATTERN: Anemic Domain Model
public class Order {
    private Long id;
    private List<OrderItem> items;
    private OrderStatus status;
    
    // Only getters and setters - no behavior!
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
}

// Business logic scattered in service classes
public class OrderService {
    public void placeOrder(Order order) {
        // All the interesting logic is here, not in the domain
        validateOrder(order);
        calculateTotals(order);
        checkInventory(order);
        order.setStatus(OrderStatus.PLACED);
        // ... more procedural code
    }
}
```

#### 3. The Big Ball of Mud
```
                    ┌─────────────────────────────────┐
                    │         MONOLITHIC MESS          │
                    │                                  │
                    │   ┌────┐  ┌────┐  ┌────┐        │
                    │   │ A  ├──┤ B  ├──┤ C  │        │
                    │   └─┬──┘  └─┬──┘  └─┬──┘        │
                    │     │    ╲  │  ╱    │           │
                    │     │     ╲ │ ╱     │           │
                    │   ┌─┴──┐  ┌┴─┴┐  ┌──┴─┐        │
                    │   │ D  ├──┤ E ├──┤ F  │        │
                    │   └────┘  └───┘  └────┘        │
                    │                                  │
                    │   Everything depends on         │
                    │   everything else!              │
                    └─────────────────────────────────┘
```

### How DDD Addresses These Challenges

| Challenge | DDD Solution |
|-----------|--------------|
| Translation Problem | **Ubiquitous Language** - shared vocabulary between developers and domain experts |
| Anemic Domain Model | **Rich Domain Model** - encapsulate behavior with data |
| Big Ball of Mud | **Bounded Contexts** - explicit boundaries between different parts of the system |
| Complexity | **Strategic Design** - focus on what matters most |
| Changing Requirements | **Iterative Modeling** - evolve the model with understanding |

---

## Core Concepts Overview

### Strategic Design Concepts

These concepts help you organize and structure large systems:

| Concept | Purpose | Key Question |
|---------|---------|--------------|
| **Ubiquitous Language** | Shared vocabulary | "Are we speaking the same language?" |
| **Bounded Context** | Explicit boundaries | "Where does this model apply?" |
| **Context Map** | Relationship between contexts | "How do our systems interact?" |
| **Subdomain** | Problem space decomposition | "What are the distinct problem areas?" |

### Tactical Design Concepts

These are the building blocks for implementing your domain model:

| Concept | Purpose | Key Question |
|---------|---------|--------------|
| **Entity** | Objects with identity | "Does this object have a lifecycle?" |
| **Value Object** | Immutable descriptors | "Is this defined by its attributes?" |
| **Aggregate** | Consistency boundary | "What must be consistent together?" |
| **Repository** | Collection abstraction | "How do I retrieve aggregates?" |
| **Domain Event** | Something that happened | "What just occurred in the domain?" |
| **Domain Service** | Stateless operations | "What doesn't belong to an entity?" |

---

## A Quick Example

Let's see how DDD thinking changes our approach:

### Before DDD (Data-Centric)
```java
// Focus on data structures and CRUD operations
public class OrderController {
    
    @PostMapping("/orders")
    public Order createOrder(@RequestBody OrderDTO dto) {
        Order order = new Order();
        order.setCustomerId(dto.getCustomerId());
        order.setItems(dto.getItems());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }
    
    @PutMapping("/orders/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestBody String status) {
        Order order = orderRepository.findById(id);
        order.setStatus(status);  // No validation, no business rules!
        return orderRepository.save(order);
    }
}
```

### After DDD (Domain-Centric)
```java
// Focus on domain behavior and business rules
public class Order {  // Rich Domain Model
    private OrderId id;
    private CustomerId customerId;
    private List<OrderLine> orderLines;
    private OrderStatus status;
    private Money totalAmount;
    
    // Constructor enforces invariants
    public Order(CustomerId customerId, List<OrderLine> orderLines) {
        if (orderLines.isEmpty()) {
            throw new EmptyOrderException();
        }
        this.id = OrderId.generate();
        this.customerId = customerId;
        this.orderLines = new ArrayList<>(orderLines);
        this.status = OrderStatus.DRAFT;
        this.totalAmount = calculateTotal();
    }
    
    // Business behavior encapsulated in the domain
    public void place() {
        if (this.status != OrderStatus.DRAFT) {
            throw new InvalidOrderStateException("Only draft orders can be placed");
        }
        this.status = OrderStatus.PLACED;
        // Raise domain event
        DomainEvents.raise(new OrderPlacedEvent(this.id, this.customerId));
    }
    
    public void cancel(String reason) {
        if (!this.status.isCancellable()) {
            throw new InvalidOrderStateException("Order cannot be cancelled");
        }
        this.status = OrderStatus.CANCELLED;
        DomainEvents.raise(new OrderCancelledEvent(this.id, reason));
    }
    
    private Money calculateTotal() {
        return orderLines.stream()
            .map(OrderLine::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
}

// Application service orchestrates use cases
public class OrderApplicationService {
    
    public OrderId placeOrder(PlaceOrderCommand command) {
        Customer customer = customerRepository.findById(command.getCustomerId());
        List<OrderLine> orderLines = createOrderLines(command.getItems());
        
        Order order = new Order(customer.getId(), orderLines);
        order.place();
        
        orderRepository.save(order);
        return order.getId();
    }
}
```

---

## When to Use DDD

### DDD is Most Valuable When:

✅ **Complex business domain** - Many rules, exceptions, and special cases

✅ **Long-lived project** - Expected to evolve over years

✅ **Team includes domain experts** - Access to business knowledge

✅ **Core competitive advantage** - The software IS the business

✅ **High change frequency** - Business rules change often

### DDD May Be Overkill When:

❌ **Simple CRUD applications** - Basic data entry and retrieval

❌ **Technical-focused projects** - ETL, infrastructure tools

❌ **Very short timelines** - Tight deadlines with no room for modeling

❌ **No domain expert access** - Can't collaborate with business

❌ **Prototype or throwaway code** - Not meant to last

### The DDD Applicability Matrix

```
High  │          │ Consider │    USE    │
      │          │   DDD    │    DDD    │
Domain│          │          │           │
Comp- │──────────┼──────────┼───────────│
lexity│  AVOID   │ EVALUATE │ Consider  │
      │   DDD    │  EFFORT  │   DDD     │
Low   │          │          │           │
      └──────────┴──────────┴───────────┘
           Low      Medium      High
              Project Lifespan & Scale
```

---

## The DDD Journey

Learning and applying DDD is a journey:

```
Level 1: UNDERSTANDING
├── Learn the vocabulary
├── Understand why DDD exists
└── Recognize when to apply it

Level 2: TACTICAL PATTERNS
├── Implement Entities and Value Objects
├── Design Aggregates
├── Use Repositories and Domain Events
└── Write rich domain models

Level 3: STRATEGIC DESIGN  
├── Define Bounded Contexts
├── Create Context Maps
├── Identify Subdomains
└── Design for large-scale systems

Level 4: MASTERY
├── Lead DDD initiatives
├── Facilitate Event Storming
├── Mentor teams
└── Evolve architectures
```

---

## Key Takeaways

1. **DDD is a philosophy first, patterns second** - It's about focusing on the domain

2. **Collaboration is essential** - Developers must work closely with domain experts

3. **The model is central** - A shared understanding of the domain drives everything

4. **Boundaries matter** - Clear boundaries prevent complexity from spreading

5. **Not all parts need DDD** - Apply it where complexity justifies the investment

---

## What's Next?

In [Chapter 2: Why We Need DDD](./02-why-ddd.md), we'll dive deeper into the problems that DDD solves and understand why traditional approaches fall short for complex systems.

---

**[← Back to Table of Contents](./README.md)** | **[Next: Why We Need DDD →](./02-why-ddd.md)**
