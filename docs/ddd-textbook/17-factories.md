# Chapter 17: Factories

> *"Shift the responsibility for creating instances of complex objects and Aggregates to a separate object, which may itself have no responsibility in the domain model but is still part of the domain design."*
> — Eric Evans

---

## What is a Factory?

A **Factory** encapsulates the knowledge and complexity needed to create domain objects, particularly Aggregates. When object creation is complex, involves multiple steps, or requires coordination, a Factory provides a clean interface for that creation.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FACTORY CONCEPT                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Use a Factory when:                                               │
│                                                                      │
│   • Object creation is COMPLEX                                      │
│     (multiple steps, validations, calculations)                     │
│                                                                      │
│   • Creation requires knowledge the object shouldn't have           │
│     (external services, repositories)                               │
│                                                                      │
│   • You want to HIDE creation details                               │
│     (implementation may change)                                     │
│                                                                      │
│   • Creating an Aggregate with all its parts                        │
│     (root + entities + value objects)                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Types of Factories

### 1. Factory Method (on Entity)

A static method on the entity itself:

```java
public class Order {
    
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> lines;
    private OrderStatus status;
    
    // Private constructor
    private Order(OrderId id, CustomerId customerId) {
        this.id = id;
        this.customerId = customerId;
        this.lines = new ArrayList<>();
        this.status = OrderStatus.DRAFT;
    }
    
    // Factory method - simple creation
    public static Order create(CustomerId customerId) {
        return new Order(OrderId.generate(), customerId);
    }
    
    // Factory method - with initial data
    public static Order createWithItems(CustomerId customerId, List<OrderLineData> items) {
        Order order = new Order(OrderId.generate(), customerId);
        for (OrderLineData item : items) {
            order.addLine(item.productId(), item.name(), item.quantity(), item.price());
        }
        return order;
    }
    
    // Factory method - from existing order (clone for reorder)
    public static Order reorderFrom(Order previousOrder) {
        Order newOrder = new Order(OrderId.generate(), previousOrder.customerId);
        for (OrderLine line : previousOrder.lines) {
            // Copy line data, but new IDs
            newOrder.addLine(
                line.getProductId(),
                line.getProductName(),
                line.getQuantity(),
                line.getUnitPrice()  // Note: price might need recalculation
            );
        }
        return newOrder;
    }
}
```

### 2. Standalone Factory Class

For complex creation logic:

```java
public class OrderFactory {
    
    private final ProductCatalog productCatalog;
    private final PricingService pricingService;
    private final InventoryChecker inventoryChecker;
    
    public OrderFactory(ProductCatalog productCatalog, 
                       PricingService pricingService,
                       InventoryChecker inventoryChecker) {
        this.productCatalog = productCatalog;
        this.pricingService = pricingService;
        this.inventoryChecker = inventoryChecker;
    }
    
    /**
     * Create an order from a shopping cart.
     * Complex because:
     * - Need to look up current prices
     * - Need to verify inventory
     * - Need to snapshot product data
     */
    public Order createFromCart(Cart cart, Customer customer, ShippingAddress address) {
        Order order = Order.create(customer.getId(), address);
        
        for (CartItem cartItem : cart.getItems()) {
            // Look up current product info
            Product product = productCatalog.findById(cartItem.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(cartItem.getProductId()));
            
            // Verify still in stock
            if (!inventoryChecker.isAvailable(product.getId(), cartItem.getQuantity())) {
                throw new InsufficientInventoryException(product.getId());
            }
            
            // Calculate current price (may differ from when added to cart)
            Money currentPrice = pricingService.calculatePrice(
                product, customer, cartItem.getQuantity()
            );
            
            // Add to order with snapshot of current data
            order.addLine(
                product.getId(),
                product.getName(),  // Snapshot the name
                cartItem.getQuantity(),
                currentPrice       // Current calculated price
            );
        }
        
        return order;
    }
    
    /**
     * Create a subscription order that recurs.
     */
    public Order createSubscriptionOrder(Subscription subscription, BillingPeriod period) {
        Customer customer = subscription.getCustomer();
        
        Order order = Order.create(customer.getId(), subscription.getShippingAddress());
        order.markAsSubscriptionOrder(subscription.getId(), period);
        
        for (SubscriptionItem item : subscription.getItems()) {
            Product product = productCatalog.findById(item.getProductId())
                .orElseThrow();
            
            // Subscription might have special pricing
            Money price = subscription.getPriceFor(item.getProductId())
                .orElse(product.getPrice());
            
            order.addLine(product.getId(), product.getName(), item.getQuantity(), price);
        }
        
        return order;
    }
}
```

### 3. Builder Pattern Factory

For objects with many optional parameters:

```java
public class PolicyFactory {
    
    public PolicyBuilder newPolicy() {
        return new PolicyBuilder();
    }
    
    public class PolicyBuilder {
        private PolicyType type;
        private CustomerId customerId;
        private LocalDate effectiveDate;
        private LocalDate expirationDate;
        private List<Coverage> coverages = new ArrayList<>();
        private Money premium;
        private PaymentPlan paymentPlan;
        private AgentId agentId;
        
        public PolicyBuilder ofType(PolicyType type) {
            this.type = type;
            return this;
        }
        
        public PolicyBuilder forCustomer(CustomerId customerId) {
            this.customerId = customerId;
            return this;
        }
        
        public PolicyBuilder effectiveFrom(LocalDate date) {
            this.effectiveDate = date;
            return this;
        }
        
        public PolicyBuilder expiringOn(LocalDate date) {
            this.expirationDate = date;
            return this;
        }
        
        public PolicyBuilder withCoverage(Coverage coverage) {
            this.coverages.add(coverage);
            return this;
        }
        
        public PolicyBuilder withPremium(Money premium) {
            this.premium = premium;
            return this;
        }
        
        public PolicyBuilder payableVia(PaymentPlan plan) {
            this.paymentPlan = plan;
            return this;
        }
        
        public PolicyBuilder soldBy(AgentId agentId) {
            this.agentId = agentId;
            return this;
        }
        
        public Policy build() {
            // Validate required fields
            Objects.requireNonNull(type, "Policy type required");
            Objects.requireNonNull(customerId, "Customer required");
            Objects.requireNonNull(effectiveDate, "Effective date required");
            
            if (coverages.isEmpty()) {
                throw new IllegalStateException("At least one coverage required");
            }
            
            // Set defaults
            if (expirationDate == null) {
                expirationDate = effectiveDate.plusYears(1);
            }
            if (paymentPlan == null) {
                paymentPlan = PaymentPlan.ANNUAL;
            }
            
            // Create the aggregate
            return new Policy(
                PolicyNumber.generate(type),
                type,
                customerId,
                effectiveDate,
                expirationDate,
                coverages,
                premium,
                paymentPlan,
                agentId
            );
        }
    }
}

// Usage
Policy policy = policyFactory.newPolicy()
    .ofType(PolicyType.AUTO)
    .forCustomer(customerId)
    .effectiveFrom(LocalDate.now())
    .withCoverage(Coverage.liability(100000))
    .withCoverage(Coverage.collision(50000))
    .withPremium(Money.of(1200, "USD"))
    .payableVia(PaymentPlan.MONTHLY)
    .soldBy(agentId)
    .build();
```

---

## Factory for Reconstitution

When loading aggregates from persistence:

```java
public class Order {
    
    // Regular factory method for new orders
    public static Order create(CustomerId customerId, ShippingAddress address) {
        return new Order(OrderId.generate(), customerId, address);
    }
    
    // Reconstitution method for loading from database
    // Package-private or in a separate factory
    static Order reconstitute(
            OrderId id,
            CustomerId customerId,
            List<OrderLine> lines,
            ShippingAddress address,
            OrderStatus status,
            Money total,
            LocalDateTime createdAt,
            LocalDateTime placedAt) {
        
        Order order = new Order(id, customerId, address);
        order.lines.addAll(lines);
        order.status = status;
        order.total = total;
        order.createdAt = createdAt;
        order.placedAt = placedAt;
        // Don't raise events - this is reconstitution, not creation
        return order;
    }
}

// Repository uses reconstitution
public class JpaOrderRepository implements OrderRepository {
    
    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.getValue())
            .map(this::toDomain);
    }
    
    private Order toDomain(OrderEntity entity) {
        List<OrderLine> lines = entity.getLines().stream()
            .map(this::toOrderLine)
            .toList();
        
        return Order.reconstitute(
            new OrderId(entity.getId()),
            new CustomerId(entity.getCustomerId()),
            lines,
            toAddress(entity),
            OrderStatus.valueOf(entity.getStatus()),
            Money.of(entity.getTotal(), entity.getCurrency()),
            entity.getCreatedAt(),
            entity.getPlacedAt()
        );
    }
}
```

---

## When to Use Which Approach

```
┌─────────────────────────────────────────────────────────────────────┐
│              FACTORY APPROACH DECISION                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Simple creation with few parameters?                              │
│   └─► Factory Method on Entity                                      │
│       Order.create(customerId)                                      │
│                                                                      │
│   Creation needs external services/repositories?                    │
│   └─► Standalone Factory Class                                      │
│       orderFactory.createFromCart(cart, customer)                   │
│                                                                      │
│   Many optional parameters?                                         │
│   └─► Builder Pattern                                               │
│       policyFactory.newPolicy().ofType(...).build()                │
│                                                                      │
│   Different creation scenarios for same type?                       │
│   └─► Standalone Factory with multiple methods                      │
│       orderFactory.createFromCart(...)                              │
│       orderFactory.createSubscriptionOrder(...)                     │
│       orderFactory.createReplacementOrder(...)                      │
│                                                                      │
│   Reconstituting from database?                                     │
│   └─► Package-private reconstitute method                           │
│       Order.reconstitute(id, data...)                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Factory Best Practices

### Do's

```java
// ✓ Use factory for complex creation
public class LoanApplicationFactory {
    
    public LoanApplication create(Customer customer, LoanRequest request) {
        // Complex: credit check, risk assessment, initial pricing
        CreditScore credit = creditService.check(customer);
        RiskAssessment risk = riskEngine.assess(customer, request);
        Money initialRate = pricingEngine.calculateRate(credit, risk, request);
        
        return new LoanApplication(
            LoanApplicationId.generate(),
            customer.getId(),
            request.getAmount(),
            request.getTerm(),
            initialRate,
            risk.getCategory()
        );
    }
}

// ✓ Validate during creation
public static Order create(CustomerId customerId, ShippingAddress address) {
    Objects.requireNonNull(customerId, "Customer ID required");
    Objects.requireNonNull(address, "Shipping address required");
    return new Order(OrderId.generate(), customerId, address);
}

// ✓ Return complete, valid aggregates
public Order createFromCart(Cart cart, Customer customer) {
    // Returned order is fully populated and valid
    // Not partially constructed
}
```

### Don'ts

```java
// ✗ Don't create partially constructed objects
public Order createOrder(CustomerId customerId) {
    Order order = new Order();
    order.setCustomerId(customerId);
    // Caller has to remember to set other required fields!
    return order;
}

// ✗ Don't use factory for simple cases
public class UnnecessaryFactory {
    public Money createMoney(BigDecimal amount, String currency) {
        return new Money(amount, currency);  // Just use constructor!
    }
}

// ✗ Don't leak internal details
public Order create(String id, String customerId, List<Map<String, Object>> lineData) {
    // Using primitives and untyped data - should use domain types
}
```

---

## Key Takeaways

1. **Factories encapsulate complex creation** - Hide details, ensure validity

2. **Use factory methods for simple cases** - Static methods on the entity

3. **Use standalone factories for complex cases** - When external dependencies needed

4. **Builder pattern for many optional parameters** - Fluent, readable creation

5. **Separate creation from reconstitution** - Different concerns, different methods

6. **Return complete, valid objects** - Never partial or invalid aggregates

---

## What's Next?

Now that we've covered all the tactical building blocks, we'll move to **Part IV: Architecture and Implementation**, starting with [Chapter 18: Layered Architecture in DDD](./18-layered-architecture.md).

---

**[← Previous: Application Services](./16-application-services.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Layered Architecture →](./18-layered-architecture.md)**
