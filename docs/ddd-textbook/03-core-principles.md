# Chapter 3: Core Principles of Domain-Driven Design

> *"A model is not right or wrong; it is more or less useful."*
> — Eric Evans

---

## The Four Pillars of DDD

Domain-Driven Design rests on four fundamental principles that guide all design decisions:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FOUR PILLARS OF DDD                               │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│                 │                 │                 │               │
│    FOCUS ON     │   MODEL-DRIVEN  │  UBIQUITOUS     │  BOUNDED      │
│    CORE DOMAIN  │   DESIGN        │  LANGUAGE       │  CONTEXT      │
│                 │                 │                 │               │
│   Invest where  │  The code IS    │  One language   │  Explicit     │
│   it matters    │  the model      │  for all        │  boundaries   │
│                 │                 │                 │               │
└─────────────────┴─────────────────┴─────────────────┴───────────────┘
```

---

## Principle 1: Focus on the Core Domain

### What is the Core Domain?

The **Core Domain** is the part of your system that provides competitive advantage—it's why the business exists and what makes it unique.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOMAIN CLASSIFICATION                             │
│                                                                      │
│    ┌───────────────────────────────────────────────────────────┐    │
│    │                     CORE DOMAIN                            │    │
│    │                                                            │    │
│    │  🎯 This is what makes your business unique               │    │
│    │  💎 Your competitive advantage                            │    │
│    │  🧠 Needs your best people and most investment            │    │
│    │  🔧 Must be custom-built, cannot be outsourced            │    │
│    │                                                            │    │
│    │  Examples:                                                 │    │
│    │  • Netflix: Recommendation algorithm                       │    │
│    │  • Uber: Ride matching & pricing                          │    │
│    │  • Insurance: Risk assessment & pricing                   │    │
│    │                                                            │    │
│    └───────────────────────────────────────────────────────────┘    │
│                                                                      │
│    ┌───────────────────────────────────────────────────────────┐    │
│    │                 SUPPORTING SUBDOMAINS                      │    │
│    │                                                            │    │
│    │  📋 Necessary for the core domain to function             │    │
│    │  🔨 Custom but not differentiating                        │    │
│    │  ⚖️ Moderate investment, simpler modeling                 │    │
│    │                                                            │    │
│    │  Examples:                                                 │    │
│    │  • Customer management                                     │    │
│    │  • Product catalog                                         │    │
│    │  • Order management                                        │    │
│    │                                                            │    │
│    └───────────────────────────────────────────────────────────┘    │
│                                                                      │
│    ┌───────────────────────────────────────────────────────────┐    │
│    │                  GENERIC SUBDOMAINS                        │    │
│    │                                                            │    │
│    │  📦 Solved problems, not special to your business         │    │
│    │  💵 Buy off-the-shelf or use open source                  │    │
│    │  ⏱️ Minimal investment - just make it work                │    │
│    │                                                            │    │
│    │  Examples:                                                 │    │
│    │  • Authentication (use Auth0, Keycloak)                   │    │
│    │  • Email sending (use SendGrid)                           │    │
│    │  • Scheduling (use Quartz)                                │    │
│    │                                                            │    │
│    └───────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Resource Allocation Strategy

| Domain Type | Talent Investment | DDD Investment | Build vs. Buy |
|-------------|-------------------|----------------|---------------|
| Core | Best engineers | Full DDD | Always build |
| Supporting | Good engineers | Tactical patterns | Build simple |
| Generic | Junior/Outsource | Minimal | Buy/OSS |

### Identifying Your Core Domain

Ask these questions:
1. **What would hurt most if a competitor did it better?**
2. **What can't be bought off the shelf?**
3. **What do domain experts spend most time discussing?**
4. **What requires the most specialized knowledge?**

```java
// Example: For an e-commerce company

// GENERIC SUBDOMAIN - Use existing solutions
// Authentication, Email, Logging
@Service
public class NotificationService {
    private final SendGrid emailClient;  // Third-party service
    // Simple wrapper, minimal logic
}

// SUPPORTING SUBDOMAIN - Build simple, avoid over-engineering
// Customer Management
@Entity
public class Customer {
    private CustomerId id;
    private Email email;
    private Name name;
    // Basic CRUD is fine here
}

// CORE DOMAIN - Invest heavily, model carefully
// Dynamic Pricing Engine (competitive advantage)
public class PricingEngine {
    private final DemandForecaster demandForecaster;
    private final CompetitorPriceTracker competitorTracker;
    private final InventoryLevelProvider inventoryProvider;
    private final CustomerSegmentation segmentation;
    
    public Price calculateOptimalPrice(Product product, Customer customer) {
        DemandForecast demand = demandForecaster.forecast(product);
        CompetitorPrices competitors = competitorTracker.getCurrentPrices(product);
        InventoryLevel inventory = inventoryProvider.getLevel(product);
        CustomerSegment segment = segmentation.classify(customer);
        
        // Complex, proprietary algorithm - this IS the business
        return pricingAlgorithm.calculate(
            product.getBasePrice(),
            demand,
            competitors,
            inventory,
            segment,
            currentPromotions()
        );
    }
}
```

---

## Principle 2: Model-Driven Design

### The Model as the Heart of Software

In DDD, the **domain model** is not just documentation—it's the actual implementation. The code IS the model.

```
Traditional Approach:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Business   │────►│  Documents  │────►│    Code     │
│  Knowledge  │     │  & Diagrams │     │  (differs)  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    Gets outdated
                    immediately

DDD Approach:
┌─────────────┐     ┌─────────────────────────────────┐
│  Business   │────►│     Domain Model (Code)         │
│  Knowledge  │◄────│                                 │
└─────────────┘     │  • IS the documentation         │
                    │  • Expresses business concepts  │
                    │  • Always current               │
                    └─────────────────────────────────┘
```

### Model-Code Connection

The model should be directly reflected in code:

```java
// Domain concept: "An order can be shipped only if it has been paid 
// and all items are in stock"

// BAD: The model exists only in documentation
public class OrderService {
    public void shipOrder(Long orderId) {
        Order order = orderRepo.findById(orderId);
        // Hidden business rules - where's the model?
        if (order.getPaymentStatus() == 1 
            && inventoryService.checkAll(order.getItemIds())) {
            // ship it
        }
    }
}

// GOOD: The model IS the code
public class Order {
    private OrderId id;
    private PaymentStatus paymentStatus;
    private List<OrderLine> orderLines;
    private ShippingStatus shippingStatus;
    
    public void ship(InventoryChecker inventory) {
        // Business rules expressed clearly in domain language
        ensurePaid();
        ensureAllItemsInStock(inventory);
        
        this.shippingStatus = ShippingStatus.SHIPPED;
        DomainEvents.raise(new OrderShippedEvent(this.id));
    }
    
    private void ensurePaid() {
        if (!this.paymentStatus.isPaid()) {
            throw new OrderNotPaidException(this.id);
        }
    }
    
    private void ensureAllItemsInStock(InventoryChecker inventory) {
        List<ProductId> outOfStock = orderLines.stream()
            .map(OrderLine::getProductId)
            .filter(id -> !inventory.isInStock(id))
            .collect(toList());
            
        if (!outOfStock.isEmpty()) {
            throw new ItemsNotInStockException(this.id, outOfStock);
        }
    }
}
```

### Continuous Refinement

The model evolves as understanding deepens:

```
Initial Understanding:
┌─────────────────────────────────────────┐
│  Customer places Order for Products     │
└─────────────────────────────────────────┘

After more conversations:
┌─────────────────────────────────────────────────────────────┐
│  Customer places Order containing OrderLines               │
│  OrderLine references Product with quantity                │
│  Order must be Confirmed before Processing                 │
└─────────────────────────────────────────────────────────────┘

After domain expert deep-dive:
┌─────────────────────────────────────────────────────────────────────┐
│  Customer places Order containing OrderLines                        │
│  OrderLine captures ProductSnapshot (price at time of order)       │
│  Order transitions through: Draft → Confirmed → Paid → Shipped     │
│  Some Products require BackOrder when stock insufficient           │
│  Corporate Customers may have different PricingAgreements          │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// Model evolution example

// Version 1: Initial simple model
public class Order {
    private List<Product> products;
}

// Version 2: Capture quantity
public class Order {
    private List<OrderLine> orderLines;
}

public class OrderLine {
    private Product product;
    private int quantity;
}

// Version 3: Price snapshot (prices change over time!)
public class OrderLine {
    private ProductSnapshot productSnapshot;  // Immutable record of product at order time
    private Quantity quantity;
    private Money unitPrice;                  // Price locked at order time
}

// Version 4: Support back-orders
public class OrderLine {
    private ProductSnapshot productSnapshot;
    private Quantity quantity;
    private Money unitPrice;
    private FulfillmentStatus fulfillmentStatus;  // IN_STOCK, BACK_ORDERED
    private LocalDate expectedShipDate;
}
```

---

## Principle 3: Ubiquitous Language

### One Language to Rule Them All

**Ubiquitous Language** is a shared vocabulary used by everyone on the team—developers, domain experts, testers, documentation writers—everyone.

```
WITHOUT Ubiquitous Language:
┌─────────────────┐                    ┌─────────────────┐
│  Domain Expert  │                    │   Developer     │
├─────────────────┤                    ├─────────────────┤
│ "Policyholder"  │        ???         │ "User"          │
│ "Coverage"      │◄═══════════════════│ "InsuranceType" │
│ "Premium"       │       Lost in      │ "PaymentAmount" │
│ "Claim"         │    Translation     │ "Request"       │
│ "Underwriting"  │                    │ "Approval"      │
└─────────────────┘                    └─────────────────┘

WITH Ubiquitous Language:
┌─────────────────┐                    ┌─────────────────┐
│  Domain Expert  │                    │   Developer     │
├─────────────────┤   Same Language    ├─────────────────┤
│ "Policyholder"  │◄══════════════════►│ "Policyholder"  │
│ "Coverage"      │     Used in:       │ "Coverage"      │
│ "Premium"       │   • Conversations  │ "Premium"       │
│ "Claim"         │   • Documentation  │ "Claim"         │
│ "Underwriting"  │   • Code           │ "Underwriting"  │
└─────────────────┘                    └─────────────────┘
```

### Building the Ubiquitous Language

```
Step 1: Identify Domain Terms
─────────────────────────────
Listen to how domain experts speak:
• "When a customer PLACES an ORDER..."
• "The order is CONFIRMED when payment SUCCEEDS..."
• "We SHIP the order once inventory is ALLOCATED..."

Step 2: Define Precisely
─────────────────────────
Create a glossary with precise definitions:

┌────────────────┬────────────────────────────────────────────────┐
│ Term           │ Definition                                      │
├────────────────┼────────────────────────────────────────────────┤
│ Order          │ A customer's request to purchase products,     │
│                │ containing one or more order lines             │
├────────────────┼────────────────────────────────────────────────┤
│ Place (Order)  │ The act of submitting an order, transitioning │
│                │ it from Draft to Pending Payment status        │
├────────────────┼────────────────────────────────────────────────┤
│ Confirm        │ The transition when payment is received,       │
│                │ allowing fulfillment to begin                  │
├────────────────┼────────────────────────────────────────────────┤
│ Allocate       │ Reserve inventory for specific order lines,    │
│                │ reducing available quantity                    │
└────────────────┴────────────────────────────────────────────────┘

Step 3: Use in Code
───────────────────
The code MUST use the same terms:
```

```java
// WRONG: Developer-speak instead of domain language
public class OrderManager {
    public void processOrderData(OrderDTO data) {
        validateData(data);
        persistRecord(data);
        sendNotification(data.getUserId());
    }
}

// RIGHT: Ubiquitous Language in code
public class Order {
    public void place() {
        ensureCanBePlaced();
        this.status = OrderStatus.PENDING_PAYMENT;
        DomainEvents.raise(new OrderPlacedEvent(this.id));
    }
    
    public void confirm(Payment payment) {
        ensurePendingPayment();
        payment.ensureSuccessful();
        this.status = OrderStatus.CONFIRMED;
        DomainEvents.raise(new OrderConfirmedEvent(this.id, payment.getId()));
    }
    
    public void allocateInventory(InventoryAllocation allocation) {
        ensureConfirmed();
        this.allocation = allocation;
        this.status = OrderStatus.ALLOCATED;
    }
}
```

### Language Evolution

The Ubiquitous Language evolves as understanding deepens:

```
Week 1: "Customer"
Week 3: "We actually have different types - Individual and Corporate"
        → IndividualCustomer, CorporateCustomer
        
Week 5: "Corporate customers have Accounts, not individual orders"
        → Account, AccountHolder (for corporate)
        
Week 8: "Some customers are Prospects until they make first purchase"
        → Prospect → Customer transition
```

---

## Principle 4: Bounded Context

### Why Boundaries Matter

A **Bounded Context** is an explicit boundary within which a domain model is defined and applicable. Different contexts can have different models for the same real-world concept.

```
Real World: "Customer" means different things in different contexts

┌──────────────────────────────────────────────────────────────────────┐
│                         THE COMPANY                                   │
├─────────────────────┬──────────────────────┬─────────────────────────┤
│   SALES CONTEXT     │   SUPPORT CONTEXT    │   BILLING CONTEXT       │
├─────────────────────┼──────────────────────┼─────────────────────────┤
│                     │                      │                         │
│   Customer          │   Customer           │   Customer              │
│   ├─ name           │   ├─ name            │   ├─ name               │
│   ├─ email          │   ├─ email           │   ├─ billingAddress     │
│   ├─ leads          │   ├─ tickets         │   ├─ paymentMethods     │
│   ├─ opportunities  │   ├─ satisfaction    │   ├─ invoices           │
│   └─ purchaseHistory│   └─ accountManager  │   └─ creditLimit        │
│                     │                      │                         │
│   Cares about:      │   Cares about:       │   Cares about:          │
│   Conversion,       │   Issues,            │   Payment,              │
│   Revenue potential │   Happiness          │   Receivables           │
│                     │                      │                         │
└─────────────────────┴──────────────────────┴─────────────────────────┘
```

### One Model Per Context

Each bounded context has its own model, optimized for its purpose:

```java
// SALES CONTEXT
package com.company.sales.domain;

public class Customer {
    private CustomerId id;
    private Name name;
    private Email email;
    private List<Lead> leads;
    private List<Opportunity> opportunities;
    private PurchaseHistory purchaseHistory;
    private SalesRepresentative assignedRep;
    
    public Money calculateLifetimeValue() { /* ... */ }
    public LeadScore calculateLeadScore() { /* ... */ }
}

// SUPPORT CONTEXT  
package com.company.support.domain;

public class Customer {
    private CustomerId id;
    private Name name;
    private Email email;
    private List<Ticket> openTickets;
    private List<Ticket> closedTickets;
    private SatisfactionScore satisfactionScore;
    private SupportTier tier;
    
    public Duration calculateAverageResolutionTime() { /* ... */ }
    public boolean requiresPrioritySupport() { /* ... */ }
}

// BILLING CONTEXT
package com.company.billing.domain;

public class Customer {
    private CustomerId id;
    private Name name;
    private BillingAddress billingAddress;
    private List<PaymentMethod> paymentMethods;
    private List<Invoice> invoices;
    private CreditLimit creditLimit;
    private PaymentTerms paymentTerms;
    
    public Money calculateOutstandingBalance() { /* ... */ }
    public boolean hasOverdueInvoices() { /* ... */ }
}
```

### Context Boundaries in Practice

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTEXT BOUNDARY INDICATORS                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Strong indicators you need a boundary:                              │
│                                                                      │
│  ✓ Different teams own different parts                              │
│  ✓ Same term has different meanings                                 │
│  ✓ Different change frequencies                                     │
│  ✓ Different business capabilities                                  │
│  ✓ Different data storage requirements                              │
│  ✓ Different scaling needs                                          │
│                                                                      │
│  Warning signs of missing boundaries:                                │
│                                                                      │
│  ✗ "God objects" that know everything                               │
│  ✗ Changes ripple across the entire system                          │
│  ✗ Teams stepping on each other's toes                              │
│  ✗ Meetings required to make any change                             │
│  ✗ Test suites that take hours to run                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## How the Principles Work Together

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRINCIPLES IN ACTION                              │
│                                                                      │
│   1. IDENTIFY THE CORE DOMAIN                                       │
│      │                                                               │
│      │  "Our pricing algorithm is what makes us unique"             │
│      │                                                               │
│      ▼                                                               │
│   2. ESTABLISH UBIQUITOUS LANGUAGE                                  │
│      │                                                               │
│      │  "Price, Discount, Promotion, CustomerSegment, DemandCurve" │
│      │                                                               │
│      ▼                                                               │
│   3. DEFINE BOUNDED CONTEXT                                         │
│      │                                                               │
│      │  "Pricing Context - owns price calculation"                  │
│      │  "Catalog Context - owns product information"                │
│      │  "Customer Context - owns customer segmentation"             │
│      │                                                               │
│      ▼                                                               │
│   4. BUILD MODEL-DRIVEN DESIGN                                      │
│      │                                                               │
│      │  Code that expresses the domain clearly:                     │
│      │  PricingEngine, CustomerSegment, DemandForecast              │
│      │                                                               │
│      ▼                                                               │
│   5. ITERATE AND REFINE                                             │
│                                                                      │
│      Learn more, refine the model, update the language              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Practical Application

### Starting Point Questions

When beginning a DDD project, ask:

```
CORE DOMAIN QUESTIONS:
□ What makes this business unique?
□ What would be devastating if a competitor did better?
□ Where does the business want to innovate?

LANGUAGE QUESTIONS:
□ What terms do domain experts use daily?
□ Are there terms with different meanings in different contexts?
□ What terms confuse new team members?

BOUNDARY QUESTIONS:
□ What are the major business capabilities?
□ Which parts change independently?
□ Are there natural team boundaries?

MODEL QUESTIONS:
□ What are the key concepts in each area?
□ What behaviors do those concepts have?
□ What invariants must always be true?
```

### A Simple Framework

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DDD DECISION FRAMEWORK                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FOR EACH PIECE OF FUNCTIONALITY, ASK:                              │
│                                                                      │
│  1. Is this core to our competitive advantage?                      │
│     │                                                                │
│     ├─ YES → Full DDD treatment, rich domain model                  │
│     │                                                                │
│     └─ NO → Is it supporting or generic?                            │
│            │                                                         │
│            ├─ Supporting → Simple DDD, less modeling                │
│            │                                                         │
│            └─ Generic → Buy/use existing solution                   │
│                                                                      │
│  2. What bounded context does this belong to?                       │
│     │                                                                │
│     ├─ Existing context → Follow that context's model              │
│     │                                                                │
│     └─ New concept → Define new context or extend existing         │
│                                                                      │
│  3. What language should we use?                                    │
│     │                                                                │
│     └─ Always the Ubiquitous Language of that context              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Focus on Core Domain** - Invest your best resources where it matters most

2. **Model-Driven Design** - The code should embody the domain model, not just document it

3. **Ubiquitous Language** - One shared language for everyone, used everywhere

4. **Bounded Context** - Explicit boundaries where a model applies

5. **Continuous Refinement** - Models evolve as understanding deepens

6. **The principles reinforce each other** - They work best when applied together

---

## What's Next?

Now that we understand the core principles, we'll dive deep into Strategic Design, starting with [Chapter 4: Ubiquitous Language](./04-ubiquitous-language.md), where we'll learn how to develop and maintain a shared vocabulary that drives better software.

---

**[← Previous: Why We Need DDD](./02-why-ddd.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Ubiquitous Language →](./04-ubiquitous-language.md)**
