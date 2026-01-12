import { Routes } from '@angular/router';

/**
 * Application Routes
 * 
 * Main routing configuration with lazy-loaded domain modules.
 * Each bounded context has its own routes for better code splitting.
 */
export const routes: Routes = [
  // Main layout routes
  {
    path: '',
    loadComponent: () => 
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      // Home page
      {
        path: '',
        loadComponent: () => 
          import('./pages/home/home.component')
            .then(m => m.HomeComponent),
        title: 'Home | DDD E-Commerce'
      },
      
      // Catalog domain
      {
        path: 'products',
        loadChildren: () => 
          import('./domains/catalog/catalog.routes')
            .then(m => m.catalogRoutes)
      },
      
      // Cart domain
      {
        path: 'cart',
        loadChildren: () => 
          import('./domains/cart/cart.routes')
            .then(m => m.cartRoutes)
      },
      
      // Customer domain - Profile (requires auth)
      {
        path: 'account',
        loadChildren: () => 
          import('./domains/customer/customer.routes')
            .then(m => m.customerRoutes)
      }
    ]
  },
  
  // Auth routes (without main layout)
  {
    path: 'auth',
    loadChildren: () => 
      import('./domains/customer/customer.routes')
        .then(m => m.customerRoutes)
  },
  
  // Not Found
  {
    path: '**',
    loadComponent: () => 
      import('./pages/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
    title: 'Page Not Found | DDD E-Commerce'
  }
];
