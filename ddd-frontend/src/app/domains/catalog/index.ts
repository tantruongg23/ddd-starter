/**
 * Catalog Domain Public API
 * 
 * This bounded context handles product catalog functionality.
 * Exports all public APIs for the catalog domain.
 */

// Domain Models
export * from './domain/models/product.model';
export * from './domain/models/category.model';

// Domain Services
export * from './domain/services/product-filter.service';

// Application Services
export * from './application/state/catalog.state';
export * from './application/services/catalog.service';

// Presentation Components
export * from './presentation/pages/product-list/product-list.component';
export * from './presentation/pages/product-detail/product-detail.component';
export * from './presentation/components/product-card/product-card.component';
export * from './presentation/components/product-filters/product-filters.component';

// Routes
export * from './catalog.routes';
