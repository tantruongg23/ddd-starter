# Chapter 21: Clean Architecture with DDD

> *"The architecture should scream the intent of the system."*
> — Robert C. Martin

---

## Clean Architecture Overview

**Clean Architecture** by Robert C. Martin (Uncle Bob) synthesizes ideas from Hexagonal, Onion, and other architectures. Combined with DDD, it provides a powerful structure for complex systems.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLEAN ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  FRAMEWORKS & DRIVERS                                         │  │
│   │  (Web, UI, DB, Devices, External Interfaces)                 │  │
│   │                                                               │  │
│   │   ┌──────────────────────────────────────────────────────┐   │  │
│   │   │  INTERFACE ADAPTERS                                   │   │  │
│   │   │  (Controllers, Gateways, Presenters)                 │   │  │
│   │   │                                                       │   │  │
│   │   │   ┌──────────────────────────────────────────────┐   │   │  │
│   │   │   │  APPLICATION BUSINESS RULES                   │   │   │  │
│   │   │   │  (Use Cases)                                  │   │   │  │
│   │   │   │                                               │   │   │  │
│   │   │   │   ┌──────────────────────────────────────┐   │   │   │  │
│   │   │   │   │  ENTERPRISE BUSINESS RULES           │   │   │   │  │
│   │   │   │   │  (Entities = Domain Model)           │   │   │   │  │
│   │   │   │   └──────────────────────────────────────┘   │   │   │  │
│   │   │   │                                               │   │   │  │
│   │   │   └──────────────────────────────────────────────┘   │   │  │
│   │   │                                                       │   │  │
│   │   └──────────────────────────────────────────────────────┘   │  │
│   │                                                               │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   THE DEPENDENCY RULE:                                              │
│   Source code dependencies must point INWARD only                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Clean Architecture + DDD Mapping

| Clean Architecture | DDD Equivalent |
|-------------------|----------------|
| Entities | Domain Model (Entities, VOs, Aggregates) |
| Use Cases | Application Services, Command Handlers |
| Interface Adapters | Controllers, Repository Implementations |
| Frameworks & Drivers | Spring, JPA, REST frameworks |

---

## Project Structure

```
src/main/java/com/company/
│
├── domain/                        # ENTITIES (Enterprise Business Rules)
│   ├── order/
│   │   ├── Order.java
│   │   ├── OrderLine.java
│   │   ├── OrderId.java
│   │   └── OrderStatus.java
│   ├── customer/
│   │   └── Customer.java
│   └── shared/
│       ├── Money.java
│       └── DomainEvent.java
│
├── usecase/                       # USE CASES (Application Business Rules)
│   ├── order/
│   │   ├── PlaceOrderUseCase.java
│   │   ├── PlaceOrderInput.java
│   │   ├── PlaceOrderOutput.java
│   │   └── OrderGateway.java      # Output boundary (interface)
│   └── customer/
│       └── GetCustomerUseCase.java
│
├── adapter/                       # INTERFACE ADAPTERS
│   ├── controller/
│   │   └── OrderController.java
│   ├── presenter/
│   │   └── OrderPresenter.java
│   └── gateway/
│       └── OrderDatabaseGateway.java
│
└── infrastructure/                # FRAMEWORKS & DRIVERS
    ├── web/
    │   └── SpringWebConfig.java
    ├── persistence/
    │   └── JpaConfiguration.java
    └── external/
        └── StripeConfiguration.java
```

---

## Use Case Implementation

```java
// Use Case Input (Request Model)
public record PlaceOrderInput(
    String customerId,
    List<OrderLineData> items,
    String shippingAddressId
) {}

// Use Case Output (Response Model)
public record PlaceOrderOutput(
    String orderId,
    String status,
    BigDecimal total
) {}

// Output Boundary (Gateway Interface)
public interface OrderGateway {
    Optional<Order> findById(OrderId id);
    void save(Order order);
}

// Use Case Implementation
public class PlaceOrderUseCase {
    
    private final OrderGateway orderGateway;
    private final CustomerGateway customerGateway;
    
    public PlaceOrderOutput execute(PlaceOrderInput input) {
        // Load entities
        Customer customer = customerGateway.findById(new CustomerId(input.customerId()))
            .orElseThrow(() -> new CustomerNotFoundException());
        
        // Create and execute domain logic
        Order order = Order.create(customer.getId());
        for (var item : input.items()) {
            order.addLine(item.productId(), item.quantity());
        }
        order.place();
        
        // Persist
        orderGateway.save(order);
        
        // Return output
        return new PlaceOrderOutput(
            order.getId().getValue(),
            order.getStatus().name(),
            order.getTotal().getAmount()
        );
    }
}
```

---

## Crossing Boundaries

The most important concept in Clean Architecture is how data crosses boundaries between layers. Each layer should define its own input/output data types:

```java
// Controller (Interface Adapter) converts HTTP to Use Case input
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private final PlaceOrderUseCase placeOrderUseCase;
    
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody PlaceOrderRequest request) {
        // Convert external format → use case input
        PlaceOrderInput input = new PlaceOrderInput(
            request.getCustomerId(),
            request.getItems().stream()
                .map(i -> new OrderLineData(i.getProductId(), i.getQuantity()))
                .toList(),
            request.getShippingAddressId()
        );
        
        // Call use case
        PlaceOrderOutput output = placeOrderUseCase.execute(input);
        
        // Convert use case output → external format
        return ResponseEntity.created(URI.create("/api/orders/" + output.orderId()))
            .body(new OrderResponse(output.orderId(), output.status(), output.total()));
    }
}
```

```
┌─────────────────────────────────────────────────────────────────────┐
│   DATA FLOW ACROSS BOUNDARIES                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   HTTP Request                                                      │
│       ↓                                                              │
│   PlaceOrderRequest (Framework DTO)                                 │
│       ↓ mapped by Controller                                        │
│   PlaceOrderInput (Use Case Input)                                  │
│       ↓ used by Use Case                                            │
│   Order (Domain Entity)                                             │
│       ↓ returned as                                                 │
│   PlaceOrderOutput (Use Case Output)                                │
│       ↓ mapped by Controller                                        │
│   OrderResponse (Framework DTO)                                     │
│       ↓                                                              │
│   HTTP Response                                                      │
│                                                                      │
│   Each layer defines its own types → no layer leaks to others      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screaming Architecture

Uncle Bob's "Screaming Architecture" principle: looking at the top-level structure should tell you what the application **does**, not what framework it uses.

```
✗ BAD: Framework-driven structure (screams "Spring")
src/main/java/
├── controllers/          ← What is this app about?
├── services/
├── repositories/
├── models/
└── configs/

✓ GOOD: Domain-driven structure (screams "Healthcare")
src/main/java/com/company/
├── patient/              ← Core domain
│   ├── domain/
│   ├── usecase/
│   └── adapter/
├── appointment/          ← Core domain
│   ├── domain/
│   ├── usecase/
│   └── adapter/
├── billing/              ← Supporting domain
│   ├── domain/
│   ├── usecase/
│   └── adapter/
└── identity/             ← Generic domain
    └── adapter/
```

---

## Key Principles

```
┌─────────────────────────────────────────────────────────────────────┐
│                CLEAN ARCHITECTURE PRINCIPLES                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. DEPENDENCY RULE                                                │
│      Dependencies point inward. Inner circles know nothing about    │
│      outer circles.                                                 │
│                                                                      │
│   2. ENTITIES ARE BUSINESS RULES                                    │
│      Enterprise-wide business rules, independent of application.    │
│                                                                      │
│   3. USE CASES ARE APPLICATION RULES                                │
│      Application-specific business rules. Orchestrate entities.     │
│                                                                      │
│   4. INTERFACE ADAPTERS CONVERT DATA                                │
│      Convert data between use cases and external formats.           │
│                                                                      │
│   5. FRAMEWORKS ARE DETAILS                                         │
│      Keep them at arm's length. Don't let them infect the core.    │
│                                                                      │
│   6. SCREAMING ARCHITECTURE                                         │
│      Looking at the structure should tell you what the app does,   │
│      not what framework it uses.                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

**[← Previous: Onion Architecture](./20-onion-architecture.md)** | **[Back to Table of Contents](./README.md)** | **[Next: CQRS →](./22-cqrs.md)**
