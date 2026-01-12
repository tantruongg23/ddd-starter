import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthState } from '@domains/customer/application/state/auth.state';
import { AuthService } from '@domains/customer/application/services/auth.service';
import { MiniCartComponent } from '@domains/cart/presentation/components/mini-cart/mini-cart.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';

/**
 * Header Component
 * 
 * Main application header with navigation, search, and user menu.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    MenuModule,
    MiniCartComponent,
    SearchInputComponent
  ],
  template: `
    <header class="app-header">
      <div class="header-container">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">DDD<span class="logo-accent">Shop</span></span>
        </a>
        
        <!-- Navigation -->
        <nav class="main-nav">
          <a 
            routerLink="/products" 
            routerLinkActive="active"
            class="nav-link"
          >
            Products
          </a>
          <a 
            routerLink="/products/category/electronics" 
            routerLinkActive="active"
            class="nav-link"
          >
            Electronics
          </a>
          <a 
            routerLink="/products/category/clothing" 
            routerLinkActive="active"
            class="nav-link"
          >
            Clothing
          </a>
          <a 
            routerLink="/products/category/home" 
            routerLinkActive="active"
            class="nav-link"
          >
            Home & Garden
          </a>
        </nav>
        
        <!-- Search -->
        <div class="header-search">
          <app-search-input 
            placeholder="Search products..."
            (search)="onSearch($event)"
          />
        </div>
        
        <!-- Actions -->
        <div class="header-actions">
          <!-- Cart -->
          <app-mini-cart />
          
          <!-- User Menu -->
          @if (isAuthenticated()) {
            <div class="user-menu">
              <button 
                type="button" 
                class="user-btn"
                (click)="menu.toggle($event)"
              >
                <span class="user-avatar">{{ initials() }}</span>
              </button>
              <p-menu #menu [model]="userMenuItems" [popup]="true" />
            </div>
          } @else {
            <a routerLink="/auth/login" class="login-btn">
              <i class="pi pi-user"></i>
              <span>Sign In</span>
            </a>
          }
        </div>
        
        <!-- Mobile Menu Toggle -->
        <button 
          type="button" 
          class="mobile-toggle"
          (click)="toggleMobileMenu()"
          aria-label="Toggle menu"
        >
          <i class="pi pi-bars"></i>
        </button>
      </div>
      
      <!-- Mobile Navigation -->
      @if (isMobileMenuOpen) {
        <nav class="mobile-nav animate-slide-up">
          <a routerLink="/products" class="mobile-nav-link" (click)="closeMobileMenu()">Products</a>
          <a routerLink="/products/category/electronics" class="mobile-nav-link" (click)="closeMobileMenu()">Electronics</a>
          <a routerLink="/products/category/clothing" class="mobile-nav-link" (click)="closeMobileMenu()">Clothing</a>
          <a routerLink="/cart" class="mobile-nav-link" (click)="closeMobileMenu()">Cart</a>
          @if (isAuthenticated()) {
            <a routerLink="/auth/profile" class="mobile-nav-link" (click)="closeMobileMenu()">Profile</a>
            <button class="mobile-nav-link logout-link" (click)="logout()">Sign Out</button>
          } @else {
            <a routerLink="/auth/login" class="mobile-nav-link" (click)="closeMobileMenu()">Sign In</a>
          }
        </nav>
      }
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--color-primary);
      box-shadow: var(--shadow-md);
    }

    .header-container {
      display: flex;
      align-items: center;
      gap: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
    }

    /* Logo */
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      flex-shrink: 0;
    }

    .logo-icon {
      font-size: 1.75rem;
    }

    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-inverse);
    }

    .logo-accent {
      color: var(--color-accent);
    }

    /* Navigation */
    .main-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link {
      padding: 0.5rem 1rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--color-text-inverse);
      background: rgba(255, 255, 255, 0.1);
    }

    /* Search */
    .header-search {
      flex: 1;
      max-width: 500px;
    }

    :host ::ng-deep .header-search .search-input {
      background: rgba(255, 255, 255, 0.1);
      border-color: transparent;
      color: var(--color-text-inverse);
    }

    :host ::ng-deep .header-search .search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    :host ::ng-deep .header-search .search-input:focus {
      background: var(--color-surface);
      border-color: var(--color-accent);
      color: var(--color-text-primary);
    }

    :host ::ng-deep .header-search .search-icon {
      color: rgba(255, 255, 255, 0.6);
    }

    /* Actions */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      border: 2px solid var(--color-accent);
      background: transparent;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .user-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .user-avatar {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-inverse);
    }

    .login-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--color-accent);
      color: var(--color-primary);
      text-decoration: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .login-btn:hover {
      background: var(--color-accent-dark);
    }

    /* Mobile */
    .mobile-toggle {
      display: none;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-inverse);
      cursor: pointer;
    }

    .mobile-toggle i {
      font-size: 1.25rem;
    }

    .mobile-nav {
      display: none;
      flex-direction: column;
      padding: 1rem;
      background: var(--color-primary-light);
    }

    .mobile-nav-link {
      display: block;
      padding: 0.75rem 1rem;
      color: var(--color-text-inverse);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
    }

    .mobile-nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .logout-link {
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      font-size: inherit;
      cursor: pointer;
    }

    @media (max-width: 1024px) {
      .main-nav {
        display: none;
      }

      .header-search {
        display: none;
      }

      .mobile-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mobile-nav {
        display: flex;
      }
    }
  `]
})
export class HeaderComponent {
  private readonly authState = inject(AuthState);
  private readonly authService = inject(AuthService);
  
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly displayName = this.authState.displayName;
  readonly initials = this.authState.initials;
  
  isMobileMenuOpen = false;
  
  userMenuItems: MenuItem[] = [
    { label: 'My Profile', icon: 'pi pi-user', routerLink: '/auth/profile' },
    { label: 'Orders', icon: 'pi pi-shopping-bag', routerLink: '/orders' },
    { separator: true },
    { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];
  
  onSearch(term: string): void {
    if (term) {
      window.location.href = `/products?search=${encodeURIComponent(term)}`;
    }
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
  
  logout(): void {
    this.authService.logout('/');
    this.closeMobileMenu();
  }
}
