import { Routes } from '@angular/router';

/**
 * Catalog Domain Routes
 * 
 * Lazy-loaded routes for the catalog bounded context.
 */
export const catalogRoutes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./presentation/pages/product-list/product-list.component')
        .then(m => m.ProductListComponent),
    title: 'Products | DDD E-Commerce'
  },
  {
    path: 'category/:slug',
    loadComponent: () => 
      import('./presentation/pages/product-list/product-list.component')
        .then(m => m.ProductListComponent),
    title: 'Category | DDD E-Commerce'
  },
  {
    path: ':id',
    loadComponent: () => 
      import('./presentation/pages/product-detail/product-detail.component')
        .then(m => m.ProductDetailComponent),
    title: 'Product Details | DDD E-Commerce'
  }
];
