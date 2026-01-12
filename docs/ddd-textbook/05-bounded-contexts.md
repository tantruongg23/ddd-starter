# Chapter 5: Bounded Contexts

> *"Explicitly define the context within which a model applies... Keep the model strictly consistent within these bounds, but don't be distracted or confused by issues outside."*
> — Eric Evans

---

## What is a Bounded Context?

A **Bounded Context** is a explicit boundary within which a particular domain model is defined and applicable. It's the boundary where a Ubiquitous Language applies and the model remains consistent.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BOUNDED CONTEXT                                   │
│                                                                      │
│   A Bounded Context defines:                                        │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                              │   │
│   │  🗣️  LANGUAGE BOUNDARY                                      │   │
│   │      Where specific terms have specific meanings             │   │
│   │                                                              │   │
│   │  📐 MODEL BOUNDARY                                          │   │
│   │      Where a particular model is valid and consistent       │   │
│   │                                                              │   │
│   │  👥 TEAM BOUNDARY                                           │   │
│   │      Often maps to team ownership                           │   │
│   │                                                              │   │
│   │  📦 DEPLOYMENT BOUNDARY                                     │   │
│   │      May be a separate deployable unit                      │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Why Bounded Contexts?

### The Problem with One Model

Attempting to create a single unified model for an entire enterprise leads to disaster:

```
THE UNIFIED MODEL ANTI-PATTERN
──────────────────────────────

                    ┌─────────────────────────────────────┐
                    │         UNIFIED "Customer"          │
                    │                                      │
                    │  id                                  │
                    │  name                                │
                    │  email                               │
                    │  address                     ← Which address?
                    │  billingAddress                      │
                    │  shippingAddress                     │
                    │  preferredContactMethod              │
                    │  leadSource                  ← Only for Sales
                    │  creditScore                 ← Only for Finance
                    │  supportTier                 ← Only for Support
                    │  marketingConsent                    │
                    │  lastLoginDate                       │
                    │  purchaseHistory                     │
                    │  openTickets                 ← Only for Support
                    │  salesRepId                  ← Only for Sales
                    │  paymentTerms                ← Only for Finance
                    │  ... 50 more fields                  │
                    │                                      │
                    └─────────────────────────────────────┘
                    
Problems:
├─ God object - knows too much
├─ Every change affects everyone
├─ Teams step on each other
├─ No clear ownership
├─ Conflicting requirements
└─ Testing nightmare
```

### The Bounded Context Solution

```
BOUNDED CONTEXTS APPROACH
─────────────────────────

┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  SALES CONTEXT  │   │ SUPPORT CONTEXT │   │ BILLING CONTEXT │
│                 │   │                 │   │                 │
│  ┌───────────┐  │   │  ┌───────────┐  │   │  ┌───────────┐  │
│  │ Customer  │  │   │  │ Customer  │  │   │  │ Customer  │  │
│  │           │  │   │  │           │  │   │  │           │  │
│  │ id        │  │   │  │ id        │  │   │  │ id        │  │
│  │ name      │  │   │  │ name      │  │   │  │ name      │  │
│  │ email     │  │   │  │ email     │  │   │  │ billing   │  │
│  │ leadSource│  │   │  │ tier      │  │   │  │ Address   │  │
│  │ salesRep  │  │   │  │ openTix   │  │   │  │ credit    │  │
│  │ pipeline  │  │   │  │ history   │  │   │  │ terms     │  │
│  └───────────┘  │   │  └───────────┘  │   │  └───────────┘  │
│                 │   │                 │   │                 │
│  Focused model  │   │  Focused model  │   │  Focused model  │
│  for sales      │   │  for support    │   │  for billing    │
│                 │   │                 │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘

Benefits:
├─ Each model optimized for its purpose
├─ Teams work independently
├─ Clear ownership
├─ Changes contained within context
├─ Easier to test
└─ Can scale independently
```

---

## Identifying Bounded Contexts

### Indicators for Context Boundaries

```
┌─────────────────────────────────────────────────────────────────────┐
│              SIGNS YOU NEED A BOUNDED CONTEXT                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LINGUISTIC SIGNALS                                                  │
│  ├─ Same term means different things to different groups            │
│  ├─ Experts in one area confused by terms from another              │
│  └─ Glossary has conflicting definitions                            │
│                                                                      │
│  ORGANIZATIONAL SIGNALS                                              │
│  ├─ Different teams own different capabilities                      │
│  ├─ Different reporting structures                                  │
│  └─ Different budget allocations                                    │
│                                                                      │
│  TECHNICAL SIGNALS                                                   │
│  ├─ Different data storage requirements                             │
│  ├─ Different scaling needs                                         │
│  ├─ Different release cycles                                        │
│  └─ Different technology stacks                                     │
│                                                                      │
│  BUSINESS SIGNALS                                                    │
│  ├─ Distinct business capabilities                                  │
│  ├─ Different business processes                                    │
│  ├─ Different regulatory requirements                               │
│  └─ Could be outsourced independently                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Context Discovery Questions

Ask these questions to discover context boundaries:

```
1. WHO USES IT?
   "Who are the primary users of this functionality?"
   Different user groups often suggest different contexts.

2. WHAT IS IT FOR?
   "What is the primary purpose of this model?"
   Different purposes often require different models.

3. WHEN DOES IT CHANGE?
   "What causes this part of the system to change?"
   Different change drivers suggest different contexts.

4. WHO OWNS IT?
   "Who is responsible for making decisions about this?"
   Different ownership suggests different contexts.

5. HOW DOES IT SCALE?
   "What are the scaling characteristics?"
   Different scaling needs might suggest separation.
```

### Example: E-Commerce Contexts

```
┌─────────────────────────────────────────────────────────────────────┐
│                    E-COMMERCE PLATFORM                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│  │   CATALOG       │   │   INVENTORY     │   │   PRICING       │   │
│  │   CONTEXT       │   │   CONTEXT       │   │   CONTEXT       │   │
│  ├─────────────────┤   ├─────────────────┤   ├─────────────────┤   │
│  │ Product         │   │ StockItem       │   │ PricingRule     │   │
│  │ Category        │   │ Warehouse       │   │ Discount        │   │
│  │ ProductImage    │   │ InventoryLevel  │   │ Promotion       │   │
│  │ Review          │   │ Reservation     │   │ PriceHistory    │   │
│  │ Specification   │   │ Reorder         │   │ CustomerPrice   │   │
│  ├─────────────────┤   ├─────────────────┤   ├─────────────────┤   │
│  │ Purpose:        │   │ Purpose:        │   │ Purpose:        │   │
│  │ Display to      │   │ Track physical  │   │ Calculate       │   │
│  │ customers       │   │ stock           │   │ prices          │   │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘   │
│                                                                      │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│  │   ORDERING      │   │   SHIPPING      │   │   CUSTOMER      │   │
│  │   CONTEXT       │   │   CONTEXT       │   │   CONTEXT       │   │
│  ├─────────────────┤   ├─────────────────┤   ├─────────────────┤   │
│  │ Order           │   │ Shipment        │   │ Customer        │   │
│  │ OrderLine       │   │ Package         │   │ Address         │   │
│  │ Cart            │   │ Carrier         │   │ PaymentMethod   │   │
│  │ OrderStatus     │   │ TrackingInfo    │   │ Preferences     │   │
│  │ Payment         │   │ DeliveryZone    │   │ OrderHistory    │   │
│  ├─────────────────┤   ├─────────────────┤   ├─────────────────┤   │
│  │ Purpose:        │   │ Purpose:        │   │ Purpose:        │   │
│  │ Manage order    │   │ Fulfill and     │   │ Customer        │   │
│  │ lifecycle       │   │ deliver         │   │ relationship    │   │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Context Relationships

### Communication Between Contexts

Bounded Contexts don't exist in isolation—they need to communicate:

```
┌─────────────────────────────────────────────────────────────────────┐
│                 CONTEXT COMMUNICATION PATTERNS                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SYNCHRONOUS                        ASYNCHRONOUS                     │
│  ────────────                       ────────────                     │
│                                                                      │
│  ┌─────────┐  API Call  ┌─────────┐                                │
│  │Context A├───────────►│Context B│                                │
│  └─────────┘            └─────────┘                                │
│                                                                      │
│  • Direct request/response          ┌─────────┐  Event  ┌─────────┐│
│  • Tight coupling                   │Context A├────────►│Context B││
│  • Immediate consistency            └─────────┘   ↓     └─────────┘│
│                                                  ┌──┐               │
│                                                  │MQ│               │
│                                                  └──┘               │
│                                     • Loose coupling                │
│                                     • Eventual consistency          │
│                                     • Better resilience             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Between Contexts

```java
// ORDERING CONTEXT raises an event when order is placed
package com.shop.ordering.domain;

public class Order {
    public void place() {
        this.status = OrderStatus.PLACED;
        // Event contains only what other contexts need
        DomainEvents.raise(new OrderPlacedEvent(
            this.id.getValue(),
            this.customerId.getValue(),
            this.getOrderLinesSummary(),
            this.totalAmount.getValue()
        ));
    }
}

// INVENTORY CONTEXT listens and reserves stock
package com.shop.inventory.application;

@Service
public class InventoryEventHandler {
    
    @EventListener
    public void on(OrderPlacedEvent event) {
        // Translate to this context's language
        for (OrderLineSummary line : event.getOrderLines()) {
            StockItem item = stockRepository.findBySku(line.getSku());
            item.reserve(line.getQuantity(), event.getOrderId());
            stockRepository.save(item);
        }
    }
}

// SHIPPING CONTEXT listens to create shipment
package com.shop.shipping.application;

@Service  
public class ShippingEventHandler {
    
    @EventListener
    public void on(OrderPlacedEvent event) {
        // Create in this context's model
        Shipment shipment = Shipment.createForOrder(
            event.getOrderId(),
            event.getCustomerId()
        );
        shipmentRepository.save(shipment);
    }
}
```

---

## Implementing Bounded Contexts

### Package/Module Structure

```
PROJECT STRUCTURE - SEPARATE PACKAGES
─────────────────────────────────────

src/main/java/com/company/
├── catalog/                          # Catalog Bounded Context
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Product.java
│   │   │   ├── Category.java
│   │   │   └── ProductId.java
│   │   ├── repository/
│   │   │   └── ProductRepository.java
│   │   └── service/
│   │       └── ProductSearchService.java
│   ├── application/
│   │   └── ProductApplicationService.java
│   └── infrastructure/
│       ├── persistence/
│       │   └── JpaProductRepository.java
│       └── web/
│           └── ProductController.java
│
├── ordering/                         # Ordering Bounded Context
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Order.java
│   │   │   ├── OrderLine.java
│   │   │   ├── OrderId.java
│   │   │   └── OrderStatus.java
│   │   ├── repository/
│   │   │   └── OrderRepository.java
│   │   └── event/
│   │       └── OrderPlacedEvent.java
│   ├── application/
│   │   └── OrderApplicationService.java
│   └── infrastructure/
│       └── ...
│
├── inventory/                        # Inventory Bounded Context
│   └── ...
│
└── shared/                           # Shared Kernel (if needed)
    └── kernel/
        └── Money.java
```

### Microservices Approach

```
MICROSERVICES - SEPARATE DEPLOYABLES
────────────────────────────────────

┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  catalog-service/                                                   │
│  ├── src/main/java/com/company/catalog/                            │
│  ├── pom.xml (or build.gradle)                                     │
│  ├── Dockerfile                                                     │
│  └── k8s/deployment.yaml                                           │
│                                                                      │
│  ordering-service/                                                  │
│  ├── src/main/java/com/company/ordering/                           │
│  ├── pom.xml                                                        │
│  ├── Dockerfile                                                     │
│  └── k8s/deployment.yaml                                           │
│                                                                      │
│  inventory-service/                                                 │
│  ├── src/main/java/com/company/inventory/                          │
│  ├── pom.xml                                                        │
│  ├── Dockerfile                                                     │
│  └── k8s/deployment.yaml                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Benefits:
• Independent deployment
• Independent scaling  
• Technology flexibility
• Team autonomy

Costs:
• Network complexity
• Distributed transactions
• Operational overhead
• Eventually consistent
```

### Modular Monolith Approach

```
MODULAR MONOLITH - ONE DEPLOYABLE, CLEAR BOUNDARIES
────────────────────────────────────────────────────

shop-application/
├── src/main/java/com/company/shop/
│   ├── catalog/          # Module with clear boundary
│   │   ├── api/          # Public interface for other modules
│   │   │   ├── CatalogApi.java
│   │   │   └── ProductDto.java
│   │   └── internal/     # Private implementation
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   │
│   ├── ordering/         # Module with clear boundary
│   │   ├── api/
│   │   │   ├── OrderingApi.java
│   │   │   └── OrderDto.java
│   │   └── internal/
│   │       └── ...
│   │
│   └── inventory/        # Module with clear boundary
│       ├── api/
│       └── internal/
│
└── pom.xml
```

```java
// Enforce boundaries with ArchUnit
@Test
void orderingContextShouldNotDependOnCatalogInternals() {
    noClasses()
        .that().resideInAPackage("..ordering..")
        .should().dependOnClassesThat()
        .resideInAPackage("..catalog.internal..")
        .check(importedClasses);
}

@Test
void contextsShouldOnlyCommunicateThroughApis() {
    // Catalog can only access Ordering through its public API
    classes()
        .that().resideInAPackage("..catalog..")
        .should().onlyAccessClassesThat()
        .resideInAnyPackage(
            "..catalog..",           // Own package
            "..ordering.api..",      // Ordering's public API
            "java..",                // Java standard library
            "javax..",
            "org.springframework.."  // Framework
        )
        .check(importedClasses);
}
```

---

## Context Boundaries in Code

### Anti-Corruption Layer (ACL)

When integrating with external systems or legacy code, use an ACL to translate:

```java
// External legacy system has different model
// Legacy: CustomerRecord with weird field names
public class LegacyCustomerRecord {
    private String cust_nbr;      // Customer number
    private String cust_nm;       // Customer name  
    private String cust_email_addr;
    private int cust_stat_cd;     // 1=Active, 2=Inactive, 3=Suspended
}

// Our domain model - clean and expressive
public class Customer {
    private CustomerId id;
    private Name name;
    private Email email;
    private CustomerStatus status;
}

// Anti-Corruption Layer translates between them
public class CustomerAcl {
    
    private final LegacyCustomerService legacyService;
    
    public Optional<Customer> findByEmail(Email email) {
        // Call legacy system
        LegacyCustomerRecord record = legacyService
            .findByCustEmailAddr(email.getValue());
        
        if (record == null) {
            return Optional.empty();
        }
        
        // Translate to our domain model
        return Optional.of(translateToCustomer(record));
    }
    
    private Customer translateToCustomer(LegacyCustomerRecord record) {
        return new Customer(
            new CustomerId(record.getCust_nbr()),
            new Name(record.getCust_nm()),
            new Email(record.getCust_email_addr()),
            translateStatus(record.getCust_stat_cd())
        );
    }
    
    private CustomerStatus translateStatus(int legacyCode) {
        return switch (legacyCode) {
            case 1 -> CustomerStatus.ACTIVE;
            case 2 -> CustomerStatus.INACTIVE;
            case 3 -> CustomerStatus.SUSPENDED;
            default -> throw new UnknownStatusCodeException(legacyCode);
        };
    }
}
```

### Published Language

For integration, define a shared language explicitly:

```java
// Published Language - explicit contracts for integration
package com.company.contracts.ordering;

// This is the "published language" for the Ordering context
// Other contexts depend on this, not internal models

public record OrderPlacedEvent(
    String orderId,
    String customerId,
    List<OrderLineData> orderLines,
    BigDecimal totalAmount,
    Instant placedAt
) {}

public record OrderLineData(
    String productSku,
    int quantity,
    BigDecimal unitPrice
) {}

// Version the contracts
// v1, v2, etc. for backwards compatibility
```

---

## Common Mistakes

### Mistake 1: Contexts Too Small

```
❌ TOO GRANULAR
─────────────────

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Product │ │Category│ │Image   │ │Review  │ │Spec    │
│Context │ │Context │ │Context │ │Context │ │Context │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘

Problem: These are all part of the Catalog domain!
         Artificial boundaries add overhead without value.

✅ RIGHT SIZE
─────────────

         ┌─────────────────────────────────────┐
         │         CATALOG CONTEXT             │
         │                                      │
         │  Product, Category, Image,          │
         │  Review, Specification              │
         │                                      │
         │  (Cohesive domain concepts)         │
         └─────────────────────────────────────┘
```

### Mistake 2: Contexts Too Large

```
❌ TOO LARGE (Everything Context)
─────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                     COMMERCE CONTEXT                             │
│                                                                  │
│  Catalog + Pricing + Inventory + Orders + Shipping + Billing    │
│                                                                  │
│  (This is just a monolith by another name)                      │
└─────────────────────────────────────────────────────────────────┘

✅ APPROPRIATE BOUNDARIES
─────────────────────────

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Catalog  │ │ Pricing  │ │ Orders   │ │ Shipping │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

(Separate capabilities with distinct lifecycles)
```

### Mistake 3: Sharing Domain Models

```java
// ❌ WRONG: Sharing domain entities across contexts
// This creates tight coupling!

// Shared module
public class Product {
    private ProductId id;
    private String name;
    private Money price;           // Ordering needs this
    private int stockQuantity;     // Inventory needs this
    private String imageUrl;       // Catalog needs this
    private ShippingClass shipping; // Shipping needs this
}

// All contexts import and use this class
// Changes affect everyone!
```

```java
// ✅ RIGHT: Each context has its own model

// CATALOG CONTEXT
package com.shop.catalog.domain;
public class Product {
    private ProductId id;
    private String name;
    private String description;
    private String imageUrl;
    private Category category;
}

// INVENTORY CONTEXT  
package com.shop.inventory.domain;
public class StockItem {
    private Sku sku;
    private int quantity;
    private WarehouseLocation location;
}

// ORDERING CONTEXT
package com.shop.ordering.domain;
public class ProductSnapshot {
    private Sku sku;
    private String name;
    private Money priceAtOrderTime;
}
```

---

## Key Takeaways

1. **Bounded Context defines where a model applies** - Same concept can have different models in different contexts

2. **Language is bounded** - Terms have specific meaning within a context

3. **Teams often align with contexts** - Ownership and autonomy

4. **Contexts communicate through defined interfaces** - Not by sharing internal models

5. **Anti-Corruption Layer protects your model** - Translate at boundaries

6. **Size matters** - Not too big, not too small

7. **Start with modules, evolve to services** - Don't start with microservices

---

## What's Next?

In [Chapter 6: Context Mapping](./06-context-mapping.md), we'll explore the patterns for how Bounded Contexts relate to and integrate with each other, including Shared Kernel, Customer-Supplier, and Anti-Corruption Layer patterns.

---

**[← Previous: Ubiquitous Language](./04-ubiquitous-language.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Context Mapping →](./06-context-mapping.md)**
