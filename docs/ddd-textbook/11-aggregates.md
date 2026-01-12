# Chapter 11: Aggregates and Aggregate Roots

> *"Cluster the Entities and Value Objects into Aggregates and define boundaries around each."*
> — Eric Evans

---

## What is an Aggregate?

An **Aggregate** is a cluster of domain objects (Entities and Value Objects) that are treated as a single unit for data changes. Every Aggregate has a root entity called the **Aggregate Root**, which is the only member of the aggregate that external objects can reference.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AGGREGATE CONCEPT                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   An ORDER Aggregate:                                               │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     AGGREGATE BOUNDARY                       │   │
│   │                                                              │   │
│   │         ┌────────────────────────────────┐                  │   │
│   │         │      ORDER (Root Entity)        │                  │   │
│   │         │                                 │                  │   │
│   │         │  - orderId (identity)           │                  │   │
│   │         │  - customerId (reference)       │◄─── Only the root│   │
│   │         │  - status                       │     is accessible│   │
│   │         │  - totalAmount                  │     from outside │   │
│   │         │                                 │                  │   │
│   │         └──────────────┬──────────────────┘                  │   │
│   │                        │ owns                                │   │
│   │         ┌──────────────┴──────────────┐                     │   │
│   │         │                             │                      │   │
│   │    ┌────┴─────┐                 ┌─────┴────┐                │   │
│   │    │OrderLine │                 │OrderLine │                │   │
│   │    │(Entity)  │                 │(Entity)  │                │   │
│   │    │          │                 │          │                │   │
│   │    │-lineId   │                 │-lineId   │                │   │
│   │    │-product  │                 │-product  │                │   │
│   │    │-quantity │                 │-quantity │                │   │
│   │    │-price    │                 │-price    │                │   │
│   │    └──────────┘                 └──────────┘                │   │
│   │                                                              │   │
│   │    Shipping     │    Payment     (Value Objects)            │   │
│   │    Address      │    Info                                   │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Outside code can only interact through the Order (root)           │
│   NOT directly with OrderLines                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Why Aggregates?

### The Problem: Inconsistent Data

Without aggregates, any code can modify any object:

```java
// ❌ WITHOUT AGGREGATES: Anyone can modify anything

public class Order {
    public List<OrderLine> lines;  // Public access!
    public BigDecimal totalAmount;
}

// Scattered code modifying directly
orderLine.setQuantity(5);                    // Changed quantity
orderLine.setUnitPrice(newPrice);            // Changed price
// But forgot to update order total!

order.getLines().add(newLine);               // Added a line
// But forgot to recalculate total!

order.getLines().remove(line);               // Removed a line
// But forgot to check if order can be modified!

// RESULT: Order.totalAmount doesn't match sum of lines
// DATA IS INCONSISTENT
```

### The Solution: Aggregates

```java
// ✅ WITH AGGREGATES: All changes go through the root

public class Order {  // Aggregate Root
    private final OrderId id;
    private final List<OrderLine> lines = new ArrayList<>();  // Private!
    private Money totalAmount;
    private OrderStatus status;
    
    public void addLine(Product product, Quantity quantity) {
        ensureCanBeModified();
        OrderLine line = new OrderLine(product, quantity);
        this.lines.add(line);
        recalculateTotal();  // Always consistent!
    }
    
    public void removeLine(OrderLineId lineId) {
        ensureCanBeModified();
        this.lines.removeIf(l -> l.getId().equals(lineId));
        recalculateTotal();  // Always consistent!
    }
    
    public void updateLineQuantity(OrderLineId lineId, Quantity newQuantity) {
        ensureCanBeModified();
        OrderLine line = findLine(lineId);
        line.updateQuantity(newQuantity);  // Internal entity can be modified
        recalculateTotal();  // Always consistent!
    }
    
    private void ensureCanBeModified() {
        if (this.status != OrderStatus.DRAFT) {
            throw new OrderNotModifiableException(this.id);
        }
    }
    
    private void recalculateTotal() {
        this.totalAmount = lines.stream()
            .map(OrderLine::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
}

// RESULT: Total is ALWAYS correct
// Business rules are ALWAYS enforced
// Data is ALWAYS consistent
```

---

## Aggregate Rules

### Rule 1: Reference by Identity Only

External objects should reference aggregates only by their root's identity:

```java
// ❌ WRONG: Holding reference to internal entity
public class Shipment {
    private OrderLine orderLine;  // Direct reference to internal entity!
}

// ✅ RIGHT: Reference by ID only
public class Shipment {
    private OrderId orderId;        // Reference to aggregate root
    private OrderLineId lineId;     // ID of internal entity (if needed)
}

// When you need the actual object, go through the repository
public class ShipmentService {
    public void ship(Shipment shipment) {
        Order order = orderRepository.findById(shipment.getOrderId());
        OrderLine line = order.findLine(shipment.getLineId());
        // Work with the line through the order
    }
}
```

### Rule 2: All Changes Through Root

Only the aggregate root can be obtained from repositories:

```java
// ❌ WRONG: Repository for internal entity
public interface OrderLineRepository {
    OrderLine findById(OrderLineId id);  // DON'T DO THIS!
    void save(OrderLine line);           // DON'T DO THIS!
}

// ✅ RIGHT: Repository for aggregate root only
public interface OrderRepository {
    Optional<Order> findById(OrderId id);
    void save(Order order);  // Saves the entire aggregate
}

// To modify an OrderLine, go through Order
public class OrderService {
    public void updateLineQuantity(OrderId orderId, OrderLineId lineId, Quantity qty) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        order.updateLineQuantity(lineId, qty);  // Through the root!
        
        orderRepository.save(order);  // Save entire aggregate
    }
}
```

### Rule 3: Transactional Consistency Within Aggregate

One transaction = one aggregate modification:

```java
// ✅ GOOD: Single aggregate per transaction
@Transactional
public void placeOrder(OrderId orderId) {
    Order order = orderRepository.findById(orderId);
    order.place();  // Modifies only this aggregate
    orderRepository.save(order);
}

// ❌ BAD: Multiple aggregates in one transaction
@Transactional
public void placeOrderAndReserveInventory(OrderId orderId) {
    Order order = orderRepository.findById(orderId);
    order.place();
    
    // DON'T modify other aggregates in same transaction!
    for (OrderLine line : order.getLines()) {
        InventoryItem item = inventoryRepository.findBySku(line.getSku());
        item.reserve(line.getQuantity());  // Different aggregate!
        inventoryRepository.save(item);
    }
}

// ✅ GOOD: Use domain events for cross-aggregate consistency
@Transactional
public void placeOrder(OrderId orderId) {
    Order order = orderRepository.findById(orderId);
    order.place();  // Raises OrderPlacedEvent
    orderRepository.save(order);
}

// In a separate transaction, triggered by event
@EventHandler
@Transactional
public void reserveInventory(OrderPlacedEvent event) {
    for (OrderLineData line : event.getLines()) {
        InventoryItem item = inventoryRepository.findBySku(line.getSku());
        item.reserve(line.getQuantity());
        inventoryRepository.save(item);
    }
}
```

### Rule 4: Eventual Consistency Across Aggregates

Different aggregates are eventually consistent, not immediately:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  CONSISTENCY MODEL                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   WITHIN AGGREGATE: Immediate/Strong Consistency                    │
│   ─────────────────────────────────────────────                     │
│                                                                      │
│   ┌─────────────────────────────────────────┐                      │
│   │              ORDER AGGREGATE             │                      │
│   │                                          │                      │
│   │   Order.addLine() →                      │                      │
│   │     ├─ Line created                      │  All happen          │
│   │     ├─ Total recalculated               │  in same             │
│   │     └─ Invariants checked               │  transaction         │
│   │                                          │                      │
│   │   100% consistent IMMEDIATELY           │                      │
│   └─────────────────────────────────────────┘                      │
│                                                                      │
│   ACROSS AGGREGATES: Eventual Consistency                           │
│   ───────────────────────────────────────                           │
│                                                                      │
│   ┌──────────┐   Event    ┌──────────┐   Event    ┌──────────┐    │
│   │  ORDER   │──────────►│INVENTORY │──────────►│ SHIPPING │    │
│   │          │            │          │            │          │    │
│   │ placed() │            │reserve() │            │prepare() │    │
│   └──────────┘            └──────────┘            └──────────┘    │
│        │                       │                       │           │
│        └──── Transaction 1 ────┴── Transaction 2 ──────┘           │
│                                                                      │
│   Consistent EVENTUALLY (milliseconds to seconds)                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Designing Aggregates

### Determining Aggregate Boundaries

Ask these questions:
1. **What must be consistent together?** → Same aggregate
2. **What can be eventually consistent?** → Different aggregates
3. **What is loaded/saved together?** → Same aggregate (usually)
4. **What do transactions need to lock?** → Keep aggregates small

```
┌─────────────────────────────────────────────────────────────────────┐
│              AGGREGATE BOUNDARY DECISION                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   SCENARIO: E-commerce Order with Customer                          │
│                                                                      │
│   Option A: Large Aggregate                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    ORDER AGGREGATE                           │   │
│   │                                                              │   │
│   │   Order ──────┬───── OrderLine                              │   │
│   │               │                                              │   │
│   │               └───── Customer ──── Address                  │   │
│   │                         │                                    │   │
│   │                         └──── PaymentMethod                 │   │
│   │                                                              │   │
│   │   Problems:                                                  │   │
│   │   • Modifying customer locks the order                      │   │
│   │   • Loading order loads entire customer                     │   │
│   │   • Customer changes in two orders = conflict               │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Option B: Smaller Aggregates (PREFERRED)                          │
│   ┌─────────────────────┐  ┌─────────────────────────────────┐     │
│   │   ORDER AGGREGATE   │  │      CUSTOMER AGGREGATE          │     │
│   │                     │  │                                   │     │
│   │   Order             │  │  Customer                         │     │
│   │     │               │  │     │                             │     │
│   │     └─ OrderLine    │  │     ├─ Address                   │     │
│   │     │               │  │     │                             │     │
│   │     └─ customerId ◄─┼──│     └─ PaymentMethod             │     │
│   │        (reference)  │  │                                   │     │
│   └─────────────────────┘  └─────────────────────────────────┘     │
│                                                                      │
│   Benefits:                                                         │
│   • Order and Customer can be modified independently               │
│   • Smaller transactions, less contention                          │
│   • Load only what you need                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Keep Aggregates Small

```java
// ❌ TOO LARGE: Catalog with all products
public class Catalog {  // Aggregate Root
    private CatalogId id;
    private List<Category> categories;      // Could be thousands
    private List<Product> products;         // Could be millions!
    
    public void addProduct(Product product) {
        this.products.add(product);  // Loading millions of products!
    }
}

// ✅ RIGHT SIZE: Product is its own aggregate
public class Product {  // Aggregate Root
    private ProductId id;
    private CategoryId categoryId;  // Reference by ID
    private List<ProductVariant> variants;  // Limited number
    private List<ProductImage> images;      // Limited number
    private ProductPricing pricing;         // Value object
}

public class Category {  // Separate Aggregate Root
    private CategoryId id;
    private CategoryName name;
    private CategoryId parentId;  // Reference by ID
    // Does NOT contain List<Product>
}
```

### Aggregate Design Rules of Thumb

```
┌─────────────────────────────────────────────────────────────────────┐
│              AGGREGATE SIZING GUIDELINES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✓ Prefer SMALLER aggregates                                        │
│    • Reduces contention                                             │
│    • Faster to load and save                                        │
│    • Easier to reason about                                         │
│                                                                      │
│  ✓ Include what MUST be immediately consistent                      │
│    • True invariants only                                           │
│    • Not "nice to have" consistency                                 │
│                                                                      │
│  ✓ Reference other aggregates by ID                                 │
│    • Not by direct object reference                                 │
│    • Allows independent scaling                                     │
│                                                                      │
│  ✓ Use eventual consistency when possible                           │
│    • Domain events for cross-aggregate updates                      │
│    • Accept that not everything is immediate                        │
│                                                                      │
│  ✗ DON'T create large aggregates because:                          │
│    • "It's convenient to navigate"                                  │
│    • "We always need that data"                                     │
│    • "Transactions should include everything"                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementing Aggregates

### Complete Aggregate Example

```java
// ═══════════════════════════════════════════════════════════════════
// ORDER AGGREGATE
// ═══════════════════════════════════════════════════════════════════

public class Order {  // Aggregate Root
    
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> lines;
    private ShippingAddress shippingAddress;
    private OrderStatus status;
    private Money subtotal;
    private Money tax;
    private Money total;
    private LocalDateTime createdAt;
    private LocalDateTime placedAt;
    
    // ═══════════════════════════════════════════════════════════════
    // CREATION
    // ═══════════════════════════════════════════════════════════════
    
    public static Order create(CustomerId customerId, ShippingAddress address) {
        Order order = new Order(OrderId.generate(), customerId);
        order.shippingAddress = Objects.requireNonNull(address);
        order.status = OrderStatus.DRAFT;
        order.createdAt = LocalDateTime.now();
        return order;
    }
    
    private Order(OrderId id, CustomerId customerId) {
        this.id = Objects.requireNonNull(id);
        this.customerId = Objects.requireNonNull(customerId);
        this.lines = new ArrayList<>();
        this.subtotal = Money.ZERO;
        this.tax = Money.ZERO;
        this.total = Money.ZERO;
    }
    
    // For reconstitution from persistence
    public static Order reconstitute(
            OrderId id,
            CustomerId customerId,
            List<OrderLine> lines,
            ShippingAddress address,
            OrderStatus status,
            Money subtotal,
            Money tax,
            Money total,
            LocalDateTime createdAt,
            LocalDateTime placedAt) {
        
        Order order = new Order(id, customerId);
        order.lines.addAll(lines);
        order.shippingAddress = address;
        order.status = status;
        order.subtotal = subtotal;
        order.tax = tax;
        order.total = total;
        order.createdAt = createdAt;
        order.placedAt = placedAt;
        return order;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // BEHAVIOR - Order Lines
    // ═══════════════════════════════════════════════════════════════
    
    public OrderLineId addLine(ProductId productId, ProductName name, 
                               Quantity quantity, Money unitPrice) {
        ensureDraft();
        
        // Check if product already in order
        Optional<OrderLine> existing = findLineByProduct(productId);
        if (existing.isPresent()) {
            existing.get().increaseQuantity(quantity);
            recalculateTotals();
            return existing.get().getId();
        }
        
        OrderLine line = new OrderLine(
            OrderLineId.generate(),
            productId,
            name,
            quantity,
            unitPrice
        );
        this.lines.add(line);
        recalculateTotals();
        
        return line.getId();
    }
    
    public void updateLineQuantity(OrderLineId lineId, Quantity newQuantity) {
        ensureDraft();
        
        if (newQuantity.isZero()) {
            removeLine(lineId);
            return;
        }
        
        OrderLine line = findLine(lineId);
        line.setQuantity(newQuantity);
        recalculateTotals();
    }
    
    public void removeLine(OrderLineId lineId) {
        ensureDraft();
        
        boolean removed = this.lines.removeIf(l -> l.getId().equals(lineId));
        if (!removed) {
            throw new OrderLineNotFoundException(this.id, lineId);
        }
        recalculateTotals();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // BEHAVIOR - Order Lifecycle
    // ═══════════════════════════════════════════════════════════════
    
    public void place() {
        ensureDraft();
        ensureHasLines();
        
        this.status = OrderStatus.PLACED;
        this.placedAt = LocalDateTime.now();
        
        DomainEvents.raise(new OrderPlacedEvent(
            this.id,
            this.customerId,
            this.lines.stream()
                .map(OrderLine::toSnapshot)
                .toList(),
            this.total
        ));
    }
    
    public void confirm(PaymentId paymentId) {
        ensureStatus(OrderStatus.PLACED);
        
        this.status = OrderStatus.CONFIRMED;
        
        DomainEvents.raise(new OrderConfirmedEvent(this.id, paymentId));
    }
    
    public void ship(TrackingNumber trackingNumber) {
        ensureStatus(OrderStatus.CONFIRMED);
        
        this.status = OrderStatus.SHIPPED;
        
        DomainEvents.raise(new OrderShippedEvent(this.id, trackingNumber));
    }
    
    public void cancel(CancellationReason reason) {
        if (!this.status.isCancellable()) {
            throw new OrderNotCancellableException(this.id, this.status);
        }
        
        this.status = OrderStatus.CANCELLED;
        
        DomainEvents.raise(new OrderCancelledEvent(this.id, reason));
    }
    
    // ═══════════════════════════════════════════════════════════════
    // INTERNAL LOGIC
    // ═══════════════════════════════════════════════════════════════
    
    private void recalculateTotals() {
        this.subtotal = lines.stream()
            .map(OrderLine::getSubtotal)
            .reduce(Money.ZERO, Money::add);
        
        this.tax = calculateTax(this.subtotal, this.shippingAddress);
        this.total = this.subtotal.add(this.tax);
    }
    
    private Money calculateTax(Money subtotal, ShippingAddress address) {
        // Simplified tax calculation
        TaxRate rate = TaxRate.forRegion(address.getRegion());
        return subtotal.multiply(rate.asFactor());
    }
    
    private OrderLine findLine(OrderLineId lineId) {
        return lines.stream()
            .filter(l -> l.getId().equals(lineId))
            .findFirst()
            .orElseThrow(() -> new OrderLineNotFoundException(this.id, lineId));
    }
    
    private Optional<OrderLine> findLineByProduct(ProductId productId) {
        return lines.stream()
            .filter(l -> l.getProductId().equals(productId))
            .findFirst();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // GUARDS / INVARIANTS
    // ═══════════════════════════════════════════════════════════════
    
    private void ensureDraft() {
        if (this.status != OrderStatus.DRAFT) {
            throw new OrderNotModifiableException(this.id, this.status);
        }
    }
    
    private void ensureStatus(OrderStatus required) {
        if (this.status != required) {
            throw new InvalidOrderStateException(this.id, this.status, required);
        }
    }
    
    private void ensureHasLines() {
        if (this.lines.isEmpty()) {
            throw new EmptyOrderException(this.id);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // READ ACCESS
    // ═══════════════════════════════════════════════════════════════
    
    public OrderId getId() { return id; }
    public CustomerId getCustomerId() { return customerId; }
    public OrderStatus getStatus() { return status; }
    public Money getTotal() { return total; }
    public int getLineCount() { return lines.size(); }
    
    // Return unmodifiable view, not the internal list
    public List<OrderLine> getLines() {
        return Collections.unmodifiableList(lines);
    }
}

// ═══════════════════════════════════════════════════════════════════
// INTERNAL ENTITY - Only accessible through aggregate root
// ═══════════════════════════════════════════════════════════════════

public class OrderLine {
    
    private final OrderLineId id;
    private final ProductId productId;
    private final ProductName productName;
    private Quantity quantity;
    private final Money unitPrice;
    
    OrderLine(OrderLineId id, ProductId productId, ProductName name,
              Quantity quantity, Money unitPrice) {
        this.id = id;
        this.productId = productId;
        this.productName = name;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
    
    // Package-private - only Order can call these
    void setQuantity(Quantity quantity) {
        this.quantity = quantity;
    }
    
    void increaseQuantity(Quantity additional) {
        this.quantity = this.quantity.add(additional);
    }
    
    public Money getSubtotal() {
        return unitPrice.multiply(quantity.getValue());
    }
    
    public OrderLineSnapshot toSnapshot() {
        return new OrderLineSnapshot(productId, productName, quantity, unitPrice);
    }
    
    // Getters
    public OrderLineId getId() { return id; }
    public ProductId getProductId() { return productId; }
    public Quantity getQuantity() { return quantity; }
    public Money getUnitPrice() { return unitPrice; }
}
```

---

## Key Takeaways

1. **Aggregates are consistency boundaries** - Everything inside is immediately consistent

2. **One root per aggregate** - External access only through the root

3. **Reference by ID across aggregates** - Not by direct object reference

4. **One transaction per aggregate** - Use events for cross-aggregate operations

5. **Keep aggregates small** - Include only what must be immediately consistent

6. **Eventual consistency across aggregates** - Accept that not everything is instant

---

## What's Next?

In [Chapter 12: Domain Events](./12-domain-events.md), we'll learn how to capture things that happen in the domain and use them to communicate between aggregates and bounded contexts.

---

**[← Previous: Value Objects](./10-value-objects.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Domain Events →](./12-domain-events.md)**
