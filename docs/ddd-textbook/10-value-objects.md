# Chapter 10: Value Objects

> *"When you care only about the attributes of an element, classify it as a Value Object."*
> — Eric Evans

---

## What is a Value Object?

A **Value Object** is an object defined entirely by its attributes. Two value objects with the same attributes are considered equal and interchangeable. Value Objects have no identity and are immutable.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VALUE OBJECT CONCEPT                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Consider MONEY:                                                   │
│                                                                      │
│   ┌─────────────────┐      ┌─────────────────┐                     │
│   │  $20 Bill       │      │  $20 Bill       │                     │
│   │                 │  =   │                 │                     │
│   │  amount: 20     │      │  amount: 20     │                     │
│   │  currency: USD  │      │  currency: USD  │                     │
│   └─────────────────┘      └─────────────────┘                     │
│                                                                      │
│   These are EQUAL and INTERCHANGEABLE.                              │
│   You don't care WHICH $20 bill you have.                          │
│                                                                      │
│   ═══════════════════════════════════════════════════════════       │
│                                                                      │
│   Consider an ADDRESS:                                              │
│                                                                      │
│   ┌─────────────────────────────┐                                  │
│   │  street: "123 Main St"      │                                  │
│   │  city: "New York"           │                                  │
│   │  zip: "10001"               │                                  │
│   │  country: "USA"             │                                  │
│   └─────────────────────────────┘                                  │
│                                                                      │
│   The address IS its attributes. Two addresses with identical       │
│   values represent the same place.                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Characteristics of Value Objects

### 1. Immutability

Value objects cannot be changed after creation. To "change" a value, create a new one:

```java
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;
    
    public Money(BigDecimal amount, Currency currency) {
        this.amount = amount;
        this.currency = currency;
    }
    
    // Returns NEW Money, doesn't modify this
    public Money add(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }
    
    // Returns NEW Money, doesn't modify this
    public Money subtract(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }
    
    // No setters! Immutable.
}
```

### 2. Equality by Value

Two value objects are equal if all their attributes are equal:

```java
public final class Address {
    private final String street;
    private final String city;
    private final String postalCode;
    private final String country;
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Address other = (Address) obj;
        // Equality based on ALL attributes
        return Objects.equals(street, other.street)
            && Objects.equals(city, other.city)
            && Objects.equals(postalCode, other.postalCode)
            && Objects.equals(country, other.country);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(street, city, postalCode, country);
    }
}

// Usage
Address addr1 = new Address("123 Main St", "NYC", "10001", "USA");
Address addr2 = new Address("123 Main St", "NYC", "10001", "USA");

addr1.equals(addr2);  // TRUE - same values
addr1 == addr2;       // FALSE - different instances, but that's okay!
```

### 3. Self-Validation

Value objects validate themselves at creation:

```java
public final class Email {
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    
    private final String value;
    
    public Email(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidEmailException("Email cannot be empty");
        }
        if (!EMAIL_PATTERN.matcher(value).matches()) {
            throw new InvalidEmailException("Invalid email format: " + value);
        }
        this.value = value.toLowerCase();  // Normalize
    }
    
    public String getValue() {
        return value;
    }
    
    public String getDomain() {
        return value.substring(value.indexOf('@') + 1);
    }
}
```

### 4. Replaceability

Value objects can be completely replaced without affecting identity:

```java
public class Customer {  // Entity
    private final CustomerId id;
    private Email email;        // Value Object - can be replaced
    private Address address;    // Value Object - can be replaced
    
    public void updateEmail(Email newEmail) {
        // Replace the entire value object
        this.email = newEmail;
    }
    
    public void relocate(Address newAddress) {
        // Replace the entire value object
        this.address = newAddress;
    }
}
```

---

## Implementing Value Objects

### Basic Value Object

```java
public final class Money {
    
    public static final Money ZERO = new Money(BigDecimal.ZERO, Currency.getInstance("USD"));
    
    private final BigDecimal amount;
    private final Currency currency;
    
    public Money(BigDecimal amount, Currency currency) {
        this.amount = Objects.requireNonNull(amount, "Amount required")
            .setScale(2, RoundingMode.HALF_UP);
        this.currency = Objects.requireNonNull(currency, "Currency required");
    }
    
    // Factory methods
    public static Money of(BigDecimal amount, String currencyCode) {
        return new Money(amount, Currency.getInstance(currencyCode));
    }
    
    public static Money of(double amount, String currencyCode) {
        return new Money(BigDecimal.valueOf(amount), Currency.getInstance(currencyCode));
    }
    
    public static Money usd(double amount) {
        return of(amount, "USD");
    }
    
    // Operations - all return NEW instances
    public Money add(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }
    
    public Money subtract(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }
    
    public Money multiply(int quantity) {
        return new Money(this.amount.multiply(BigDecimal.valueOf(quantity)), this.currency);
    }
    
    public Money multiply(BigDecimal factor) {
        return new Money(this.amount.multiply(factor), this.currency);
    }
    
    public Money percentage(Percentage percent) {
        return multiply(percent.asFactor());
    }
    
    // Comparisons
    public boolean isGreaterThan(Money other) {
        ensureSameCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }
    
    public boolean isLessThan(Money other) {
        ensureSameCurrency(other);
        return this.amount.compareTo(other.amount) < 0;
    }
    
    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO) == 0;
    }
    
    public boolean isPositive() {
        return this.amount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean isNegative() {
        return this.amount.compareTo(BigDecimal.ZERO) < 0;
    }
    
    // Validation
    private void ensureSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new CurrencyMismatchException(this.currency, other.currency);
        }
    }
    
    // Getters
    public BigDecimal getAmount() { return amount; }
    public Currency getCurrency() { return currency; }
    
    // Equality
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Money other = (Money) obj;
        return amount.compareTo(other.amount) == 0 
            && currency.equals(other.currency);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
    
    @Override
    public String toString() {
        return currency.getSymbol() + amount.toPlainString();
    }
}
```

### Using Java Records (Java 16+)

```java
// Records are perfect for Value Objects!
public record Email(String value) {
    
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    
    // Compact constructor for validation
    public Email {
        if (value == null || value.isBlank()) {
            throw new InvalidEmailException("Email cannot be empty");
        }
        if (!EMAIL_PATTERN.matcher(value).matches()) {
            throw new InvalidEmailException("Invalid email: " + value);
        }
        value = value.toLowerCase();  // Normalize
    }
    
    public String getDomain() {
        return value.substring(value.indexOf('@') + 1);
    }
}

public record Address(
    String street,
    String city,
    String postalCode,
    String country
) {
    public Address {
        Objects.requireNonNull(street, "Street required");
        Objects.requireNonNull(city, "City required");
        Objects.requireNonNull(postalCode, "Postal code required");
        Objects.requireNonNull(country, "Country required");
    }
    
    public String getFullAddress() {
        return String.format("%s, %s, %s, %s", street, city, postalCode, country);
    }
}

public record DateRange(LocalDate start, LocalDate end) {
    
    public DateRange {
        Objects.requireNonNull(start, "Start date required");
        Objects.requireNonNull(end, "End date required");
        if (end.isBefore(start)) {
            throw new InvalidDateRangeException("End must be after start");
        }
    }
    
    public boolean contains(LocalDate date) {
        return !date.isBefore(start) && !date.isAfter(end);
    }
    
    public boolean overlaps(DateRange other) {
        return !this.end.isBefore(other.start) && !other.end.isBefore(this.start);
    }
    
    public long getDays() {
        return ChronoUnit.DAYS.between(start, end) + 1;
    }
}
```

---

## Common Value Objects

### Quantities and Measurements

```java
public record Quantity(int value) {
    
    public Quantity {
        if (value < 0) {
            throw new InvalidQuantityException("Quantity cannot be negative: " + value);
        }
    }
    
    public static Quantity of(int value) {
        return new Quantity(value);
    }
    
    public static Quantity zero() {
        return new Quantity(0);
    }
    
    public Quantity add(Quantity other) {
        return new Quantity(this.value + other.value);
    }
    
    public Quantity subtract(Quantity other) {
        if (other.value > this.value) {
            throw new InsufficientQuantityException(this, other);
        }
        return new Quantity(this.value - other.value);
    }
    
    public boolean isZero() {
        return value == 0;
    }
}

public record Weight(BigDecimal value, WeightUnit unit) {
    
    public Weight {
        Objects.requireNonNull(value);
        Objects.requireNonNull(unit);
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Weight cannot be negative");
        }
    }
    
    public static Weight kilograms(double value) {
        return new Weight(BigDecimal.valueOf(value), WeightUnit.KILOGRAM);
    }
    
    public static Weight pounds(double value) {
        return new Weight(BigDecimal.valueOf(value), WeightUnit.POUND);
    }
    
    public Weight toKilograms() {
        return new Weight(unit.toKilograms(value), WeightUnit.KILOGRAM);
    }
    
    public Weight add(Weight other) {
        Weight otherInSameUnit = other.convertTo(this.unit);
        return new Weight(this.value.add(otherInSameUnit.value), this.unit);
    }
}
```

### Identifiers as Value Objects

```java
// Even IDs can be Value Objects (they have no identity of their own)
public record OrderId(UUID value) {
    
    public OrderId {
        Objects.requireNonNull(value, "OrderId value required");
    }
    
    public static OrderId generate() {
        return new OrderId(UUID.randomUUID());
    }
    
    public static OrderId of(String value) {
        return new OrderId(UUID.fromString(value));
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
}

public record Sku(String value) {
    
    private static final Pattern SKU_PATTERN = Pattern.compile("^[A-Z]{2}-\\d{6}$");
    
    public Sku {
        Objects.requireNonNull(value, "SKU required");
        if (!SKU_PATTERN.matcher(value).matches()) {
            throw new InvalidSkuException("SKU must match pattern XX-000000: " + value);
        }
    }
    
    public String getCategory() {
        return value.substring(0, 2);
    }
}
```

### Domain-Specific Values

```java
public record Percentage(BigDecimal value) {
    
    public static final Percentage ZERO = new Percentage(BigDecimal.ZERO);
    public static final Percentage HUNDRED = new Percentage(BigDecimal.valueOf(100));
    
    public Percentage {
        Objects.requireNonNull(value);
        if (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage must be between 0 and 100: " + value);
        }
    }
    
    public static Percentage of(double value) {
        return new Percentage(BigDecimal.valueOf(value));
    }
    
    public BigDecimal asFactor() {
        return value.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
    }
}

public record PhoneNumber(String countryCode, String number) {
    
    public PhoneNumber {
        Objects.requireNonNull(countryCode);
        Objects.requireNonNull(number);
        // Normalize
        countryCode = countryCode.replaceAll("[^0-9+]", "");
        number = number.replaceAll("[^0-9]", "");
        
        if (!countryCode.startsWith("+")) {
            countryCode = "+" + countryCode;
        }
        if (number.length() < 7 || number.length() > 15) {
            throw new InvalidPhoneNumberException("Invalid phone number length");
        }
    }
    
    public static PhoneNumber of(String fullNumber) {
        // Parse +1-555-123-4567 format
        // Implementation details...
        return new PhoneNumber("+1", "5551234567");
    }
    
    public String getFormatted() {
        return countryCode + " " + formatLocal(number);
    }
}
```

---

## Value Objects vs Primitives

### Replace Primitives with Value Objects

```java
// ❌ BAD: Primitive obsession
public class Order {
    private String orderId;           // What format?
    private String customerEmail;     // Is it validated?
    private BigDecimal totalAmount;   // What currency?
    private String status;            // What values are valid?
    private int quantity;             // Can it be negative?
}

public class OrderService {
    public void process(String orderId, String email, BigDecimal amount) {
        // Easy to pass wrong values
        // No validation at compile time
        // What if email is invalid?
        // What if amount is negative?
    }
}

// ✅ GOOD: Value Objects
public class Order {
    private OrderId id;                // Validated, typed
    private Email customerEmail;       // Validated
    private Money totalAmount;         // Has currency
    private OrderStatus status;        // Enum - type safe
    private Quantity quantity;         // Validated positive
}

public class OrderService {
    public void process(OrderId orderId, Email email, Money amount) {
        // Type safety prevents mixing up parameters
        // All values pre-validated
        // Domain concepts explicit
    }
}
```

### When to Use Value Objects

```
┌─────────────────────────────────────────────────────────────────────┐
│          PRIMITIVE VS VALUE OBJECT DECISION                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Use VALUE OBJECT when:                                             │
│                                                                      │
│  ✓ The value has validation rules                                   │
│  ✓ The value has behavior (methods beyond get/set)                  │
│  ✓ The value is used in multiple places                             │
│  ✓ The value represents a domain concept                            │
│  ✓ Combining related primitives (amount + currency = Money)         │
│  ✓ You need type safety (can't mix up OrderId and CustomerId)       │
│                                                                      │
│  Keep PRIMITIVE when:                                                │
│                                                                      │
│  ✓ It's truly just a number or string with no rules                 │
│  ✓ It's used only internally/temporarily                            │
│  ✓ Creating a value object would be overkill                        │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  COMMON CANDIDATES FOR VALUE OBJECTS                                │
│                                                                      │
│  String primitives:                                                 │
│  • email → Email                                                    │
│  • phone → PhoneNumber                                              │
│  • url → Url                                                        │
│  • sku → Sku                                                        │
│  • postCode → PostalCode                                           │
│                                                                      │
│  Numeric primitives:                                                │
│  • amount → Money (with currency)                                   │
│  • quantity → Quantity                                              │
│  • percentage → Percentage                                          │
│  • weight → Weight (with unit)                                      │
│                                                                      │
│  Combined primitives:                                               │
│  • street + city + postal → Address                                 │
│  • start + end → DateRange                                          │
│  • latitude + longitude → GeoLocation                               │
│  • firstName + lastName → PersonName                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Value Objects in Collections

```java
// Value Objects work well in collections
public class ShoppingCart {
    private final Map<Sku, Quantity> items = new HashMap<>();
    
    public void addItem(Sku sku, Quantity quantity) {
        items.merge(sku, quantity, Quantity::add);
    }
    
    public void removeItem(Sku sku) {
        items.remove(sku);
    }
    
    public Quantity getQuantity(Sku sku) {
        return items.getOrDefault(sku, Quantity.zero());
    }
    
    // Because Sku has proper equals/hashCode, this works correctly
}

// Value Object lists for order lines
public class Order {
    private final List<OrderLine> lines;  // OrderLine is a Value Object
    
    public Money calculateTotal() {
        return lines.stream()
            .map(OrderLine::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
}

public record OrderLine(
    Sku sku,
    ProductName name,
    Quantity quantity,
    Money unitPrice
) {
    public Money getSubtotal() {
        return unitPrice.multiply(quantity.value());
    }
}
```

---

## Persistence Considerations

### JPA Embeddables

```java
@Embeddable
public class Money {
    @Column(name = "amount")
    private BigDecimal amount;
    
    @Column(name = "currency")
    private String currencyCode;
    
    // JPA requires no-arg constructor
    protected Money() {}
    
    public Money(BigDecimal amount, Currency currency) {
        this.amount = amount;
        this.currencyCode = currency.getCurrencyCode();
    }
    
    public Currency getCurrency() {
        return Currency.getInstance(currencyCode);
    }
    
    // ... rest of implementation
}

@Entity
public class OrderEntity {
    @Id
    private String id;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "total_amount")),
        @AttributeOverride(name = "currencyCode", column = @Column(name = "total_currency"))
    })
    private Money totalAmount;
}
```

### Custom Converters

```java
@Converter(autoApply = true)
public class EmailConverter implements AttributeConverter<Email, String> {
    
    @Override
    public String convertToDatabaseColumn(Email email) {
        return email != null ? email.getValue() : null;
    }
    
    @Override
    public Email convertToEntityAttribute(String value) {
        return value != null ? new Email(value) : null;
    }
}

@Converter(autoApply = true)
public class OrderIdConverter implements AttributeConverter<OrderId, String> {
    
    @Override
    public String convertToDatabaseColumn(OrderId id) {
        return id != null ? id.value().toString() : null;
    }
    
    @Override
    public OrderId convertToEntityAttribute(String value) {
        return value != null ? OrderId.of(value) : null;
    }
}
```

---

## Key Takeaways

1. **Value Objects are immutable** - Create new ones instead of modifying

2. **Equality is by attributes** - Not by reference or identity

3. **Self-validating** - Invalid value objects cannot exist

4. **Replace primitives** - Email, Money, Quantity instead of String, BigDecimal, int

5. **Encapsulate behavior** - Money.add(), DateRange.overlaps()

6. **Use Java Records** - Perfect fit for Value Objects in modern Java

7. **Value Objects can contain Value Objects** - Address contains PostalCode

---

## What's Next?

In [Chapter 11: Aggregates and Aggregate Roots](./11-aggregates.md), we'll learn how to group related Entities and Value Objects into consistency boundaries called Aggregates.

---

**[← Previous: Entities](./09-entities.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Aggregates →](./11-aggregates.md)**
