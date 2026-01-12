# Chapter 24: Starting a DDD Project

> *"Start with the domain, not with the data model or technology."*

---

## Phase 1: Domain Discovery

```
┌─────────────────────────────────────────────────────────────────────┐
│               DOMAIN DISCOVERY ACTIVITIES                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   WEEK 1-2: UNDERSTAND THE DOMAIN                                   │
│                                                                      │
│   1. Meet domain experts                                            │
│      • Schedule regular sessions (2-3x per week)                   │
│      • Record discussions                                           │
│      • Take notes on terminology                                    │
│                                                                      │
│   2. Conduct Event Storming (see Chapter 25)                       │
│      • Map business processes                                       │
│      • Identify events, commands, aggregates                        │
│      • Discover bounded contexts                                    │
│                                                                      │
│   3. Build Ubiquitous Language glossary                            │
│      • Document key terms                                           │
│      • Get domain expert approval                                   │
│                                                                      │
│   4. Identify Core Domain                                          │
│      • What's the competitive advantage?                           │
│      • Where should we invest most?                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Strategic Design

```java
// Document your context map
/**
 * CONTEXT MAP - E-Commerce System
 * 
 * [CORE] Pricing Context
 *    └── (Customer-Supplier) → Catalog Context [SUPPORTING]
 *    └── (Customer-Supplier) → Customer Context [SUPPORTING]
 * 
 * [CORE] Fulfillment Context
 *    └── (Partnership) → Inventory Context [SUPPORTING]
 *    └── (Conformist) → Shipping Provider [EXTERNAL]
 * 
 * [GENERIC] Identity Context (Auth0)
 * [GENERIC] Payment Context (Stripe)
 */
```

---

## Phase 3: Tactical Implementation

### Start Small

```
┌─────────────────────────────────────────────────────────────────────┐
│               IMPLEMENTATION APPROACH                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. Pick ONE bounded context to start                             │
│      • Preferably the core domain                                  │
│      • Small enough to build in 2-4 weeks                          │
│                                                                      │
│   2. Create the domain model                                        │
│      • Start with aggregates                                        │
│      • Add value objects                                            │
│      • Define repository interfaces                                 │
│                                                                      │
│   3. Add application services                                       │
│      • One service per use case                                     │
│      • Keep them thin                                               │
│                                                                      │
│   4. Implement infrastructure                                       │
│      • Repository implementations                                   │
│      • Start with in-memory for testing                            │
│      • Add real persistence later                                   │
│                                                                      │
│   5. Iterate and refine                                            │
│      • Review with domain experts                                   │
│      • Refactor as understanding grows                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Starter Project Structure

```
my-ddd-project/
├── src/main/java/com/company/
│   ├── Application.java
│   │
│   ├── ordering/                    # Bounded Context
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   ├── Order.java
│   │   │   │   ├── OrderId.java
│   │   │   │   └── OrderLine.java
│   │   │   └── repository/
│   │   │       └── OrderRepository.java
│   │   ├── application/
│   │   │   └── OrderService.java
│   │   └── infrastructure/
│   │       └── persistence/
│   │           └── JpaOrderRepository.java
│   │
│   └── shared/                      # Shared Kernel
│       └── Money.java
│
├── src/test/java/
│   └── com/company/ordering/
│       ├── domain/
│       │   └── OrderTest.java       # Unit tests for domain
│       └── application/
│           └── OrderServiceTest.java
│
└── docs/
    ├── ubiquitous-language.md
    └── context-map.md
```

---

## Checklist for Starting

```
□ Domain expert(s) identified and available
□ Event Storming session scheduled
□ Ubiquitous Language glossary started
□ Core domain identified
□ First bounded context chosen
□ Project structure created
□ First aggregate implemented
□ Tests written for domain logic
□ Application service created
□ Review with domain expert completed
```

---

**[← Previous: Event Sourcing](./23-event-sourcing.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Event Storming →](./25-event-storming.md)**
