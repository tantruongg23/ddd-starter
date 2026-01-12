# Chapter 6: Context Mapping

> *"Context Maps describe the relationships between bounded contexts, providing a global view of the system."*
> — Eric Evans

---

## What is Context Mapping?

A **Context Map** is a visual and conceptual tool that shows how different Bounded Contexts relate to each other. It documents the integration patterns, team relationships, and translation mechanisms between contexts.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTEXT MAP                                     │
│                                                                      │
│   A Context Map captures:                                           │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                              │   │
│   │  🔗 INTEGRATION POINTS                                       │   │
│   │     How contexts exchange data and trigger actions           │   │
│   │                                                              │   │
│   │  👥 TEAM RELATIONSHIPS                                       │   │
│   │     Who depends on whom, power dynamics                      │   │
│   │                                                              │   │
│   │  🔄 TRANSLATION MECHANISMS                                   │   │
│   │     How models map between contexts                          │   │
│   │                                                              │   │
│   │  📋 CONTRACTS                                                │   │
│   │     What each context expects and provides                   │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Context Mapping Patterns

There are several standard patterns for how Bounded Contexts can relate:

```
┌─────────────────────────────────────────────────────────────────────┐
│                 CONTEXT RELATIONSHIP PATTERNS                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PARTNERSHIP              SHARED KERNEL          CUSTOMER-SUPPLIER  │
│  ──────────              ────────────           ─────────────────   │
│  ┌────┐ ┌────┐          ┌────┬───┬────┐        ┌────┐     ┌────┐   │
│  │ A  │═│ B  │          │ A  │ S │ B  │        │ U  │────►│ D  │   │
│  └────┘ └────┘          └────┴───┴────┘        └────┘     └────┘   │
│  Equal partners          Shared code           Upstream/Downstream  │
│                                                                      │
│  CONFORMIST              ANTI-CORRUPTION        OPEN HOST SERVICE   │
│  ──────────              ────────────────       ─────────────────   │
│  ┌────┐     ┌────┐      ┌────┐ ┌──┐ ┌────┐    ┌────┐ API ┌────┐   │
│  │ D  │────►│ U  │      │ A  │═│AC│═│ B  │    │HOST├────►│ A  │   │
│  └────┘     └────┘      └────┘ └──┘ └────┘    │    ├────►│ B  │   │
│  Adopt upstream model   Translation layer      │    ├────►│ C  │   │
│                                                └────┘     └────┘   │
│                                                Published API        │
│  SEPARATE WAYS          PUBLISHED LANGUAGE                          │
│  ──────────────         ──────────────────                          │
│  ┌────┐     ┌────┐      ┌────┐ [PL] ┌────┐                         │
│  │ A  │  ✕  │ B  │      │ A  │══════│ B  │                         │
│  └────┘     └────┘      └────┘      └────┘                         │
│  No integration         Shared contract                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pattern Deep Dives

### 1. Partnership

Two teams coordinate closely with mutual dependency:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PARTNERSHIP                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│         ┌───────────────┐       ┌───────────────┐                   │
│         │   ORDERING    │◄═════►│   SHIPPING    │                   │
│         │   CONTEXT     │       │   CONTEXT     │                   │
│         └───────────────┘       └───────────────┘                   │
│                                                                      │
│   Characteristics:                                                   │
│   • Two-way dependency                                              │
│   • Coordinate releases together                                    │
│   • Joint planning sessions                                         │
│   • Shared success criteria                                         │
│                                                                      │
│   When to use:                                                      │
│   • Close collaboration possible                                    │
│   • Features often span both contexts                               │
│   • Teams co-located or communicate easily                          │
│                                                                      │
│   Risks:                                                            │
│   • Coordination overhead                                           │
│   • Can evolve into a monolith                                      │
│   • Boundaries may blur over time                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Shared Kernel

A small subset of the model is shared and jointly owned:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SHARED KERNEL                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     ┌───────────────┐   ┌───────┐   ┌───────────────┐              │
│     │   ORDERING    │───│KERNEL │───│   BILLING     │              │
│     │   CONTEXT     │   │       │   │   CONTEXT     │              │
│     └───────────────┘   │ Money │   └───────────────┘              │
│                         │ Currency                                  │
│                         │ CustomerId                                │
│                         └───────┘                                   │
│                                                                      │
│   The kernel contains:                                              │
│   • Core value objects both contexts need                           │
│   • Fundamental types                                               │
│   • Common domain events                                            │
│                                                                      │
│   Rules:                                                            │
│   • Keep it SMALL                                                   │
│   • Changes require agreement from both teams                       │
│   • Must have comprehensive tests                                   │
│   • Version carefully                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// Shared Kernel - careful, minimal sharing
package com.company.shared.kernel;

// Immutable value objects that are truly universal
public record Money(BigDecimal amount, Currency currency) {
    
    public Money {
        Objects.requireNonNull(amount, "Amount required");
        Objects.requireNonNull(currency, "Currency required");
        if (amount.scale() > currency.getDefaultFractionDigits()) {
            throw new IllegalArgumentException("Too many decimal places");
        }
    }
    
    public static Money of(BigDecimal amount, String currencyCode) {
        return new Money(amount, Currency.getInstance(currencyCode));
    }
    
    public Money add(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }
    
    public Money subtract(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }
    
    private void ensureSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new CurrencyMismatchException(this.currency, other.currency);
        }
    }
}

// Shared identifier type
public record CustomerId(String value) {
    public CustomerId {
        Objects.requireNonNull(value, "CustomerId required");
        if (value.isBlank()) {
            throw new IllegalArgumentException("CustomerId cannot be blank");
        }
    }
}
```

### 3. Customer-Supplier

Upstream (supplier) serves downstream (customer):

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER-SUPPLIER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│      UPSTREAM (Supplier)              DOWNSTREAM (Customer)         │
│     ┌───────────────────┐           ┌───────────────────┐          │
│     │                   │           │                   │          │
│     │   INVENTORY       │──────────►│    ORDERING       │          │
│     │   CONTEXT         │           │    CONTEXT        │          │
│     │                   │           │                   │          │
│     └───────────────────┘           └───────────────────┘          │
│                                                                      │
│   Supplier responsibilities:                                        │
│   • Provide stable APIs                                             │
│   • Consider customer needs in planning                             │
│   • Communicate changes in advance                                  │
│   • Support transition periods                                      │
│                                                                      │
│   Customer responsibilities:                                        │
│   • Define what they need                                           │
│   • Adapt to supplier's timeline                                    │
│   • Provide feedback on APIs                                        │
│   • Test against supplier changes                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// INVENTORY CONTEXT (Upstream/Supplier)
package com.company.inventory.api;

// Published API for downstream consumers
public interface InventoryApi {
    
    /**
     * Check stock availability for a product.
     * @param sku Product SKU
     * @return Available quantity
     */
    int getAvailableQuantity(String sku);
    
    /**
     * Reserve stock for an order.
     * @param reservation Reservation request
     * @return Reservation confirmation
     * @throws InsufficientStockException if stock not available
     */
    ReservationConfirmation reserve(ReservationRequest reservation);
    
    /**
     * Release previously reserved stock.
     * @param reservationId The reservation to release
     */
    void releaseReservation(String reservationId);
}

// ORDERING CONTEXT (Downstream/Customer)
package com.company.ordering.infrastructure;

@Service
public class InventoryClient implements InventoryChecker {
    
    private final InventoryApi inventoryApi;  // Consumes the upstream API
    
    @Override
    public boolean isInStock(Sku sku, Quantity quantity) {
        int available = inventoryApi.getAvailableQuantity(sku.getValue());
        return available >= quantity.getValue();
    }
    
    @Override
    public ReservationId reserveForOrder(OrderId orderId, List<OrderLine> lines) {
        ReservationRequest request = new ReservationRequest(
            orderId.getValue(),
            lines.stream()
                .map(l -> new LineItem(l.getSku().getValue(), l.getQuantity().getValue()))
                .toList()
        );
        
        ReservationConfirmation confirmation = inventoryApi.reserve(request);
        return new ReservationId(confirmation.getReservationId());
    }
}
```

### 4. Conformist

Downstream adopts upstream's model with no negotiation:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONFORMIST                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     UPSTREAM (Dominant)               DOWNSTREAM (Conformist)       │
│     ┌───────────────────┐           ┌───────────────────┐          │
│     │                   │           │                   │          │
│     │   EXTERNAL        │══════════►│    OUR            │          │
│     │   PAYMENT API     │           │    CONTEXT        │          │
│     │                   │           │                   │          │
│     └───────────────────┘           └───────────────────┘          │
│                                                                      │
│   When this happens:                                                │
│   • External system with no willingness to change                   │
│   • Third-party API you have no control over                        │
│   • Legacy system that can't be modified                            │
│   • Dominant vendor relationship                                    │
│                                                                      │
│   Implications:                                                     │
│   • Your model is constrained by theirs                             │
│   • Must adapt to their changes                                     │
│   • May not fit your domain well                                    │
│   • Consider ACL if mismatch is too painful                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// When conforming to an external API
// (e.g., Stripe payment API)

// We adopt Stripe's model in our integration layer
@Service
public class StripePaymentService implements PaymentProcessor {
    
    private final StripeClient stripe;
    
    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        // Conform to Stripe's model and API
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(request.getAmount().longValue())  // Stripe uses cents
            .setCurrency(request.getCurrency().toLowerCase())
            .setCustomer(request.getCustomerId())
            .setPaymentMethod(request.getPaymentMethodId())
            .setConfirm(true)
            .build();
        
        try {
            PaymentIntent intent = PaymentIntent.create(params);
            // Translate Stripe result to our model
            return mapToPaymentResult(intent);
        } catch (StripeException e) {
            return PaymentResult.failed(e.getMessage());
        }
    }
    
    private PaymentResult mapToPaymentResult(PaymentIntent intent) {
        // Map Stripe's status to our domain concept
        return switch (intent.getStatus()) {
            case "succeeded" -> PaymentResult.successful(intent.getId());
            case "requires_action" -> PaymentResult.requiresAction(intent.getClientSecret());
            default -> PaymentResult.failed("Unexpected status: " + intent.getStatus());
        };
    }
}
```

### 5. Anti-Corruption Layer (ACL)

A translation layer that protects your model from foreign concepts:

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ANTI-CORRUPTION LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                     ┌─────────────────────────────────────────┐     │
│                     │      ANTI-CORRUPTION LAYER              │     │
│                     │                                          │     │
│   ┌─────────────┐   │  ┌──────────┐  ┌───────────────────┐   │     │
│   │  EXTERNAL/  │───┼──│ Adapter  │──│    Translator     │───┼────►│
│   │  LEGACY     │   │  └──────────┘  └───────────────────┘   │     │
│   │  SYSTEM     │   │                                          │     │
│   └─────────────┘   │  Facade         Maps foreign model      │     │
│                     │  to external    to our domain model     │     │
│                     │                                          │     │
│                     └─────────────────────────────────────────┘     │
│                                                                      │
│   Components:                                                       │
│   • Facade: Simplified interface to complex external system         │
│   • Adapter: Technical translation (protocols, formats)             │
│   • Translator: Semantic translation (concepts, language)           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// Complete ACL Example

// External legacy system has this horrible model
public class LegacyOrderSystem {
    public LegacyOrderRecord getOrderByNumber(String orderNum) { ... }
    public void updateOrderStatus(String orderNum, int statusCode) { ... }
}

public class LegacyOrderRecord {
    private String ord_num;
    private String cust_id;
    private double ord_amt;
    private int stat_cd;  // 1=New, 2=Processing, 3=Shipped, 4=Complete, 5=Cancelled
    private String ord_dt;  // Format: "YYYYMMDD"
}

// Our clean domain model
public class Order {
    private OrderId id;
    private CustomerId customerId;
    private Money totalAmount;
    private OrderStatus status;
    private LocalDate orderDate;
}

// Anti-Corruption Layer
package com.company.ordering.acl;

@Component
public class LegacyOrderAcl {
    
    private final LegacyOrderSystem legacySystem;
    private final LegacyOrderTranslator translator;
    
    public Optional<Order> findOrder(OrderId orderId) {
        try {
            LegacyOrderRecord record = legacySystem.getOrderByNumber(orderId.getValue());
            return Optional.ofNullable(record)
                .map(translator::translateToOrder);
        } catch (LegacySystemException e) {
            log.warn("Legacy system error for order {}: {}", orderId, e.getMessage());
            return Optional.empty();
        }
    }
    
    public void updateStatus(Order order) {
        int legacyStatusCode = translator.translateStatusToLegacy(order.getStatus());
        legacySystem.updateOrderStatus(order.getId().getValue(), legacyStatusCode);
    }
}

@Component
public class LegacyOrderTranslator {
    
    public Order translateToOrder(LegacyOrderRecord record) {
        return new Order(
            new OrderId(record.getOrd_num()),
            new CustomerId(record.getCust_id()),
            Money.of(BigDecimal.valueOf(record.getOrd_amt()), "USD"),
            translateStatus(record.getStat_cd()),
            parseDate(record.getOrd_dt())
        );
    }
    
    private OrderStatus translateStatus(int legacyCode) {
        return switch (legacyCode) {
            case 1 -> OrderStatus.PLACED;
            case 2 -> OrderStatus.PROCESSING;
            case 3 -> OrderStatus.SHIPPED;
            case 4 -> OrderStatus.DELIVERED;
            case 5 -> OrderStatus.CANCELLED;
            default -> throw new UnknownLegacyStatusException(legacyCode);
        };
    }
    
    public int translateStatusToLegacy(OrderStatus status) {
        return switch (status) {
            case PLACED -> 1;
            case PROCESSING -> 2;
            case SHIPPED -> 3;
            case DELIVERED -> 4;
            case CANCELLED -> 5;
            default -> throw new CannotTranslateStatusException(status);
        };
    }
    
    private LocalDate parseDate(String legacyDate) {
        return LocalDate.parse(legacyDate, DateTimeFormatter.BASIC_ISO_DATE);
    }
}
```

### 6. Open Host Service

Provide a well-defined protocol for integration:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OPEN HOST SERVICE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│           ┌─────────────────────────────────────┐                   │
│           │         OPEN HOST SERVICE           │                   │
│           │                                      │                   │
│           │  ┌──────────────────────────────┐   │     ┌────────┐   │
│           │  │    Published API (v1, v2)    │───┼────►│Consumer│   │
│           │  │                              │   │     │   A    │   │
│           │  │  • REST endpoints            │   │     └────────┘   │
│           │  │  • Event schemas             │   │                   │
│           │  │  • Message formats           │───┼────►┌────────┐   │
│           │  │                              │   │     │Consumer│   │
│           │  └──────────────────────────────┘   │     │   B    │   │
│           │                                      │     └────────┘   │
│           │      Domain Model (Internal)        │                   │
│           │                                      │     ┌────────┐   │
│           └─────────────────────────────────────┼────►│Consumer│   │
│                                                       │   C    │   │
│                                                       └────────┘   │
│   Key principles:                                                   │
│   • One provider, many consumers                                    │
│   • Versioned APIs for backward compatibility                       │
│   • Well-documented contracts                                       │
│   • Consumer-friendly design                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

```java
// Open Host Service with versioned API
package com.company.inventory.api;

// Version 1 API - maintained for backward compatibility
@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryApiV1 {
    
    @GetMapping("/stock/{sku}")
    public StockResponseV1 getStock(@PathVariable String sku) {
        StockItem item = inventoryService.findBySku(new Sku(sku));
        return new StockResponseV1(
            item.getSku().getValue(),
            item.getAvailableQuantity()
        );
    }
}

// Version 2 API - enhanced with more details
@RestController
@RequestMapping("/api/v2/inventory")
public class InventoryApiV2 {
    
    @GetMapping("/stock/{sku}")
    public StockResponseV2 getStock(@PathVariable String sku) {
        StockItem item = inventoryService.findBySku(new Sku(sku));
        return new StockResponseV2(
            item.getSku().getValue(),
            item.getAvailableQuantity(),
            item.getReservedQuantity(),
            item.getWarehouseLocation().getCode(),
            item.getEstimatedRestockDate()
        );
    }
}

// Published event schema
package com.company.inventory.api.events;

@Schema(description = "Published when stock level changes")
public record StockLevelChangedEvent(
    @Schema(description = "Product SKU") 
    String sku,
    
    @Schema(description = "Previous available quantity")
    int previousQuantity,
    
    @Schema(description = "New available quantity")
    int newQuantity,
    
    @Schema(description = "Reason for change")
    String reason,
    
    @Schema(description = "Event timestamp")
    Instant occurredAt
) {}
```

### 7. Published Language

A shared model specifically for integration:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PUBLISHED LANGUAGE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│       Context A                               Context B             │
│     ┌───────────┐                           ┌───────────┐          │
│     │  Internal │        ┌───────────┐      │  Internal │          │
│     │   Model   │◄──────►│ Published │◄────►│   Model   │          │
│     │           │        │  Language │      │           │          │
│     └───────────┘        └───────────┘      └───────────┘          │
│                                                                      │
│   The Published Language:                                           │
│   • Is neither context's internal model                             │
│   • Designed for interchange                                        │
│   • May use industry standards (EDI, FHIR, etc.)                   │
│   • Versioned and documented                                        │
│                                                                      │
│   Examples:                                                         │
│   • Financial: FIX protocol, SWIFT messages                         │
│   • Healthcare: HL7, FHIR                                          │
│   • E-commerce: Product data feeds, order schemas                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8. Separate Ways

No integration - contexts are completely independent:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SEPARATE WAYS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     ┌───────────┐                           ┌───────────┐          │
│     │  Context  │           ✕ ✕ ✕           │  Context  │          │
│     │     A     │                           │     B     │          │
│     │           │      No Integration       │           │          │
│     └───────────┘                           └───────────┘          │
│                                                                      │
│   When appropriate:                                                 │
│   • Integration cost exceeds benefit                                │
│   • Contexts truly independent                                      │
│   • Better to duplicate than integrate poorly                       │
│   • Different lifecycle/ownership                                   │
│                                                                      │
│   Example:                                                          │
│   • Internal HR system and Customer-facing portal                   │
│   • No business need to connect them                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Drawing Context Maps

### Visual Notation

```
CONTEXT MAP NOTATION
────────────────────

Contexts:           Relationships:
┌─────────┐         ────────► Downstream depends on Upstream
│ Context │         ════════► Partnership (mutual)
│  Name   │         - - - - - Shared Kernel
└─────────┘         ≈≈≈≈≈≈≈≈► ACL (protected boundary)
                    
Labels:
U = Upstream
D = Downstream  
ACL = Anti-Corruption Layer
OHS = Open Host Service
PL = Published Language
CF = Conformist
```

### Example Context Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    E-COMMERCE CONTEXT MAP                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                         ┌───────────────┐                           │
│                         │   IDENTITY    │                           │
│                         │   (Generic)   │                           │
│                         │     OHS       │                           │
│                         └───────┬───────┘                           │
│                                 │                                    │
│                   ┌─────────────┼─────────────┐                     │
│                   │             │             │                      │
│                   ▼             ▼             ▼                      │
│          ┌──────────────┐ ┌──────────┐ ┌──────────────┐            │
│          │   CATALOG    │ │ ORDERING │ │   CUSTOMER   │            │
│          │  (Support)   │ │  (Core)  │ │  (Support)   │            │
│          └──────┬───────┘ └────┬─────┘ └──────────────┘            │
│                 │              │                                     │
│     ┌───────────┴──────────────┼────────────────────┐               │
│     │                          │                    │               │
│     │    Shared Kernel: ProductId, CustomerId, Money                │
│     │                          │                    │               │
│     └──────────────────────────┴────────────────────┘               │
│                                │                                     │
│         ┌──────────────────────┼──────────────────────┐             │
│         │                      │                      │              │
│         ▼                      ▼                      ▼              │
│  ┌────────────┐        ┌────────────┐        ┌────────────┐        │
│  │ INVENTORY  │        │  PRICING   │        │  SHIPPING  │        │
│  │  (Support) │        │   (Core)   │        │ (Support)  │        │
│  │    [U]     │        │            │        │            │        │
│  └────────────┘        └────────────┘        └────────────┘        │
│         │                                            │               │
│         │                                            │               │
│         ▼                                            ▼               │
│  ┌────────────┐                              ┌────────────┐         │
│  │ WAREHOUSE  │                              │  CARRIER   │         │
│  │  (Legacy)  │                              │ (External) │         │
│  │   [ACL]    │                              │   [CF]     │         │
│  └────────────┘                              └────────────┘         │
│                                                                      │
│  Legend:                                                            │
│  • Core domains in bold                                             │
│  • [U] = Upstream, [D] = Downstream                                 │
│  • [ACL] = Anti-Corruption Layer                                    │
│  • [CF] = Conformist                                                │
│  • [OHS] = Open Host Service                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Choosing the Right Pattern

### Decision Guide

```
┌─────────────────────────────────────────────────────────────────────┐
│              CHOOSING A RELATIONSHIP PATTERN                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Can you influence the upstream?                                    │
│  │                                                                   │
│  ├─ YES, significantly ──► Partnership or Customer-Supplier        │
│  │                                                                   │
│  ├─ YES, somewhat ──► Customer-Supplier (negotiate needs)          │
│  │                                                                   │
│  └─ NO ─────────────┬──► Is their model acceptable?                │
│                     │                                                │
│                     ├─ YES ──► Conformist                           │
│                     │                                                │
│                     └─ NO ───► Anti-Corruption Layer                │
│                                                                      │
│  Do you need tight coordination?                                    │
│  │                                                                   │
│  ├─ YES ──► Partnership (expensive but aligned)                    │
│  │                                                                   │
│  └─ NO ───► Customer-Supplier or Conformist                        │
│                                                                      │
│  Is there shared core logic?                                        │
│  │                                                                   │
│  ├─ YES, minimal ──► Shared Kernel (keep it tiny!)                 │
│  │                                                                   │
│  └─ NO or too much ──► Separate contexts with translation          │
│                                                                      │
│  Is integration valuable?                                           │
│  │                                                                   │
│  ├─ YES ──► One of the patterns above                              │
│  │                                                                   │
│  └─ NO ───► Separate Ways                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Context Maps visualize system relationships** - Essential for understanding the big picture

2. **Choose patterns consciously** - Each has trade-offs

3. **Protect your core domain** - Use ACL when needed

4. **Shared Kernel must be minimal** - Resist the temptation to share too much

5. **Document the maps** - They guide integration decisions

6. **Maps evolve** - Review and update as the system changes

---

## What's Next?

In [Chapter 7: Subdomains and Domain Distillation](./07-subdomains.md), we'll explore how to identify and prioritize different parts of your domain, understanding what makes up your core domain versus supporting and generic subdomains.

---

**[← Previous: Bounded Contexts](./05-bounded-contexts.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Subdomains →](./07-subdomains.md)**
