# Chapter 9: Entities

> *"Many objects are not fundamentally defined by their attributes, but rather by a thread of continuity and identity."*
> — Eric Evans

---

## What is an Entity?

An **Entity** is an object defined primarily by its identity, rather than its attributes. Even if all attributes change, the entity remains the same as long as its identity persists.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ENTITY CONCEPT                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Consider a PERSON:                                                │
│                                                                      │
│   ┌─────────────────────┐      ┌─────────────────────┐             │
│   │ Person (age 25)      │      │ Person (age 50)     │             │
│   │                      │      │                     │             │
│   │ name: "John Smith"   │      │ name: "John Smith"  │             │
│   │ address: "123 Oak"   │  →   │ address: "456 Pine" │             │
│   │ email: "j@mail.com"  │      │ email: "john@co.io" │             │
│   │ weight: 70kg         │      │ weight: 85kg        │             │
│   │                      │      │                     │             │
│   │ SSN: 123-45-6789     │      │ SSN: 123-45-6789    │             │
│   └─────────────────────┘      └─────────────────────┘             │
│                                                                      │
│   ALL attributes changed, but it's STILL THE SAME PERSON           │
│   because the IDENTITY (SSN) is the same.                          │
│                                                                      │
│   ═══════════════════════════════════════════════════════════       │
│                                                                      │
│   Compare to a $20 BILL:                                            │
│                                                                      │
│   ┌─────────────────────┐      ┌─────────────────────┐             │
│   │ $20 Bill             │      │ $20 Bill            │             │
│   │                      │      │                     │             │
│   │ currency: USD        │      │ currency: USD       │             │
│   │ value: 20            │      │ value: 20           │             │
│   └─────────────────────┘      └─────────────────────┘             │
│                                                                      │
│   These are INTERCHANGEABLE. You don't care WHICH $20 bill         │
│   you have, only that it's $20 USD. (This is a Value Object)       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Characteristics of Entities

### 1. Identity

Entities have a unique identity that distinguishes them from all other entities:

```java
public class Customer {
    private final CustomerId id;  // Identity - never changes
    private Name name;            // Can change
    private Email email;          // Can change
    private Address address;      // Can change
    
    // Two customers with same name are NOT the same customer
}
```

### 2. Lifecycle

Entities have a lifecycle - they are created, changed over time, and eventually archived or deleted:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ENTITY LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ORDER LIFECYCLE:                                                  │
│                                                                      │
│   Created    Modified     Modified     Modified      Archived       │
│      │          │            │            │             │           │
│      ▼          ▼            ▼            ▼             ▼           │
│   ┌──────┐  ┌──────┐    ┌──────┐    ┌──────┐     ┌──────┐         │
│   │DRAFT │─►│PLACED│───►│PAID  │───►│SHIPPED│────►│COMPL.│         │
│   └──────┘  └──────┘    └──────┘    └──────┘     └──────┘         │
│                                                                      │
│   Same OrderId throughout entire lifecycle                          │
│   State/attributes change, identity remains                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Equality by Identity

Two entities are equal if and only if they have the same identity:

```java
public class Order {
    private final OrderId id;
    private List<OrderLine> orderLines;
    private OrderStatus status;
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Order other = (Order) obj;
        // Equality based on ID only, not attributes
        return this.id.equals(other.id);
    }
    
    @Override
    public int hashCode() {
        return id.hashCode();
    }
}

// Example
Order order1 = orderRepository.findById(orderId);
Order order2 = orderRepository.findById(orderId);

order1.addItem(product, quantity);  // order1 modified

order1.equals(order2);  // TRUE - same identity
// Even though attributes differ!
```

---

## Implementing Entities

### Basic Structure

```java
public class Customer {
    
    // ═══════════════════════════════════════════════════════════
    // IDENTITY - Immutable, set at creation
    // ═══════════════════════════════════════════════════════════
    private final CustomerId id;
    
    // ═══════════════════════════════════════════════════════════
    // ATTRIBUTES - Can change over lifecycle
    // ═══════════════════════════════════════════════════════════
    private Name name;
    private Email email;
    private PhoneNumber phone;
    private Address address;
    private CustomerStatus status;
    private CustomerTier tier;
    
    // ═══════════════════════════════════════════════════════════
    // CREATION - Constructor or factory method
    // ═══════════════════════════════════════════════════════════
    public Customer(CustomerId id, Name name, Email email) {
        this.id = Objects.requireNonNull(id, "ID required");
        this.name = Objects.requireNonNull(name, "Name required");
        this.email = Objects.requireNonNull(email, "Email required");
        this.status = CustomerStatus.ACTIVE;
        this.tier = CustomerTier.STANDARD;
    }
    
    // ═══════════════════════════════════════════════════════════
    // BEHAVIOR - Business operations
    // ═══════════════════════════════════════════════════════════
    public void updateContactInfo(Email newEmail, PhoneNumber newPhone) {
        this.email = Objects.requireNonNull(newEmail);
        this.phone = newPhone;  // Phone is optional
        
        DomainEvents.raise(new CustomerContactUpdatedEvent(this.id));
    }
    
    public void upgradeToPreferredTier() {
        if (this.tier == CustomerTier.PREFERRED) {
            throw new AlreadyPreferredCustomerException(this.id);
        }
        this.tier = CustomerTier.PREFERRED;
        DomainEvents.raise(new CustomerUpgradedEvent(this.id, this.tier));
    }
    
    public void deactivate(DeactivationReason reason) {
        if (this.status == CustomerStatus.INACTIVE) {
            throw new CustomerAlreadyInactiveException(this.id);
        }
        this.status = CustomerStatus.INACTIVE;
        DomainEvents.raise(new CustomerDeactivatedEvent(this.id, reason));
    }
    
    // ═══════════════════════════════════════════════════════════
    // IDENTITY METHODS - equals and hashCode based on ID
    // ═══════════════════════════════════════════════════════════
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Customer other = (Customer) obj;
        return id.equals(other.id);
    }
    
    @Override
    public int hashCode() {
        return id.hashCode();
    }
    
    // ═══════════════════════════════════════════════════════════
    // GETTERS - Read access to state
    // ═══════════════════════════════════════════════════════════
    public CustomerId getId() { return id; }
    public Name getName() { return name; }
    public Email getEmail() { return email; }
    public CustomerStatus getStatus() { return status; }
    public CustomerTier getTier() { return tier; }
}
```

### Identity Generation Strategies

```java
// ═══════════════════════════════════════════════════════════════════
// STRATEGY 1: UUID - Most common, globally unique
// ═══════════════════════════════════════════════════════════════════
public class OrderId {
    private final UUID value;
    
    private OrderId(UUID value) {
        this.value = value;
    }
    
    public static OrderId generate() {
        return new OrderId(UUID.randomUUID());
    }
    
    public static OrderId of(String value) {
        return new OrderId(UUID.fromString(value));
    }
    
    public String getValue() {
        return value.toString();
    }
}

// ═══════════════════════════════════════════════════════════════════
// STRATEGY 2: Sequence/Auto-increment - Database generated
// ═══════════════════════════════════════════════════════════════════
// Less ideal for DDD - identity not available until persisted
@Entity
public class LegacyOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;  // Available only after save()
}

// ═══════════════════════════════════════════════════════════════════
// STRATEGY 3: Natural/Business Key - From domain
// ═══════════════════════════════════════════════════════════════════
public class PolicyNumber {
    private final String value;  // e.g., "POL-2024-00001234"
    
    // Generated by business rules
    public static PolicyNumber generate(ProductLine product, LocalDate date) {
        String sequence = getNextSequence();
        String prefix = product.getCode();
        String year = String.valueOf(date.getYear());
        return new PolicyNumber(prefix + "-" + year + "-" + sequence);
    }
}

// ═══════════════════════════════════════════════════════════════════
// STRATEGY 4: ULID - Sortable, URL-safe
// ═══════════════════════════════════════════════════════════════════
public class EventId {
    private final String value;  // ULID: 01ARZ3NDEKTSV4RRFFQ69G5FAV
    
    public static EventId generate() {
        return new EventId(ULID.random());
    }
}
```

### Typed Identities

**Always use typed identities, never primitive types:**

```java
// ❌ BAD: Primitive IDs
public class OrderService {
    public void ship(Long orderId, Long customerId, Long warehouseId) {
        // Easy to mix up parameters!
        // ship(customerId, orderId, warehouseId) compiles but is wrong
    }
}

// ✅ GOOD: Typed IDs
public class OrderService {
    public void ship(OrderId orderId, CustomerId customerId, WarehouseId warehouseId) {
        // Compiler prevents mixing up parameters
        // Type safety!
    }
}

// Typed ID implementation
public class OrderId {
    private final UUID value;
    
    private OrderId(UUID value) {
        this.value = Objects.requireNonNull(value);
    }
    
    public static OrderId generate() {
        return new OrderId(UUID.randomUUID());
    }
    
    public static OrderId of(String value) {
        return new OrderId(UUID.fromString(value));
    }
    
    public UUID getValue() { return value; }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        OrderId other = (OrderId) obj;
        return value.equals(other.value);
    }
    
    @Override
    public int hashCode() {
        return value.hashCode();
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
}
```

---

## Entity Behavior

### Encapsulating State Changes

```java
public class Account {
    private final AccountId id;
    private Money balance;
    private AccountStatus status;
    private List<Transaction> transactions;
    
    // ═══════════════════════════════════════════════════════════
    // DON'T: Expose setters that allow invalid states
    // ═══════════════════════════════════════════════════════════
    // public void setBalance(Money balance) { this.balance = balance; }
    // public void setStatus(AccountStatus status) { this.status = status; }
    
    // ═══════════════════════════════════════════════════════════
    // DO: Expose meaningful business operations
    // ═══════════════════════════════════════════════════════════
    
    public Transaction deposit(Money amount) {
        ensureActive();
        ensurePositiveAmount(amount);
        
        this.balance = this.balance.add(amount);
        
        Transaction tx = Transaction.deposit(this.id, amount);
        this.transactions.add(tx);
        
        DomainEvents.raise(new FundsDepositedEvent(this.id, amount));
        
        return tx;
    }
    
    public Transaction withdraw(Money amount) {
        ensureActive();
        ensurePositiveAmount(amount);
        ensureSufficientFunds(amount);
        
        this.balance = this.balance.subtract(amount);
        
        Transaction tx = Transaction.withdrawal(this.id, amount);
        this.transactions.add(tx);
        
        DomainEvents.raise(new FundsWithdrawnEvent(this.id, amount));
        
        return tx;
    }
    
    public void freeze(FreezeReason reason) {
        if (this.status == AccountStatus.FROZEN) {
            throw new AccountAlreadyFrozenException(this.id);
        }
        
        this.status = AccountStatus.FROZEN;
        DomainEvents.raise(new AccountFrozenEvent(this.id, reason));
    }
    
    public void close() {
        ensureZeroBalance();
        
        this.status = AccountStatus.CLOSED;
        DomainEvents.raise(new AccountClosedEvent(this.id));
    }
    
    // Guard methods
    private void ensureActive() {
        if (this.status != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException(this.id, this.status);
        }
    }
    
    private void ensurePositiveAmount(Money amount) {
        if (amount.isNegativeOrZero()) {
            throw new InvalidAmountException(amount);
        }
    }
    
    private void ensureSufficientFunds(Money amount) {
        if (this.balance.isLessThan(amount)) {
            throw new InsufficientFundsException(this.id, this.balance, amount);
        }
    }
    
    private void ensureZeroBalance() {
        if (!this.balance.isZero()) {
            throw new AccountHasBalanceException(this.id, this.balance);
        }
    }
}
```

### State Machines in Entities

```java
public class Order {
    private final OrderId id;
    private OrderStatus status;
    
    public void place() {
        ensureStatus(OrderStatus.DRAFT, "place");
        this.status = OrderStatus.PLACED;
    }
    
    public void pay(PaymentConfirmation payment) {
        ensureStatus(OrderStatus.PLACED, "pay");
        this.status = OrderStatus.PAID;
    }
    
    public void ship(ShipmentInfo shipment) {
        ensureStatus(OrderStatus.PAID, "ship");
        this.status = OrderStatus.SHIPPED;
    }
    
    public void deliver() {
        ensureStatus(OrderStatus.SHIPPED, "deliver");
        this.status = OrderStatus.DELIVERED;
    }
    
    public void cancel(CancellationReason reason) {
        if (!this.status.isCancellable()) {
            throw new OrderNotCancellableException(this.id, this.status);
        }
        this.status = OrderStatus.CANCELLED;
    }
    
    private void ensureStatus(OrderStatus required, String operation) {
        if (this.status != required) {
            throw new InvalidOrderStateException(
                this.id, operation, required, this.status
            );
        }
    }
}

public enum OrderStatus {
    DRAFT(true),
    PLACED(true),
    PAID(false),
    SHIPPED(false),
    DELIVERED(false),
    CANCELLED(false);
    
    private final boolean cancellable;
    
    OrderStatus(boolean cancellable) {
        this.cancellable = cancellable;
    }
    
    public boolean isCancellable() {
        return cancellable;
    }
}
```

---

## Common Entity Patterns

### Base Entity Class

```java
public abstract class Entity<ID> {
    
    public abstract ID getId();
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Entity<?> other = (Entity<?>) obj;
        return getId() != null && getId().equals(other.getId());
    }
    
    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
}

// Usage
public class Order extends Entity<OrderId> {
    private final OrderId id;
    
    @Override
    public OrderId getId() {
        return id;
    }
    
    // Business methods...
}
```

### Entity with Audit Trail

```java
public class AuditableEntity<ID> extends Entity<ID> {
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime lastModifiedAt;
    private String lastModifiedBy;
    private Long version;  // For optimistic locking
    
    protected void markCreated(String user) {
        this.createdAt = LocalDateTime.now();
        this.createdBy = user;
        this.lastModifiedAt = this.createdAt;
        this.lastModifiedBy = user;
        this.version = 0L;
    }
    
    protected void markModified(String user) {
        this.lastModifiedAt = LocalDateTime.now();
        this.lastModifiedBy = user;
    }
}
```

---

## Entity vs Value Object Decision

```
┌─────────────────────────────────────────────────────────────────────┐
│              ENTITY OR VALUE OBJECT?                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Ask these questions:                                               │
│                                                                      │
│  1. Do we need to track this specific instance over time?           │
│     YES → Entity                                                    │
│     NO  → Value Object                                              │
│                                                                      │
│  2. Can two instances with same attributes be interchanged?         │
│     YES → Value Object                                              │
│     NO  → Entity                                                    │
│                                                                      │
│  3. Does it have a lifecycle (created, modified, archived)?         │
│     YES → Entity                                                    │
│     NO  → Value Object                                              │
│                                                                      │
│  4. Does the domain care about "which one" vs "what kind"?          │
│     "Which one" → Entity                                            │
│     "What kind" → Value Object                                      │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  EXAMPLES                                                           │
│                                                                      │
│  ENTITY                          VALUE OBJECT                       │
│  • Customer                      • Money ($20)                      │
│  • Order                         • Address                          │
│  • Product                       • DateRange                        │
│  • Employee                      • Email                            │
│  • Account                       • PhoneNumber                      │
│  • Shipment                      • Quantity                         │
│  • Reservation                   • Color                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Entities are defined by identity** - Not by their attributes

2. **Identity must be immutable** - Set at creation, never changes

3. **Use typed identities** - Never primitives like Long or String

4. **Encapsulate state changes** - Through meaningful operations, not setters

5. **Equals and hashCode use identity only** - Not attributes

6. **Entities have lifecycles** - They change over time but remain themselves

---

## What's Next?

In [Chapter 10: Value Objects](./10-value-objects.md), we'll explore objects defined entirely by their attributes—the complement to Entities in your domain model.

---

**[← Previous: Domain Model](./08-domain-model.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Value Objects →](./10-value-objects.md)**
