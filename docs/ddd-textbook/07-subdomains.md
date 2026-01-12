# Chapter 7: Subdomains and Domain Distillation

> *"Distill the core domain. Focus on the parts of the domain that add the most value."*
> — Eric Evans

---

## Understanding Subdomains

A **Subdomain** is a portion of the overall business domain. Every business domain can be decomposed into subdomains, each representing a specific area of expertise or capability.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOMAIN DECOMPOSITION                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    ┌──────────────────────────┐                     │
│                    │     BUSINESS DOMAIN      │                     │
│                    │    (The whole problem    │                     │
│                    │     space)               │                     │
│                    └──────────────────────────┘                     │
│                               │                                      │
│           ┌───────────────────┼───────────────────┐                 │
│           │                   │                   │                  │
│           ▼                   ▼                   ▼                  │
│    ┌────────────┐     ┌────────────┐     ┌────────────┐            │
│    │ Subdomain  │     │ Subdomain  │     │ Subdomain  │            │
│    │     A      │     │     B      │     │     C      │            │
│    └────────────┘     └────────────┘     └────────────┘            │
│                                                                      │
│   PROBLEM SPACE                SOLUTION SPACE                       │
│   (Business Reality)          (Our Implementation)                  │
│                                                                      │
│   Subdomains exist            Bounded Contexts are                  │
│   regardless of how           our modeling decisions                │
│   we model them                                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Subdomain vs Bounded Context

```
┌─────────────────────────────────────────────────────────────────────┐
│           SUBDOMAIN vs BOUNDED CONTEXT                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   SUBDOMAIN                        BOUNDED CONTEXT                  │
│   ─────────                        ───────────────                  │
│                                                                      │
│   • Problem space                  • Solution space                 │
│   • Discovered, not designed       • Designed by us                 │
│   • Business capability            • Software boundary              │
│   • Exists independently of IT     • Our modeling choice            │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                              │   │
│   │  Ideally: 1 Subdomain ═══════ 1 Bounded Context             │   │
│   │                                                              │   │
│   │  Reality often differs:                                      │   │
│   │                                                              │   │
│   │  • One context might span multiple subdomains (bad)         │   │
│   │  • One subdomain might be split into contexts (sometimes ok)│   │
│   │  • Legacy systems rarely align with subdomains              │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Types of Subdomains

### The Three Categories

```
┌─────────────────────────────────────────────────────────────────────┐
│                   SUBDOMAIN CLASSIFICATION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ╔═══════════════════════════════════════════════════════════════╗ │
│   ║                      CORE DOMAIN                               ║ │
│   ║                                                                ║ │
│   ║  • What makes the business unique                             ║ │
│   ║  • Source of competitive advantage                            ║ │
│   ║  • Cannot be outsourced                                       ║ │
│   ║  • Deserves the most investment                               ║ │
│   ║  • Needs the best people                                      ║ │
│   ║                                                                ║ │
│   ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                      │
│   ┌───────────────────────────────────────────────────────────────┐ │
│   │                  SUPPORTING SUBDOMAIN                          │ │
│   │                                                                │ │
│   │  • Necessary for the core to function                         │ │
│   │  • Not a differentiator                                       │ │
│   │  • Custom to the business, but could be simpler               │ │
│   │  • Good enough is often good enough                           │ │
│   │                                                                │ │
│   └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│                      GENERIC SUBDOMAIN                              │
│   │                                                                │ │
│     • Solved problems, nothing special                             │
│   │ • Available off-the-shelf                                      │ │
│     • Buy or use open source                                       │
│   │ • Minimize investment                                          │ │
│                                                                     │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Comparison Matrix

| Aspect | Core | Supporting | Generic |
|--------|------|------------|---------|
| **Business Value** | Differentiator | Necessary | Commodity |
| **Complexity** | High | Medium | Low-Medium |
| **Change Rate** | Frequent | Moderate | Rare |
| **Investment** | Maximum | Adequate | Minimal |
| **Team** | Best talent | Solid developers | Junior/Outsource |
| **Build/Buy** | Always build | Build simple | Buy/OSS |
| **DDD Application** | Full tactical+strategic | Tactical basics | Transaction script OK |

---

## Identifying Subdomain Types

### The Discovery Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUBDOMAIN DISCOVERY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 1: List all business capabilities                             │
│  ────────────────────────────────────────                           │
│  What does the business DO?                                         │
│                                                                      │
│  Example (E-commerce):                                              │
│  • Manage product catalog                                           │
│  • Calculate prices and discounts                                   │
│  • Process orders                                                   │
│  • Handle payments                                                  │
│  • Manage inventory                                                 │
│  • Ship products                                                    │
│  • Handle returns                                                   │
│  • Customer support                                                 │
│  • Marketing campaigns                                              │
│  • User authentication                                              │
│                                                                      │
│  STEP 2: Ask key questions for each                                 │
│  ───────────────────────────────────                                │
│                                                                      │
│  Q1: "Would a competitor doing this better hurt us significantly?"  │
│      YES → Likely CORE                                              │
│      NO  → Supporting or Generic                                    │
│                                                                      │
│  Q2: "Could we buy this off the shelf?"                            │
│      YES, easily → GENERIC                                          │
│      Maybe, with customization → SUPPORTING                         │
│      NO → Likely CORE                                               │
│                                                                      │
│  Q3: "Do domain experts spend significant time discussing this?"   │
│      YES → Likely CORE or important SUPPORTING                      │
│      NO → Likely GENERIC                                            │
│                                                                      │
│  Q4: "Is this where our specialized knowledge lives?"              │
│      YES → CORE                                                     │
│      NO → Supporting or Generic                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Real-World Examples

```
EXAMPLE 1: E-COMMERCE PLATFORM (Like Amazon)
────────────────────────────────────────────

┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  CORE DOMAIN                                                       │
│  • Recommendation engine (what makes Amazon Amazon)                │
│  • Dynamic pricing                                                 │
│  • Search relevance                                                │
│  • Fulfillment optimization                                        │
│                                                                     │
│  SUPPORTING SUBDOMAINS                                             │
│  • Product catalog management                                      │
│  • Order management                                                │
│  • Inventory tracking                                              │
│  • Customer management                                             │
│  • Seller management                                               │
│                                                                     │
│  GENERIC SUBDOMAINS                                                │
│  • User authentication                                             │
│  • Payment processing                                              │
│  • Email notifications                                             │
│  • Reporting/analytics                                             │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

EXAMPLE 2: INSURANCE COMPANY
────────────────────────────

┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  CORE DOMAIN                                                       │
│  • Risk assessment/underwriting                                    │
│  • Pricing/rating engine                                           │
│  • Claims adjudication                                             │
│  • Actuarial modeling                                              │
│                                                                     │
│  SUPPORTING SUBDOMAINS                                             │
│  • Policy administration                                           │
│  • Customer management                                             │
│  • Agent/broker management                                         │
│  • Document generation                                             │
│                                                                     │
│  GENERIC SUBDOMAINS                                                │
│  • Billing and payments                                            │
│  • User authentication                                             │
│  • Email/notifications                                             │
│  • Regulatory reporting                                            │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

EXAMPLE 3: RIDE-SHARING (Like Uber)
───────────────────────────────────

┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  CORE DOMAIN                                                       │
│  • Ride matching algorithm                                         │
│  • Dynamic/surge pricing                                           │
│  • ETA prediction                                                  │
│  • Route optimization                                              │
│                                                                     │
│  SUPPORTING SUBDOMAINS                                             │
│  • Driver management                                               │
│  • Rider management                                                │
│  • Ride tracking                                                   │
│  • Ratings and reviews                                             │
│                                                                     │
│  GENERIC SUBDOMAINS                                                │
│  • Payment processing                                              │
│  • Maps/geolocation                                                │
│  • Notifications                                                   │
│  • Customer support                                                │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## Domain Distillation

### What is Distillation?

**Domain Distillation** is the process of separating the core domain from the supporting elements, clarifying the essential model that provides competitive advantage.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOMAIN DISTILLATION                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   BEFORE DISTILLATION                 AFTER DISTILLATION            │
│   ───────────────────                 ──────────────────            │
│                                                                      │
│   ┌─────────────────────┐            ┌─────────────────────┐       │
│   │░░░░░░░░░░░░░░░░░░░░░│            │░░░░░░░░░░░░░░░░░░░░░│       │
│   │░░░░░░░░░░░░░░░░░░░░░│            │░░░░┌───────────┐░░░░│       │
│   │░░░░░░░░░░░░░░░░░░░░░│            │░░░░│           │░░░░│       │
│   │░░░░░EVERYTHING░░░░░░│     →      │░░░░│   CORE    │░░░░│       │
│   │░░░░░░░MIXED░░░░░░░░░│            │░░░░│  DOMAIN   │░░░░│       │
│   │░░░░░░TOGETHER░░░░░░░│            │░░░░│           │░░░░│       │
│   │░░░░░░░░░░░░░░░░░░░░░│            │░░░░└───────────┘░░░░│       │
│   │░░░░░░░░░░░░░░░░░░░░░│            │░░░░░░░░░░░░░░░░░░░░░│       │
│   └─────────────────────┘            └─────────────────────┘       │
│                                       ░ = Supporting/Generic        │
│   "Everything seems                                                 │
│    equally important"                "Core is clearly               │
│                                       identified and                │
│                                       separated"                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Distillation Techniques

#### 1. Domain Vision Statement

A short description of the core domain's value:

```
┌─────────────────────────────────────────────────────────────────────┐
│                 DOMAIN VISION STATEMENT                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Template:                                                          │
│  ─────────                                                          │
│  "[Company] differentiates itself by [unique capability].           │
│  The core domain of [domain name] makes this possible by            │
│  [how it works]. This gives us advantage because                    │
│  [why competitors can't easily replicate]."                         │
│                                                                      │
│  Example (Ride-sharing):                                            │
│  ───────────────────────                                            │
│  "RideNow differentiates itself by providing the fastest           │
│  ride matching in urban areas. The core domain of                   │
│  Ride Matching makes this possible by using real-time              │
│  driver positioning, predictive demand modeling, and               │
│  proprietary route optimization. This gives us advantage           │
│  because it requires years of data and ML expertise that           │
│  competitors cannot quickly replicate."                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 2. Highlighted Core

Mark the core domain explicitly in code and documentation:

```java
/**
 * CORE DOMAIN - Ride Matching
 * 
 * This is the heart of our competitive advantage.
 * Changes require senior review and thorough testing.
 * 
 * @see docs/domain-vision.md
 * @core-domain
 */
package com.ridenow.matching.domain;

/**
 * The RideMatchingEngine is the central algorithm that matches
 * riders with available drivers, optimizing for:
 * - Pickup time (minimize wait)
 * - Driver utilization (maximize rides per driver)
 * - Service quality (ratings, preferences)
 * 
 * This is our PRIMARY COMPETITIVE ADVANTAGE.
 */
public class RideMatchingEngine {
    
    /**
     * Find the optimal driver for a ride request.
     * 
     * This algorithm considers:
     * 1. Driver proximity (not just distance - actual ETA)
     * 2. Driver heading (are they driving toward the pickup?)
     * 3. Predicted demand (will this leave a dead zone?)
     * 4. Driver preferences and ratings
     * 5. Rider preferences and history
     */
    public MatchResult findOptimalMatch(RideRequest request) {
        List<AvailableDriver> candidates = findCandidates(request);
        
        return candidates.stream()
            .map(driver -> scoreMatch(driver, request))
            .max(Comparator.comparing(MatchScore::getValue))
            .map(MatchScore::getDriver)
            .map(driver -> MatchResult.matched(driver, request))
            .orElse(MatchResult.noMatch(request));
    }
    
    private MatchScore scoreMatch(AvailableDriver driver, RideRequest request) {
        // Complex proprietary algorithm
        double proximityScore = calculateProximityScore(driver, request);
        double headingScore = calculateHeadingScore(driver, request);
        double demandScore = calculateDemandImpact(driver, request);
        double preferenceScore = calculatePreferenceMatch(driver, request);
        
        return new MatchScore(
            driver,
            weightedCombine(proximityScore, headingScore, demandScore, preferenceScore)
        );
    }
}
```

#### 3. Generic Subdomains Extraction

Extract generic functionality to separate modules or external services:

```java
// BEFORE: Generic code mixed with core domain
public class RideMatchingEngine {
    
    public MatchResult findOptimalMatch(RideRequest request) {
        // Core domain logic...
        
        // GENERIC: Sending notifications (doesn't belong here!)
        emailService.sendEmail(rider, "Driver on the way!");
        smsService.sendSms(driver, "New ride request");
        pushNotificationService.send(rider, notification);
    }
}

// AFTER: Generic subdomain extracted
public class RideMatchingEngine {
    
    public MatchResult findOptimalMatch(RideRequest request) {
        // Pure core domain logic
        MatchResult result = performMatching(request);
        
        // Raise domain event - let generic systems handle notifications
        DomainEvents.raise(new RideMatchedEvent(result));
        
        return result;
    }
}

// In GENERIC subdomain (notification)
package com.ridenow.notification;

@Service
public class RideNotificationHandler {
    
    @EventListener
    public void on(RideMatchedEvent event) {
        // All notification logic isolated here
        notifyRider(event);
        notifyDriver(event);
    }
}
```

#### 4. Cohesive Mechanisms

Extract complex technical mechanisms into separate modules:

```java
// Complex technical mechanism: Route Calculation
// This is sophisticated but not core domain - it's a tool

package com.ridenow.infrastructure.routing;

/**
 * COHESIVE MECHANISM - Route Calculation
 * 
 * This is complex and sophisticated, but it's a TOOL used by the
 * core domain, not the core domain itself. Many companies use
 * similar algorithms or buy them from vendors.
 */
public class RouteCalculator {
    
    private final GraphHopperAPI graphHopper;
    private final TrafficDataProvider trafficData;
    
    public Route calculateRoute(Location from, Location to) {
        // Complex Dijkstra/A* implementation
        // Traffic-aware routing
        // Turn-by-turn directions
        // This is a supporting mechanism, not core
    }
    
    public Duration estimateTime(Location from, Location to) {
        // ML-based ETA prediction
        // Historical patterns
        // Real-time conditions
    }
}

// Core domain USES the mechanism but doesn't contain it
package com.ridenow.matching.domain;

public class RideMatchingEngine {
    
    private final RouteCalculator routeCalculator;  // Mechanism injected
    
    private double calculateProximityScore(AvailableDriver driver, RideRequest request) {
        // USE the mechanism
        Duration eta = routeCalculator.estimateTime(
            driver.getLocation(), 
            request.getPickupLocation()
        );
        
        // Core domain LOGIC uses the result
        return scoreFromEta(eta);
    }
}
```

---

## Investment Strategy

### Resource Allocation

```
┌─────────────────────────────────────────────────────────────────────┐
│                 INVESTMENT BY SUBDOMAIN TYPE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CORE DOMAIN (60-70% of effort)                                    │
│  ──────────────────────────────                                     │
│  │████████████████████████████████████████████████████│             │
│                                                                      │
│  • Assign best developers                                           │
│  • Full DDD tactical patterns                                       │
│  • Extensive testing                                                │
│  • Continuous refinement                                            │
│  • Domain expert collaboration                                      │
│  • Regular knowledge crunching sessions                             │
│                                                                      │
│  SUPPORTING SUBDOMAIN (20-30% of effort)                           │
│  ───────────────────────────────────────                            │
│  │██████████████████████│                                          │
│                                                                      │
│  • Solid developers                                                 │
│  • Simplified DDD (entities, value objects)                         │
│  • Good enough testing                                              │
│  • Avoid over-engineering                                           │
│  • Simpler CRUD acceptable in parts                                 │
│                                                                      │
│  GENERIC SUBDOMAIN (10-15% of effort)                              │
│  ────────────────────────────────────                               │
│  │███████│                                                          │
│                                                                      │
│  • Buy or use open source when possible                             │
│  • Junior developers or outsource                                   │
│  • Transaction scripts acceptable                                   │
│  • Minimal custom code                                              │
│  • Integrate, don't innovate                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Team Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                  TEAM ALIGNMENT WITH SUBDOMAINS                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  OPTION 1: Dedicated Teams per Subdomain Type                       │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   CORE TEAM     │  │ SUPPORTING TEAM │  │ PLATFORM TEAM   │     │
│  │                 │  │                 │  │                 │     │
│  │ • Senior devs   │  │ • Mid-level     │  │ • Generalists   │     │
│  │ • Domain experts│  │ • Full-stack    │  │ • Ops engineers │     │
│  │ • Architects    │  │                 │  │                 │     │
│  │                 │  │                 │  │                 │     │
│  │ Own: Matching,  │  │ Own: Rider,     │  │ Own: Auth,      │     │
│  │ Pricing         │  │ Driver mgmt     │  │ Payments,       │     │
│  │                 │  │                 │  │ Notifications   │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                      │
│  OPTION 2: Feature Teams with Core Focus                            │
│                                                                      │
│  Each feature team includes:                                        │
│  • At least one senior developer focused on core                    │
│  • Domain expert access                                             │
│  • Clear boundaries between core and supporting work                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Common Mistakes

### Mistake 1: Everything is Core

```
❌ WRONG: "All our code is critical!"
────────────────────────────────────

Result: No prioritization, mediocre everything

┌─────────────────────────────────────────┐
│          "ALL CORE" SYNDROME            │
│                                         │
│  Auth      Catalog    Orders    Pricing │
│  [Core]    [Core]     [Core]    [Core]  │
│                                         │
│  Shipping  Support    Reports   Billing │
│  [Core]    [Core]     [Core]    [Core]  │
│                                         │
│  When everything is core,               │
│  nothing is core.                       │
│                                         │
└─────────────────────────────────────────┘

✅ RIGHT: Honest Assessment
───────────────────────────

┌─────────────────────────────────────────┐
│          DISTILLED DOMAIN               │
│                                         │
│  Auth       Catalog    Orders   PRICING │
│  [Generic]  [Support]  [Support] [CORE] │
│                                         │
│  Shipping   Support    Reports  MATCHING│
│  [Support]  [Generic]  [Generic] [CORE] │
│                                         │
│  Core gets best talent and              │
│  investment. Others get                 │
│  appropriate effort.                    │
│                                         │
└─────────────────────────────────────────┘
```

### Mistake 2: Over-Engineering Supporting Domains

```java
// ❌ WRONG: Full DDD complexity for user profile (generic/supporting)

public class UserProfile extends AggregateRoot<UserProfileId> {
    private ProfileBasicInfo basicInfo;
    private ProfilePreferences preferences;
    private ProfileAuditTrail auditTrail;
    
    public void updateEmail(UpdateEmailCommand command, EmailValidator validator,
                           AuditService audit, EventPublisher events) {
        validator.validate(command.getNewEmail());
        EmailChangedEvent event = new EmailChangedEvent(/*...*/);
        this.basicInfo = this.basicInfo.withEmail(command.getNewEmail());
        this.auditTrail = this.auditTrail.record(event);
        events.publish(event);
        audit.log(event);
    }
}

// ✅ RIGHT: Simple and direct for supporting domain
public class UserProfile {
    private Long id;
    private String email;
    private String name;
    private Map<String, String> preferences;
    
    public void updateEmail(String newEmail) {
        this.email = Objects.requireNonNull(newEmail);
    }
}
```

### Mistake 3: Using Vendors for Core Domain

```
❌ WRONG: Outsourcing competitive advantage
──────────────────────────────────────────

"Let's use VendorX for our pricing engine - 
they have a product that does pricing!"

Problem: If everyone uses the same vendor,
         where's YOUR competitive advantage?

✅ RIGHT: Build core, buy generic
─────────────────────────────────

• CORE (Pricing): Build custom, invest heavily
• SUPPORTING (Orders): Build simple
• GENERIC (Auth): Use Auth0, Okta, etc.
• GENERIC (Payments): Use Stripe, Adyen
• GENERIC (Email): Use SendGrid, Mailgun
```

---

## Practical Exercise

### Map Your Domain

```
EXERCISE: Domain Distillation
─────────────────────────────

1. List all major capabilities of your system
   _________________________________
   _________________________________
   _________________________________
   _________________________________
   _________________________________

2. For each, answer:
   
   ┌──────────────┬──────────┬─────────────┬────────────┐
   │ Capability   │ Core?    │ Could Buy?  │ Expert     │
   │              │ (Y/N)    │ (Y/N)       │ Focus?(Y/N)│
   ├──────────────┼──────────┼─────────────┼────────────┤
   │              │          │             │            │
   ├──────────────┼──────────┼─────────────┼────────────┤
   │              │          │             │            │
   ├──────────────┼──────────┼─────────────┼────────────┤
   │              │          │             │            │
   └──────────────┴──────────┴─────────────┴────────────┘

3. Classify:
   - Core if: Is unique AND can't buy AND experts focus on it
   - Generic if: Could easily buy
   - Supporting if: Neither

4. Validate with stakeholders:
   "Is [X] really what differentiates us?"
```

---

## Key Takeaways

1. **Subdomains are discovered, not invented** - They exist in the business reality

2. **Not everything is core** - Be honest about what truly differentiates you

3. **Investment should match importance** - Core gets the best, generic gets minimal

4. **Distillation is ongoing** - What's core may change as business evolves

5. **Build core, buy generic** - Don't reinvent solved problems

6. **Team structure should reflect subdomain importance** - Best people on core

---

## What's Next?

Now that we understand strategic design, we'll dive into **Tactical Design** - the building blocks for implementing our domain models. We start with [Chapter 8: Domain Model Overview](./08-domain-model.md).

---

**[← Previous: Context Mapping](./06-context-mapping.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Domain Model Overview →](./08-domain-model.md)**
