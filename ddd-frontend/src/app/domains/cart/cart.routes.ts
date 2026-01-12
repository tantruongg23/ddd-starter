import { Routes } from '@angular/router';

/**
 * Cart Domain Routes
 */
export const cartRoutes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./presentation/pages/cart/cart.component')
        .then(m => m.CartPageComponent),
    title: 'Shopping Cart | DDD E-Commerce'
  }
];
