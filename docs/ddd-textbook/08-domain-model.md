# Chapter 8: Domain Model Overview

> *"The model is a selectively simplified and consciously structured form of knowledge."*
> — Eric Evans

---

## What is a Domain Model?

A **Domain Model** is an organized and selective abstraction of knowledge about the problem domain. It's not a diagram—it's the combination of code, documentation, and shared understanding that captures the essential concepts and rules of the business.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      THE DOMAIN MODEL                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   A Domain Model is:                                                │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                              │   │
│   │  📝 CODE that expresses business concepts                   │   │
│   │     Classes, methods, relationships that mirror the domain   │   │
│   │                                                              │   │
│   │  🗣️ LANGUAGE shared by developers and domain experts        │   │
│   │     Names, terms, phrases used consistently                  │   │
│   │                                                              │   │
│   │  📊 DIAGRAMS that visualize relationships                   │   │
│   │     But secondary to the code itself                         │   │
│   │                                                              │   │
│   │  🧠 KNOWLEDGE captured from domain experts                  │   │
│   │     Rules, constraints, behaviors, exceptions                │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   A Domain Model is NOT:                                            │
│   • Just a database schema                                          │
│   • Just a UML diagram                                              │
│   • Just a data dictionary                                          │
│   • A 1:1 copy of reality                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Building Blocks Overview

The tactical patterns of DDD provide building blocks for constructing domain models:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  DDD TACTICAL BUILDING BLOCKS                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        AGGREGATES                              │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                                                          │  │  │
│  │  │   ┌────────────────────┐    ┌────────────────────┐     │  │  │
│  │  │   │  AGGREGATE ROOT    │    │  AGGREGATE ROOT    │     │  │  │
│  │  │   │    (Entity)        │    │    (Entity)        │     │  │  │
│  │  │   │                    │    │                    │     │  │  │
│  │  │   │  ┌──────────────┐  │    │  ┌──────────────┐  │     │  │  │
│  │  │   │  │   Entity     │  │    │  │ Value Object │  │     │  │  │
│  │  │   │  └──────────────┘  │    │  └──────────────┘  │     │  │  │
│  │  │   │  ┌──────────────┐  │    │  ┌──────────────┐  │     │  │  │
│  │  │   │  │ Value Object │  │    │  │ Value Object │  │     │  │  │
│  │  │   │  └──────────────┘  │    │  └──────────────┘  │     │  │  │
│  │  │   │                    │    │                    │     │  │  │
│  │  │   └────────────────────┘    └────────────────────┘     │  │  │
│  │  │                                                          │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  SUPPORTING ELEMENTS                                                │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             │
│  │  Repository   │ │ Domain Service│ │ Domain Event  │             │
│  │               │ │               │ │               │             │
│  │ Retrieves and │ │ Stateless ops │ │ Something     │             │
│  │ persists      │ │ that don't    │ │ that happened │             │
│  │ aggregates    │ │ belong to     │ │ in the domain │             │
│  │               │ │ entities      │ │               │             │
│  └───────────────┘ └───────────────┘ └───────────────┘             │
│                                                                      │
│  ┌───────────────┐ ┌───────────────┐                               │
│  │   Factory     │ │ Specification │                               │
│  │               │ │               │                               │
│  │ Complex       │ │ Encapsulated  │                               │
│  │ object        │ │ business      │                               │
│  │ creation      │ │ rules         │                               │
│  └───────────────┘ └───────────────┘                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Building Block | Identity | Mutability | Purpose |
|----------------|----------|------------|---------|
| **Entity** | Has unique ID | Mutable | Things with lifecycle |
| **Value Object** | By attributes | Immutable | Descriptive elements |
| **Aggregate** | By root's ID | Controlled | Consistency boundary |
| **Repository** | N/A | N/A | Aggregate persistence |
| **Domain Service** | N/A | Stateless | Cross-entity operations |
| **Domain Event** | Usually has ID | Immutable | Things that happened |
| **Factory** | N/A | N/A | Complex creation |

---

## Rich vs Anemic Domain Model

### The Anemic Domain Model (Anti-Pattern)

```java
// ❌ ANEMIC: Data bags with no behavior
public class Order {
    private Long id;
    private Long customerId;
    private List<OrderLineDto> items;
    private String status;
    private BigDecimal total;
    private LocalDateTime createdAt;
    
    // Only getters and setters - no business logic!
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public List<OrderLineDto> getItems() { return items; }
    public void setItems(List<OrderLineDto> items) { this.items = items; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}

// Business logic scattered in "services"
public class OrderService {
    
    public void placeOrder(Order order) {
        // Business rules here instead of in the domain
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Order must have items");
        }
        
        BigDecimal total = BigDecimal.ZERO;
        for (OrderLineDto item : order.getItems()) {
            total = total.add(item.getPrice().multiply(
                BigDecimal.valueOf(item.getQuantity())));
        }
        order.setTotal(total);
        
        if (order.getTotal().compareTo(BigDecimal.valueOf(10000)) > 0) {
            order.setStatus("PENDING_APPROVAL");
        } else {
            order.setStatus("PLACED");
        }
        
        order.setCreatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }
    
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId);
        
        // More scattered business rules
        if ("SHIPPED".equals(order.getStatus())) {
            throw new RuntimeException("Cannot cancel shipped order");
        }
        if ("DELIVERED".equals(order.getStatus())) {
            throw new RuntimeException("Cannot cancel delivered order");
        }
        
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }
}
```

**Problems with Anemic Model:**
- Business logic scattered across services
- Easy to put object in invalid state
- Duplicate validation logic
- Hard to understand domain by reading code
- Testing requires mocking services

### The Rich Domain Model

```java
// ✅ RICH: Behavior encapsulated with data
public class Order {
    private OrderId id;
    private CustomerId customerId;
    private List<OrderLine> orderLines;
    private OrderStatus status;
    private Money totalAmount;
    private LocalDateTime createdAt;
    
    // Private constructor - use factory methods
    private Order(CustomerId customerId) {
        this.id = OrderId.generate();
        this.customerId = Objects.requireNonNull(customerId);
        this.orderLines = new ArrayList<>();
        this.status = OrderStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
        this.totalAmount = Money.ZERO;
    }
    
    // Factory method with business rules
    public static Order create(CustomerId customerId) {
        return new Order(customerId);
    }
    
    // Business behavior IN the domain object
    public void addItem(Product product, Quantity quantity, Money unitPrice) {
        ensureDraftStatus();
        
        OrderLine line = new OrderLine(product.getId(), quantity, unitPrice);
        this.orderLines.add(line);
        recalculateTotal();
    }
    
    public void removeItem(ProductId productId) {
        ensureDraftStatus();
        
        this.orderLines.removeIf(line -> line.getProductId().equals(productId));
        recalculateTotal();
    }
    
    public void place() {
        ensureDraftStatus();
        ensureHasItems();
        
        if (this.totalAmount.isGreaterThan(Money.of(10000))) {
            this.status = OrderStatus.PENDING_APPROVAL;
        } else {
            this.status = OrderStatus.PLACED;
        }
        
        DomainEvents.raise(new OrderPlacedEvent(this.id, this.customerId, this.totalAmount));
    }
    
    public void cancel(CancellationReason reason) {
        ensureCancellable();
        
        this.status = OrderStatus.CANCELLED;
        DomainEvents.raise(new OrderCancelledEvent(this.id, reason));
    }
    
    // Guard methods - protect invariants
    private void ensureDraftStatus() {
        if (this.status != OrderStatus.DRAFT) {
            throw new OrderNotModifiableException(this.id, this.status);
        }
    }
    
    private void ensureHasItems() {
        if (this.orderLines.isEmpty()) {
            throw new EmptyOrderException(this.id);
        }
    }
    
    private void ensureCancellable() {
        if (!this.status.isCancellable()) {
            throw new OrderNotCancellableException(this.id, this.status);
        }
    }
    
    private void recalculateTotal() {
        this.totalAmount = orderLines.stream()
            .map(OrderLine::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
    
    // Getters for read access (no setters!)
    public OrderId getId() { return id; }
    public OrderStatus getStatus() { return status; }
    public Money getTotalAmount() { return totalAmount; }
    public List<OrderLine> getOrderLines() { 
        return Collections.unmodifiableList(orderLines); 
    }
}
```

**Benefits of Rich Model:**
- Business logic in one place
- Object always in valid state
- Self-documenting code
- Easy to test in isolation
- Changes are explicit operations

---

## Model-Code Connection

### From Concept to Code

```
DOMAIN CONCEPT                    CODE IMPLEMENTATION
──────────────                    ──────────────────

"An order contains items"         Order has List<OrderLine>

"Each item has a quantity         OrderLine {
 and price"                         Quantity quantity;
                                    Money unitPrice;
                                  }

"Orders are placed by             Order {
 customers"                         CustomerId customerId;
                                  }

"An order can be cancelled        Order.cancel(reason)
 unless it's shipped"             throws OrderNotCancellableException

"Large orders need approval"      if (total > 10000)
                                    status = PENDING_APPROVAL

"When an order is placed,         DomainEvents.raise(
 inventory is reserved"             new OrderPlacedEvent(...)
                                  )
                                  // Inventory context listens
```

### The Model Should Be Readable

```java
// Someone reading this code should understand the domain
public class InsurancePolicy {
    
    public void bind(UnderwritingApproval approval) {
        // "Bind" is insurance terminology
        ensureQuoted();
        approval.ensureValid();
        
        this.status = PolicyStatus.BOUND;
        this.effectiveDate = approval.getEffectiveDate();
        this.boundAt = Instant.now();
        
        DomainEvents.raise(new PolicyBoundEvent(this.policyNumber, this.insured));
    }
    
    public void endorse(Endorsement endorsement) {
        // "Endorse" means to modify a policy mid-term
        ensureActive();
        endorsement.validate(this);
        
        this.endorsements.add(endorsement);
        this.premium = recalculatePremium();
        
        DomainEvents.raise(new PolicyEndorsedEvent(this.policyNumber, endorsement));
    }
    
    public Claim fileClaim(ClaimDetails details) {
        ensureActive();
        ensureWithinCoveragePeriod(details.getIncidentDate());
        
        Claim claim = Claim.file(this, details);
        this.claims.add(claim);
        
        return claim;
    }
}
```

---

## Modeling Process

### Step 1: Knowledge Crunching

```
┌─────────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE CRUNCHING                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Developer: "Tell me about placing an order"                        │
│                                                                      │
│  Domain Expert: "Well, the customer adds items to their cart,       │
│  then when they're ready, they proceed to checkout. We check        │
│  if items are in stock, calculate shipping, apply any discounts,    │
│  and then the customer provides payment information..."             │
│                                                                      │
│  Developer: "Wait - what's the difference between a cart and        │
│  an order?"                                                          │
│                                                                      │
│  Domain Expert: "Good question! A cart is temporary - it's just     │
│  items the customer is considering. An order is a commitment        │
│  to purchase. The cart becomes an order when they checkout."        │
│                                                                      │
│  Developer: "Can items be removed after checkout?"                  │
│                                                                      │
│  Domain Expert: "No, once it's an order, they'd need to cancel      │
│  the whole order or specific items through our returns process."    │
│                                                                      │
│  INSIGHT: Cart and Order are different concepts!                    │
│  Cart → Draft/tentative                                             │
│  Order → Committed/locked                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 2: Model Exploration

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MODEL EXPLORATION                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Model Attempt 1:                                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Order (starts as cart, becomes order)                        │   │
│  │  status: CART → CHECKOUT → PLACED → ...                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  Problem: Cart behavior (add/remove freely) vs Order behavior       │
│  (locked) don't fit well together                                   │
│                                                                      │
│  Model Attempt 2:                                                   │
│  ┌───────────────┐     checkout      ┌───────────────┐             │
│  │    Cart       │ ─────────────────►│    Order      │             │
│  │               │                    │               │             │
│  │ • addItem()   │                    │ • place()     │             │
│  │ • removeItem()│                    │ • cancel()    │             │
│  │ • checkout()  │                    │ • ship()      │             │
│  └───────────────┘                    └───────────────┘             │
│  Better: Separate concepts with clear transition                    │
│                                                                      │
│  Model Attempt 3:                                                   │
│  ┌───────────────┐                    ┌───────────────┐             │
│  │ ShoppingCart  │──► creates ──────► │    Order      │             │
│  └───────────────┘                    └───────────────┘             │
│  │                                    │                             │
│  │ Temporary                          │ Permanent                   │
│  │ No ID needed                       │ Has OrderId                 │
│  │ Mutable                            │ Status-controlled           │
│  │ Customer-facing                    │ System-of-record            │
│  │                                    │                             │
│  BEST: Clear separation of concerns                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 3: Iterate and Refine

```java
// First iteration - simple
public class Order {
    private List<Item> items;
    private String status;
}

// After learning about pricing complexity
public class Order {
    private List<OrderLine> orderLines;  // Not just items - line items with prices
    private OrderStatus status;
    private Money subtotal;
    private Money discount;
    private Money tax;
    private Money total;
}

// After learning about promotions
public class Order {
    private List<OrderLine> orderLines;
    private OrderStatus status;
    private List<AppliedPromotion> appliedPromotions;  // Track what discounts applied
    private PricingSummary pricing;  // Encapsulate pricing complexity
}

// After learning about split shipments
public class Order {
    private List<OrderLine> orderLines;
    private OrderStatus status;
    private List<AppliedPromotion> appliedPromotions;
    private PricingSummary pricing;
    private List<Shipment> shipments;  // An order can have multiple shipments!
    private FulfillmentStrategy fulfillmentStrategy;  // How to fulfill this order
}
```

---

## Guidelines for Good Models

### 1. Express Domain Concepts Explicitly

```java
// ❌ Implicit concepts
public class Order {
    private BigDecimal amount;  // What kind of amount?
    private String type;        // Magic strings
    private int state;          // Magic numbers
}

// ✅ Explicit concepts
public class Order {
    private Money totalAmount;           // Value object with currency
    private OrderType type;              // Enum with meaning
    private OrderStatus status;          // Explicit state machine
}
```

### 2. Encapsulate Business Rules

```java
// ❌ Rules scattered
public class OrderService {
    public void ship(Order order) {
        if (order.getStatus() != OrderStatus.PAID) { /*...*/ }
        if (order.getItems().stream().anyMatch(i -> !i.isInStock())) { /*...*/ }
        // etc.
    }
}

// ✅ Rules in domain
public class Order {
    public void ship() {
        ensureCanBeShipped();  // All rules checked internally
        this.status = OrderStatus.SHIPPED;
    }
    
    private void ensureCanBeShipped() {
        if (this.status != OrderStatus.PAID) {
            throw new UnpaidOrderException(this.id);
        }
        if (!allItemsReserved()) {
            throw new ItemsNotReservedException(this.id);
        }
    }
}
```

### 3. Make Implicit Concepts Explicit

```java
// ❌ Implicit policy
public class PricingService {
    public BigDecimal calculatePrice(Product product, Customer customer) {
        BigDecimal price = product.getBasePrice();
        if (customer.isPremium()) {
            price = price.multiply(BigDecimal.valueOf(0.9));  // 10% off
        }
        if (customer.getOrderCount() > 10) {
            price = price.multiply(BigDecimal.valueOf(0.95));  // 5% loyalty
        }
        return price;
    }
}

// ✅ Explicit policy
public class PricingPolicy {
    private final List<Discount> discounts;
    
    public Money calculatePrice(Product product, Customer customer) {
        Money basePrice = product.getBasePrice();
        
        return discounts.stream()
            .filter(d -> d.appliesTo(customer))
            .reduce(basePrice, 
                    (price, discount) -> discount.apply(price),
                    (p1, p2) -> p1);
    }
}

public interface Discount {
    boolean appliesTo(Customer customer);
    Money apply(Money price);
}

public class PremiumCustomerDiscount implements Discount {
    private static final Percentage DISCOUNT = Percentage.of(10);
    
    public boolean appliesTo(Customer customer) {
        return customer.isPremium();
    }
    
    public Money apply(Money price) {
        return price.subtract(price.percentage(DISCOUNT));
    }
}
```

---

## Key Takeaways

1. **The model IS the code** - Not just diagrams or documentation

2. **Rich domain models encapsulate behavior** - Not just data

3. **Use the Ubiquitous Language** - Code should read like domain conversations

4. **Knowledge crunching is iterative** - Models evolve with understanding

5. **Make implicit concepts explicit** - Name things, create types

6. **Protect invariants** - Objects should always be in valid states

---

## What's Next?

In [Chapter 9: Entities](./09-entities.md), we'll explore the first building block in detail - objects defined by their identity rather than their attributes.

---

**[← Previous: Subdomains](./07-subdomains.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Entities →](./09-entities.md)**
