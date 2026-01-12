# DDD Architecture Guide

This project follows **Domain-Driven Design (DDD)** principles with **Hexagonal Architecture** (Ports & Adapters) and **CQRS** patterns.

## 📁 Project Structure

```
tony.ddd/
├── shared/                          # Shared Kernel
│   ├── domain/                      # Base DDD building blocks
│   │   ├── AggregateRoot.java       # Base for aggregate roots
│   │   ├── Entity.java              # Base for entities
│   │   ├── ValueObject.java         # Marker for value objects
│   │   ├── Identifier.java          # Base for strongly-typed IDs
│   │   ├── DomainEvent.java         # Base for domain events
│   │   └── DomainException.java     # Base for domain exceptions
│   ├── application/                 # Base application patterns
│   │   ├── Command.java             # CQRS command marker
│   │   ├── Query.java               # CQRS query marker
│   │   └── UseCase.java             # Use case marker
│   ├── infrastructure/              # Shared infrastructure
│   │   └── DomainEventPublisher.java
│   └── web/                         # Shared web components
│       ├── RootController.java      # API entry point
│       └── exception/               # Global exception handling
│
├── catalog/                         # Catalog Bounded Context
│   ├── domain/                      # Domain Layer
│   │   ├── model/                   # Aggregates, Entities, Value Objects
│   │   │   ├── Product.java         # Aggregate Root
│   │   │   ├── ProductId.java       # Strongly-typed ID
│   │   │   └── ProductStatus.java   # DRAFT, ACTIVE, INACTIVE with transitions
│   │   ├── event/                   # Domain Events
│   │   │   ├── ProductCreatedEvent.java
│   │   │   ├── ProductActivatedEvent.java
│   │   │   ├── ProductDeactivatedEvent.java
│   │   │   └── ProductPriceChangedEvent.java
│   │   ├── repository/              # Repository Interfaces (Ports)
│   │   │   └── ProductRepository.java
│   │   └── exception/               # Domain Exceptions
│   │       └── ProductNotFoundException.java
│   │
│   ├── application/                 # Application Layer
│   │   ├── command/                 # Commands (CQRS)
│   │   │   ├── CreateProductCommand.java
│   │   │   ├── UpdateProductCommand.java
│   │   │   ├── UpdatePriceCommand.java
│   │   │   ├── ActivateProductCommand.java
│   │   │   └── DeactivateProductCommand.java
│   │   ├── query/                   # Queries (CQRS)
│   │   │   ├── GetProductQuery.java
│   │   │   └── ListProductsQuery.java
│   │   ├── dto/                     # Data Transfer Objects
│   │   │   └── ProductDto.java
│   │   ├── port/in/                 # Input Ports (Use Cases)
│   │   │   └── ProductUseCase.java
│   │   └── service/                 # Application Services
│   │       └── CatalogApplicationService.java
│   │
│   ├── infrastructure/              # Infrastructure Layer
│   │   └── persistence/
│   │       ├── entity/              # JPA Entities
│   │       │   └── ProductJpaEntity.java
│   │       ├── repository/          # Spring Data Repositories
│   │       │   └── SpringDataProductRepository.java
│   │       ├── mapper/              # Domain ↔ JPA Mappers
│   │       │   └── ProductPersistenceMapper.java
│   │       └── adapter/             # Repository Adapters
│   │           └── ProductRepositoryAdapter.java
│   │
│   └── web/                         # Web/Interface Layer
│       ├── controller/              # REST Controllers
│       │   └── ProductController.java
│       ├── request/                 # Request DTOs
│       │   ├── CreateProductRequest.java
│       │   ├── UpdateProductRequest.java
│       │   └── UpdatePriceRequest.java
│       ├── response/                # Response DTOs (HATEOAS)
│       │   └── ProductResponse.java
│       └── assembler/               # HATEOAS Assemblers
│           └── ProductModelAssembler.java
│
├── order/                           # Order Bounded Context
│   ├── domain/                      # Domain Layer
│   │   ├── model/                   # Aggregates, Entities, Value Objects
│   │   │   ├── Order.java           # Aggregate Root
│   │   │   ├── OrderItem.java       # Entity
│   │   │   ├── OrderId.java         # Strongly-typed ID
│   │   │   ├── OrderNumber.java     # Human-readable order reference (ORD-YYYY-NNNNN)
│   │   │   ├── CustomerInfo.java    # Customer details (name, email, phone)
│   │   │   ├── Money.java           # Value Object
│   │   │   ├── Address.java         # Value Object
│   │   │   └── OrderStatus.java     # DRAFT, PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
│   │   ├── event/                   # Domain Events
│   │   │   ├── OrderCreatedEvent.java
│   │   │   ├── OrderSubmittedEvent.java
│   │   │   ├── OrderStatusChangedEvent.java
│   │   │   ├── OrderCancelledEvent.java
│   │   │   ├── OrderItemAddedEvent.java
│   │   │   └── OrderItemRemovedEvent.java
│   │   ├── repository/              # Repository Interfaces (Ports)
│   │   ├── service/                 # Domain Services
│   │   └── exception/               # Domain Exceptions
│   │
│   ├── application/                 # Application Layer
│   │   ├── command/                 # Commands (CQRS)
│   │   │   ├── CreateOrderCommand.java
│   │   │   ├── SubmitOrderCommand.java
│   │   │   ├── SetCustomerInfoCommand.java
│   │   │   ├── AddOrderItemCommand.java
│   │   │   ├── RemoveOrderItemCommand.java
│   │   │   └── UpdateItemQuantityCommand.java
│   │   ├── query/                   # Queries (CQRS)
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── port/in/                 # Input Ports (Use Cases)
│   │   ├── port/out/                # Output Ports (External Services)
│   │   │   └── ProductPort.java     # Interface to query Catalog
│   │   └── service/                 # Application Services
│   │
│   ├── infrastructure/              # Infrastructure Layer
│   │   ├── persistence/
│   │   │   ├── entity/              # JPA Entities
│   │   │   ├── repository/          # Spring Data Repositories
│   │   │   ├── mapper/              # Domain ↔ JPA Mappers
│   │   │   └── adapter/             # Repository Adapters
│   │   └── event/                   # Event Listeners
│   │
│   └── web/                         # Web/Interface Layer
│       ├── controller/              # REST Controllers
│       ├── request/                 # Request DTOs
│       ├── response/                # Response DTOs (HATEOAS)
│       └── assembler/               # HATEOAS Assemblers
│
├── config/                          # Configuration
│   ├── ApplicationConfig.java
│   ├── JpaConfig.java
│   ├── OpenApiConfig.java
│   └── WebConfig.java
│
└── resources/
    ├── application.properties       # Application configuration
    └── db/migration/                # Flyway migrations
        ├── V1__create_schema.sql    # Database schema
        ├── V2__seed_products.sql    # Product test data
        └── V3__seed_orders.sql      # Order test data
```

## 📦 Key Dependencies

| Dependency        | Purpose                     |
| ----------------- | --------------------------- |
| Spring Boot 3.5.x | Application framework       |
| Spring Data JPA   | Data persistence            |
| Spring HATEOAS    | Hypermedia-driven REST APIs |
| PostgreSQL        | Production database         |
| Flyway            | Database migrations         |
| Lombok            | Boilerplate reduction       |
| SpringDoc OpenAPI | API documentation           |

## 🏛️ Layer Responsibilities

### Domain Layer (`domain/`)

The heart of the application containing business logic.

- **Pure Java** - No framework dependencies
- **Aggregates** - Consistency boundaries
- **Entities** - Objects with identity
- **Value Objects** - Immutable, identity-less objects
- **Domain Events** - Record of something that happened
- **Repository Interfaces** - Persistence abstraction
- **Domain Services** - Cross-aggregate logic

### Application Layer (`application/`)

Orchestrates use cases and coordinates domain objects.

- **Use Cases** - Application-specific business rules
- **Commands** - Intent to change state (CQRS)
- **Queries** - Read-only data requests (CQRS)
- **DTOs** - Data transfer between layers
- **Application Services** - Transaction boundaries

### Infrastructure Layer (`infrastructure/`)

Technical implementations and external system integrations.

- **Repository Adapters** - Implement domain repository interfaces
- **JPA Entities** - Database mapping (separate from domain)
- **Event Handlers** - React to domain events
- **External Services** - Third-party integrations

### Web Layer (`web/`)

HTTP interface and API endpoints.

- **Controllers** - Handle HTTP requests
- **Request DTOs** - Input validation
- **Response DTOs** - HATEOAS representation
- **Assemblers** - Convert DTOs to HATEOAS models

## 🔄 CQRS Pattern

Commands and Queries are separated:

```java
// Command - Changes state
public record CreateOrderCommand(
    String customerId,
    AddressData shippingAddress,
    List<OrderItemData> items
) implements Command {}

// Query - Read only
public record GetOrderQuery(String orderId) implements Query {}
```

## 🔗 HATEOAS Support

Each response includes hypermedia links based on current state:

**Product Response Example:**

```json
{
  "id": "prod-001",
  "name": "Laptop Pro",
  "status": "ACTIVE",
  "price": { "amount": 999.99, "currency": "USD" },
  "_links": {
    "self": { "href": "/api/v1/products/prod-001" },
    "update": { "href": "/api/v1/products/prod-001" },
    "update-price": { "href": "/api/v1/products/prod-001/price" },
    "deactivate": { "href": "/api/v1/products/prod-001/deactivate" },
    "products": { "href": "/api/v1/products" }
  }
}
```

**Order Response Example (DRAFT status):**

```json
{
  "id": "order-123",
  "orderNumber": null,
  "status": "DRAFT",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "_links": {
    "self": { "href": "/api/v1/orders/order-123" },
    "submit": { "href": "/api/v1/orders/order-123/submit" },
    "set-customer-info": { "href": "/api/v1/orders/order-123/customer-info" },
    "add-item": { "href": "/api/v1/orders/order-123/items" },
    "cancel": { "href": "/api/v1/orders/order-123/status" },
    "orders": { "href": "/api/v1/orders" }
  }
}
```

**Order Response Example (PENDING status - after submit):**

```json
{
  "id": "order-123",
  "orderNumber": "ORD-2026-00001",
  "status": "PENDING",
  "_links": {
    "self": { "href": "/api/v1/orders/order-123" },
    "confirm": { "href": "/api/v1/orders/order-123/status" },
    "cancel": { "href": "/api/v1/orders/order-123/status" },
    "orders": { "href": "/api/v1/orders" }
  }
}
```

Links are dynamically generated based on the current status and available transitions.

## 📋 API Endpoints

### Root & Navigation

| Method | Endpoint  | Description                                        |
| ------ | --------- | -------------------------------------------------- |
| GET    | `/api/v1` | API root (entry point with links to all resources) |

### Catalog Context

| Method | Endpoint                           | Description                                |
| ------ | ---------------------------------- | ------------------------------------------ |
| GET    | `/api/v1/products`                 | List all products                          |
| POST   | `/api/v1/products`                 | Create new product (DRAFT status)          |
| GET    | `/api/v1/products/{id}`            | Get product by ID                          |
| PUT    | `/api/v1/products/{id}`            | Update product details                     |
| PUT    | `/api/v1/products/{id}/price`      | Update product price                       |
| POST   | `/api/v1/products/{id}/activate`   | Activate product (DRAFT/INACTIVE → ACTIVE) |
| POST   | `/api/v1/products/{id}/deactivate` | Deactivate product (ACTIVE → INACTIVE)     |

### Order Context

| Method | Endpoint                                | Description                                           |
| ------ | --------------------------------------- | ----------------------------------------------------- |
| GET    | `/api/v1/orders`                        | List all orders                                       |
| POST   | `/api/v1/orders`                        | Create new order (DRAFT status)                       |
| GET    | `/api/v1/orders/{id}`                   | Get order by ID                                       |
| GET    | `/api/v1/orders?customerId={id}`        | Orders by customer                                    |
| GET    | `/api/v1/orders?status={status}`        | Orders by status                                      |
| PUT    | `/api/v1/orders/{id}/customer-info`     | Set customer information                              |
| POST   | `/api/v1/orders/{id}/submit`            | Submit order (DRAFT → PENDING, generates OrderNumber) |
| PATCH  | `/api/v1/orders/{id}/status`            | Update order status                                   |
| POST   | `/api/v1/orders/{id}/items`             | Add item to order (DRAFT only)                        |
| PUT    | `/api/v1/orders/{id}/items/{productId}` | Update item quantity (DRAFT only)                     |
| DELETE | `/api/v1/orders/{id}/items/{productId}` | Remove item (DRAFT only)                              |

## 📦 Bounded Contexts

### Catalog Context

Manages the product catalog lifecycle:

**Product Status Lifecycle:**

```
     ┌─────────────────────────────────────┐
     │                                     │
     ▼                                     │
  ┌──────┐   activate    ┌────────┐   deactivate   ┌──────────┐
  │ DRAFT├──────────────►│ ACTIVE │◄───────────────┤ INACTIVE │
  └──────┘               └────┬───┘                └──────────┘
                              │                          ▲
                              │      deactivate          │
                              └──────────────────────────┘
```

- **DRAFT**: Initial state, product not visible to customers
- **ACTIVE**: Product is available for ordering
- **INACTIVE**: Product is temporarily unavailable

### Order Context

Manages order lifecycle from creation to delivery:

**Order Status Lifecycle:**

```
  ┌───────┐   submit    ┌─────────┐   confirm   ┌───────────┐   ship   ┌─────────┐   deliver   ┌───────────┐
  │ DRAFT ├────────────►│ PENDING ├────────────►│ CONFIRMED ├─────────►│ SHIPPED ├────────────►│ DELIVERED │
  └───┬───┘             └────┬────┘             └─────┬─────┘          └────┬────┘             └───────────┘
      │                      │                        │                     │
      │     cancel           │      cancel            │     cancel          │
      └──────────────────────┴────────────────────────┴─────────────────────┘
                                        │
                                        ▼
                                  ┌───────────┐
                                  │ CANCELLED │
                                  └───────────┘
```

- **DRAFT**: Cart mode - items can be added/removed/modified
- **PENDING**: Order submitted, awaiting confirmation (OrderNumber assigned)
- **CONFIRMED**: Order confirmed, preparing for shipment
- **SHIPPED**: Order in transit
- **DELIVERED**: Order delivered to customer
- **CANCELLED**: Order cancelled (from DRAFT, PENDING, CONFIRMED, or SHIPPED)

**OrderNumber Format:** `ORD-YYYY-NNNNN` (e.g., `ORD-2026-00001`)

## 🔄 Context Integration

The Order context integrates with Catalog to validate products:

```
┌─────────────────────┐         ┌─────────────────────┐
│   Order Context     │         │   Catalog Context   │
│                     │         │                     │
│  OrderApplication   │────────►│  ProductUseCase     │
│       Service       │ queries │                     │
│                     │         │  - Get product      │
│  - Validates active │         │  - Check status     │
│  - Creates snapshot │         │                     │
└─────────────────────┘         └─────────────────────┘
```

- Orders reference products by ProductId
- When adding items, Order validates that products are ACTIVE
- Order stores a product snapshot (name, price at time of order)

## 🎯 Key Design Decisions

### 1. Separate Persistence Model

JPA entities are separate from domain entities to avoid polluting the domain with ORM concerns.

### 2. Strongly-Typed IDs

Each entity has its own ID type (`OrderId`, `CustomerId`) preventing ID mix-ups.

### 3. Rich Domain Model

Business logic lives in the domain, not in services. The Order aggregate enforces its own invariants.

### 4. Domain Events

State changes trigger events for loose coupling and eventual consistency.

### 5. Hexagonal Architecture

The domain defines ports (interfaces), infrastructure provides adapters (implementations).

### 6. Product Snapshots in Orders

When adding items to an order, a snapshot of the product (name, price) is stored. This ensures order history remains accurate even if product details change later.

### 7. OrderNumber Generation

Human-readable order numbers (ORD-YYYY-NNNNN) are generated upon order submission, providing a customer-friendly reference distinct from the internal OrderId.

### 8. Context Boundaries

Catalog and Order are separate bounded contexts with clear interfaces. Order queries Catalog through defined ports, never accessing Catalog internals directly.

## 🗄️ Database & Flyway Migrations

### Database Configuration

The application uses **PostgreSQL** as the primary database with **Flyway** for schema migrations and test data seeding.

**Connection Settings** (configured in `application.properties`):

| Property | Value                                          |
| -------- | ---------------------------------------------- |
| URL      | `jdbc:postgresql://localhost:5432/ddd-starter` |
| Driver   | `org.postgresql.Driver`                        |
| Username | `postgres`                                     |
| Password | `admin`                                        |
| Dialect  | `PostgreSQLDialect`                            |

### Flyway Migration Files

Migration files are located in `src/main/resources/db/migration/`:

```
db/migration/
├── V1__create_schema.sql     # Database schema (tables, indexes, constraints)
├── V2__seed_products.sql     # Product catalog test data (46 products)
└── V3__seed_orders.sql       # Order test data (20 orders)
```

#### V1: Schema Creation

Creates the core tables:

| Table         | Description                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| `products`    | Product catalog (id, name, description, price, currency, sku, status)           |
| `orders`      | Order headers (id, customer_id, order_number, status, shipping address, etc.)   |
| `order_items` | Order line items (id, order_id, product_id, product_name, unit_price, quantity) |

Includes indexes, foreign keys, and CHECK constraints for data integrity.

#### V2: Product Seed Data

Seeds **46 realistic products** across categories:

| Category                | Products | Examples                                      |
| ----------------------- | -------- | --------------------------------------------- |
| Electronics - Laptops   | 5        | MacBook Pro, Dell XPS, ThinkPad X1            |
| Electronics - Desktops  | 3        | Mac Studio, Custom Gaming PC                  |
| Electronics - Monitors  | 4        | LG UltraFine, Samsung Odyssey G9              |
| Electronics - Keyboards | 4        | Keychron Q1, HHKB Professional                |
| Electronics - Mice      | 3        | Logitech MX Master 3S, Razer DeathAdder       |
| Electronics - Audio     | 4        | Sony WH-1000XM5, Shure SM7dB                  |
| Home & Office           | 10       | Standing desks, ergonomic chairs, accessories |
| Networking              | 4        | Ubiquiti, routers, NAS                        |
| Software                | 3        | JetBrains, Adobe CC, 1Password                |

Product statuses: 41 ACTIVE, 3 DRAFT, 2 INACTIVE

#### V3: Order Seed Data

Seeds **20 realistic orders** with various statuses:

| Status     | Count | Description                     |
| ---------- | ----- | ------------------------------- |
| DELIVERED  | 4     | Completed historical orders     |
| SHIPPED    | 3     | Orders in transit               |
| PROCESSING | 2     | Orders being prepared           |
| CONFIRMED  | 2     | Awaiting processing             |
| PENDING    | 3     | Awaiting confirmation           |
| DRAFT      | 2     | Incomplete carts                |
| CANCELLED  | 3     | Cancelled orders (with reasons) |

Includes realistic customer data, US addresses, and varying order sizes.

### Running Migrations

Flyway runs automatically on application startup. To reset the database:

```bash
# Using Flyway Maven plugin (clean requires flyway.cleanDisabled=false)
./mvnw flyway:clean flyway:migrate

# Or simply restart the application with a fresh database
```

### Verifying Data

```sql
-- Connect to PostgreSQL
psql -U postgres -d ddd-starter

-- Check record counts
SELECT COUNT(*) FROM products;      -- 46 products
SELECT COUNT(*) FROM orders;        -- 20 orders
SELECT COUNT(*) FROM order_items;   -- 45 order items

-- Check Flyway migration history
SELECT version, description, success FROM flyway_schema_history;
```

### Adding New Migrations

1. Create a new file: `V{N}__{description}.sql` (e.g., `V4__add_customer_table.sql`)
2. Use incremental version numbers
3. Migrations are immutable - never modify existing migration files
4. Test migrations locally before committing

## 🚀 Running the Application

### Prerequisites

1. **PostgreSQL** running on port `5432`
2. Database `ddd-starter` created
3. User `postgres` with password `admin` configured

```bash
# Create database (if not exists)
psql -U postgres -c "CREATE DATABASE \"ddd-starter\";"
```

### Start the Application

```bash
cd ddd
./mvnw spring-boot:run
```

Access:

- API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/api/v1/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/v1/api-docs
- OpenAPI YAML: http://localhost:8080/api/v1/api-docs.yaml

## 📚 API Documentation (OpenAPI/Swagger)

The API is fully documented using OpenAPI 3.0 specification with Swagger UI for interactive exploration.

### Accessing Documentation

| URL                       | Description                  |
| ------------------------- | ---------------------------- |
| `/api/v1/swagger-ui.html` | Interactive Swagger UI       |
| `/api/v1/api-docs`        | OpenAPI specification (JSON) |
| `/api/v1/api-docs.yaml`   | OpenAPI specification (YAML) |

### API Groups

The documentation is organized into groups for easier navigation:

| Group     | Display Name         | Endpoints             |
| --------- | -------------------- | --------------------- |
| `all`     | Full API             | `/api/v1/**`          |
| `catalog` | Product Catalog API  | `/api/v1/products/**` |
| `orders`  | Order Management API | `/api/v1/orders/**`   |

### Documentation Features

- **Interactive Try-Out**: Test endpoints directly from the Swagger UI
- **Request/Response Examples**: All schemas include realistic examples
- **Error Responses**: RFC 7807 Problem Details format documented
- **HATEOAS Links**: Response models include hypermedia link documentation
- **Status Code Documentation**: Each endpoint documents all possible response codes

### OpenAPI Annotations Used

```java
// Controller-level tag for grouping
@Tag(name = "Product Catalog", description = "Product management operations")

// Operation documentation
@Operation(
    summary = "Create a new product",
    description = "Creates a new product in DRAFT status"
)

// Response documentation
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "Product created"),
    @ApiResponse(responseCode = "400", description = "Invalid request")
})

// Parameter documentation
@Parameter(description = "Unique product identifier", example = "prod-123")

// Schema documentation for DTOs
@Schema(description = "Product name", example = "Wireless Headphones")
```

### Configuration

OpenAPI configuration is managed in:

- `config/OpenApiConfig.java` - API metadata, tags, and groupings
- `application.properties` - Swagger UI and path configuration

Key properties:

```properties
# API documentation paths
springdoc.api-docs.path=/api/v1/api-docs
springdoc.swagger-ui.path=/api/v1/swagger-ui.html

# Swagger UI settings
springdoc.swagger-ui.operations-sorter=method
springdoc.swagger-ui.tags-sorter=alpha
springdoc.swagger-ui.doc-expansion=list
springdoc.swagger-ui.display-request-duration=true
```

## 📝 Examples

### Creating a Product

```bash
# Create a new product (starts in DRAFT status)
curl -X POST http://localhost:8080/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro",
    "description": "High-performance laptop",
    "price": 999.99,
    "currency": "USD",
    "sku": "LAP-PRO-001"
  }'

# Activate the product to make it available for orders
curl -X POST http://localhost:8080/api/v1/products/prod-001/activate
```

### Creating and Submitting an Order

```bash
# 1. Create a draft order
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-001",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'

# 2. Set customer information
curl -X PUT http://localhost:8080/api/v1/orders/order-123/customer-info \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'

# 3. Add items to the order (product must be ACTIVE)
curl -X POST http://localhost:8080/api/v1/orders/order-123/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-001",
    "quantity": 2
  }'

# 4. Submit the order (DRAFT → PENDING, OrderNumber assigned)
curl -X POST http://localhost:8080/api/v1/orders/order-123/submit

# 5. Confirm the order (PENDING → CONFIRMED)
curl -X PATCH http://localhost:8080/api/v1/orders/order-123/status \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'
```

## 🔧 Adding a New Bounded Context

1. Create package under `tony.ddd/{context}/`
2. Add `domain/`, `application/`, `infrastructure/`, `web/` subpackages
3. Define aggregate roots, entities, and value objects
4. Create repository interfaces in domain
5. Implement repository adapters in infrastructure
6. Create use cases and application services
7. Add REST controllers with HATEOAS support
