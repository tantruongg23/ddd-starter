import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

/**
 * Customer/Auth Domain Routes
 */
export const customerRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => 
      import('./presentation/pages/login/login.component')
        .then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Sign In | DDD E-Commerce'
  },
  {
    path: 'register',
    loadComponent: () => 
      import('./presentation/pages/register/register.component')
        .then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Create Account | DDD E-Commerce'
  },
  {
    path: 'profile',
    loadComponent: () => 
      import('./presentation/pages/profile/profile.component')
        .then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'My Profile | DDD E-Commerce'
  }
];
