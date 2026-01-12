# Appendix A: Glossary of DDD Terms

> *Quick reference for Domain-Driven Design terminology*

---

## A

**Aggregate**
: A cluster of domain objects treated as a single unit for data changes. Has a root entity that controls all access.

**Aggregate Root**
: The entity that serves as the entry point to an aggregate. External objects can only reference the root.

**Anti-Corruption Layer (ACL)**
: A translation layer that protects your domain model from external systems or legacy code.

**Application Service**
: A service that orchestrates domain objects to execute use cases. Handles transactions, security, and coordination.

---

## B

**Bounded Context**
: An explicit boundary within which a domain model is defined and applicable. Same terms can have different meanings in different contexts.

---

## C

**Command**
: An object representing an intent to change the system state. Named in imperative form (PlaceOrder, CancelSubscription).

**Context Map**
: A visual representation showing how different Bounded Contexts relate to and integrate with each other.

**Core Domain**
: The part of the domain that provides competitive advantage. Deserves the most investment and best talent.

**CQRS (Command Query Responsibility Segregation)**
: A pattern that separates read and write operations into different models.

---

## D

**Domain**
: The subject area to which the software is applied. The sphere of knowledge and activity.

**Domain Event**
: Something significant that happened in the domain. Named in past tense (OrderPlaced, PaymentReceived).

**Domain Model**
: An organized, selective abstraction of domain knowledge expressed in code.

**Domain Service**
: A stateless service that performs domain logic not naturally belonging to any entity or value object.

---

## E

**Entity**
: An object defined by its identity rather than its attributes. Has a lifecycle and continuity.

**Event Sourcing**
: Storing state as a sequence of events rather than current state. State is reconstructed by replaying events.

**Event Storming**
: A workshop technique for exploring domains by focusing on domain events.

---

## F

**Factory**
: An object responsible for creating complex domain objects, ensuring they are valid upon creation.

---

## G

**Generic Subdomain**
: A subdomain that is not specific to your business. Often solved by off-the-shelf solutions.

---

## H

**Hexagonal Architecture**
: Also called Ports and Adapters. Architecture where the application core is isolated from external concerns.

---

## I

**Invariant**
: A business rule that must always be true. Aggregates protect invariants.

---

## L

**Layered Architecture**
: Architecture organized in horizontal layers (UI, Application, Domain, Infrastructure).

---

## M

**Model-Driven Design**
: The practice of implementing the domain model directly in code, not just as documentation.

---

## O

**Onion Architecture**
: Architecture visualized as concentric layers with domain at center. Dependencies point inward.

---

## P

**Partnership**
: Context mapping pattern where two teams coordinate closely with mutual dependency.

**Port**
: An interface defining how the application core interacts with external concerns.

**Published Language**
: A shared model specifically for integration between bounded contexts.

---

## R

**Repository**
: An abstraction providing the illusion of an in-memory collection of aggregates.

**Rich Domain Model**
: A domain model where behavior is encapsulated with data, as opposed to anemic model.

---

## S

**Shared Kernel**
: A small subset of the domain model shared between two bounded contexts.

**Specification**
: An object that encapsulates business rules for querying or validation.

**Strategic Design**
: High-level DDD patterns for organizing large systems (Bounded Contexts, Context Maps, Subdomains).

**Subdomain**
: A portion of the overall business domain. Can be Core, Supporting, or Generic.

**Supporting Subdomain**
: A subdomain necessary for the core to function but not a differentiator.

---

## T

**Tactical Design**
: Implementation-level DDD patterns (Entities, Value Objects, Aggregates, etc.).

---

## U

**Ubiquitous Language**
: A shared language used by all team members (developers and domain experts) in conversations, documentation, and code.

---

## V

**Value Object**
: An object defined by its attributes, not identity. Immutable and interchangeable.

---

**[Back to Table of Contents](./README.md)**
