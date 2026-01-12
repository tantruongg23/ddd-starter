# DDD E-Commerce Frontend

A scalable, well-structured Angular 20 frontend application built with **Domain-Driven Design (DDD)** principles for an e-commerce system.

## 🚀 Tech Stack

- **Angular 20** - Latest Angular with signal-based reactivity
- **PrimeNG** - Rich UI component library
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming

## 📁 Project Architecture

This project follows **Domain-Driven Design** patterns with a clear separation of concerns:

```
src/app/
├── core/                    # Core module (singleton services)
│   ├── domain/              # Base entities, value objects, Result pattern
│   ├── infrastructure/      # API services, interceptors, storage
│   ├── guards/              # Route guards (auth, role-based)
│   └── utils/               # Signal utilities, validators
│
├── shared/                  # Shared module (reusable components)
│   ├── components/          # UI components (loading, empty-state, etc.)
│   ├── pipes/               # Custom pipes (currency, truncate, time-ago)
│   └── directives/          # Custom directives (click-outside, lazy-image)
│
├── domains/                 # Bounded Contexts
│   ├── catalog/             # Product catalog domain
│   │   ├── domain/          # Models (Product, Category)
│   │   ├── application/     # State management, services
│   │   └── presentation/    # Components, pages
│   │
│   ├── cart/                # Shopping cart domain
│   │   ├── domain/          # Models (Cart, CartItem)
│   │   ├── application/     # Cart state, services
│   │   └── presentation/    # Cart components, pages
│   │
│   └── customer/            # Customer/Auth domain
│       ├── domain/          # Models (User, Credentials)
│       ├── application/     # Auth state, services
│       └── presentation/    # Login, Register, Profile pages
│
├── layout/                  # Layout components
│   ├── header/              # Main navigation header
│   ├── footer/              # Site footer
│   └── main-layout/         # Main app layout wrapper
│
└── pages/                   # Standalone pages
    ├── home/                # Home page
    └── not-found/           # 404 page
```

## 🏗️ Key Design Patterns

### Result Pattern

All service operations return a `Result<T, DomainError>` type for explicit error handling:

```typescript
const result = await authService.login(email, password);
if (result.isSuccess) {
  console.log("User:", result.value);
} else {
  console.error("Error:", result.error.message);
}
```

### Signal-Based State Management

Each domain has its own state management using Angular signals:

```typescript
// Reading state
const products = catalogState.products();
const isLoading = catalogState.productsLoading();

// Computed state
const filteredProducts = catalogState.filteredProducts();
```

### Clean Architecture Layers

- **Domain Layer**: Pure business logic, models, value objects
- **Application Layer**: Use cases, state management, orchestration
- **Presentation Layer**: Components, pages, UI logic
- **Infrastructure Layer**: API clients, storage, external services

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200/`

## 📜 Available Scripts

| Command         | Description                 |
| --------------- | --------------------------- |
| `npm start`     | Start development server    |
| `npm run build` | Build for production        |
| `npm run watch` | Build and watch for changes |
| `npm test`      | Run unit tests              |

## 🛣️ Routing Structure

| Route              | Description              |
| ------------------ | ------------------------ |
| `/`                | Home page                |
| `/products`        | Product listing          |
| `/products/:id`    | Product detail           |
| `/cart`            | Shopping cart            |
| `/auth/login`      | Login page               |
| `/auth/register`   | Registration page        |
| `/account/profile` | User profile (protected) |

## 🔧 Path Aliases

TypeScript path aliases for cleaner imports:

```typescript
import { ApiService } from "@core/infrastructure/api/api.service";
import { Product } from "@catalog/domain/models/product.model";
import { CartService } from "@cart/application/services/cart.service";
import { AuthService } from "@customer/application/services/auth.service";
import { LoadingSpinnerComponent } from "@shared/components/loading-spinner/loading-spinner.component";
```

## 🌐 Environment Configuration

Environment files are located in `src/environments/`:

- `environment.ts` - Development configuration
- `environment.prod.ts` - Production configuration

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/api",
  appName: "DDD E-Commerce",
  version: "1.0.0",
};
```

## 🎨 Theming

The application uses CSS custom properties for theming. Key variables are defined in `styles.css`:

- Colors (primary, accent, surface, text)
- Typography (font families, sizes)
- Spacing and border radius
- Shadows and transitions
- Animations

## 📦 Domain Modules

### Catalog Domain

- Product browsing with filtering and sorting
- Category navigation
- Product detail views
- Search functionality

### Cart Domain

- Add/remove items
- Quantity management
- Coupon validation
- Cart persistence

### Customer Domain

- User authentication (login/register)
- Password management
- Profile management
- Session handling

## 🔒 Authentication

The app includes:

- JWT-based authentication
- HTTP interceptor for token injection
- Auth guards for protected routes
- Automatic token refresh

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test -- --code-coverage
```

## 📝 Code Scaffolding

Generate new components within a domain:

```bash
# Generate a component in catalog domain
ng generate component domains/catalog/presentation/components/my-component

# Generate a service in cart domain
ng generate service domains/cart/application/services/my-service
```

## 🏭 Building for Production

```bash
npm run build
```

Build artifacts will be stored in `dist/ddd-frontend/`. The production build includes:

- Tree shaking
- Code splitting (lazy loading)
- Minification
- AOT compilation

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [PrimeNG Components](https://primeng.org)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Domain-Driven Design Reference](https://www.domainlanguage.com/ddd/)

## 📄 License

This project is part of the DDD Starter Kit.
