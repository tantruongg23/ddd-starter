import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LocalStorageService } from '../infrastructure/storage/local-storage.service';
import { environment } from '@env';

/**
 * Authentication Guard
 * 
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const storageService = inject(LocalStorageService);
  
  const token = storageService.get<string>(environment.auth.tokenKey);
  
  if (token) {
    // User is authenticated
    return true;
  }
  
  // User is not authenticated, redirect to login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};

/**
 * Guest Guard
 * 
 * Protects routes that should only be accessible to non-authenticated users.
 * Redirects to home if user is already authenticated.
 */
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storageService = inject(LocalStorageService);
  
  const token = storageService.get<string>(environment.auth.tokenKey);
  
  if (!token) {
    // User is not authenticated, allow access
    return true;
  }
  
  // User is authenticated, redirect to home
  router.navigate(['/']);
  return false;
};

/**
 * Role Guard Factory
 * 
 * Creates a guard that checks if the user has the required role(s).
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const storageService = inject(LocalStorageService);
    
    // Get user data from storage
    const userData = storageService.get<{ roles: string[] }>('user_data');
    
    if (!userData) {
      router.navigate(['/auth/login']);
      return false;
    }
    
    // Check if user has any of the allowed roles
    const hasRole = allowedRoles.some(role => userData.roles.includes(role));
    
    if (hasRole) {
      return true;
    }
    
    // User doesn't have required role, redirect to unauthorized page
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * Checkout Guard
 * 
 * Ensures user is authenticated and has items in cart before checkout.
 */
export const checkoutGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storageService = inject(LocalStorageService);
  
  const token = storageService.get<string>(environment.auth.tokenKey);
  
  if (!token) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/checkout' }
    });
    return false;
  }
  
  // Check if cart has items
  const cart = storageService.get<{ items: unknown[] }>('cart');
  
  if (!cart || !cart.items || cart.items.length === 0) {
    router.navigate(['/cart']);
    return false;
  }
  
  return true;
};
