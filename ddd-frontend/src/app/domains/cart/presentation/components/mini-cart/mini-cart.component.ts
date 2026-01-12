import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CartState } from '../../../application/state/cart.state';
import { CartService } from '../../../application/services/cart.service';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';

/**
 * Mini Cart Component
 * 
 * Dropdown cart preview shown in the header.
 */
@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, ClickOutsideDirective],
  template: `
    <div class="mini-cart-container">
      <!-- Cart Toggle Button -->
      <button 
        type="button" 
        class="cart-toggle"
        (click)="toggleCart()"
        [attr.aria-expanded]="isOpen()"
        aria-label="Shopping cart"
      >
        <i class="pi pi-shopping-cart"></i>
        @if (badgeText()) {
          <span class="cart-badge">{{ badgeText() }}</span>
        }
      </button>
      
      <!-- Mini Cart Dropdown -->
      @if (isOpen()) {
        <div 
          class="mini-cart-dropdown animate-slide-up"
          appClickOutside
          (clickOutside)="closeCart()"
        >
          <div class="mini-cart-header">
            <h4 class="mini-cart-title">Shopping Cart</h4>
            <span class="item-count">{{ totalItems() }} items</span>
          </div>
          
          @if (isEmpty()) {
            <div class="empty-cart">
              <i class="pi pi-shopping-cart empty-icon"></i>
              <p>Your cart is empty</p>
              <a routerLink="/products" class="shop-link" (click)="closeCart()">
                Start Shopping
              </a>
            </div>
          } @else {
            <ul class="cart-items">
              @for (item of items().slice(0, 3); track item.itemKey) {
                <li class="cart-item">
                  <img [src]="item.productImage" [alt]="item.productName" class="item-image" />
                  <div class="item-details">
                    <h5 class="item-name">{{ item.productName }}</h5>
                    @if (item.getVariantDisplay()) {
                      <span class="item-variants">{{ item.getVariantDisplay() }}</span>
                    }
                    <div class="item-meta">
                      <span class="item-qty">Qty: {{ item.quantity.value }}</span>
                      <span class="item-price">{{ item.subtotal.format() }}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    class="remove-btn"
                    (click)="removeItem(item.itemKey)"
                    aria-label="Remove item"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </li>
              }
              
              @if (items().length > 3) {
                <li class="more-items">
                  +{{ items().length - 3 }} more items
                </li>
              }
            </ul>
            
            <div class="cart-footer">
              <div class="cart-subtotal">
                <span>Subtotal:</span>
                <span class="subtotal-amount">{{ formattedSubtotal() }}</span>
              </div>
              
              <div class="cart-actions">
                <p-button 
                  label="View Cart" 
                  routerLink="/cart"
                  severity="secondary"
                  [outlined]="true"
                  styleClass="view-cart-btn"
                  (onClick)="closeCart()"
                />
                <p-button 
                  label="Checkout" 
                  routerLink="/checkout"
                  styleClass="checkout-btn"
                  (onClick)="closeCart()"
                />
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .mini-cart-container {
      position: relative;
    }

    .cart-toggle {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--color-text-inverse);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .cart-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .cart-toggle i {
      font-size: 1.25rem;
    }

    .cart-badge {
      position: absolute;
      top: 0;
      right: 0;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 0.375rem;
      border-radius: 9999px;
      background: var(--color-accent);
      color: var(--color-primary);
      font-size: 0.6875rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mini-cart-dropdown {
      position: absolute;
      top: calc(100% + 0.75rem);
      right: 0;
      width: 360px;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      z-index: 1000;
    }

    .mini-cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--color-border);
    }

    .mini-cart-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: var(--color-text-primary);
    }

    .item-count {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .empty-cart {
      padding: 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 2.5rem;
      color: var(--color-border-dark);
      margin-bottom: 0.75rem;
    }

    .empty-cart p {
      color: var(--color-text-secondary);
      margin: 0 0 1rem;
    }

    .shop-link {
      color: var(--color-accent);
      font-weight: 500;
    }

    .cart-items {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 280px;
      overflow-y: auto;
    }

    .cart-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--color-border);
    }

    .item-image {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }

    .item-details {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0 0 0.25rem;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-variants {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      display: block;
      margin-bottom: 0.25rem;
    }

    .item-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
    }

    .item-qty {
      color: var(--color-text-secondary);
    }

    .item-price {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .remove-btn {
      width: 1.5rem;
      height: 1.5rem;
      border: none;
      border-radius: 50%;
      background: var(--color-surface-dark);
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .remove-btn:hover {
      background: var(--color-danger);
      color: white;
    }

    .remove-btn i {
      font-size: 0.625rem;
    }

    .more-items {
      padding: 0.75rem 1.25rem;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.8125rem;
      border-bottom: 1px solid var(--color-border);
    }

    .cart-footer {
      padding: 1rem 1.25rem;
      background: var(--color-surface-alt);
    }

    .cart-subtotal {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 0.9375rem;
    }

    .subtotal-amount {
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .cart-actions {
      display: flex;
      gap: 0.5rem;
    }

    :host ::ng-deep .view-cart-btn,
    :host ::ng-deep .checkout-btn {
      flex: 1;
    }

    :host ::ng-deep .checkout-btn {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-primary);
    }

    :host ::ng-deep .checkout-btn:hover {
      background: var(--color-accent-dark);
      border-color: var(--color-accent-dark);
    }
  `]
})
export class MiniCartComponent {
  private readonly cartState = inject(CartState);
  private readonly cartService = inject(CartService);
  
  // State selectors
  readonly isOpen = this.cartState.isMiniCartOpen;
  readonly items = this.cartState.items;
  readonly totalItems = this.cartState.totalItems;
  readonly isEmpty = this.cartState.isEmpty;
  readonly badgeText = this.cartState.badgeText;
  readonly formattedSubtotal = this.cartState.formattedSubtotal;
  
  toggleCart(): void {
    this.cartService.toggleMiniCart();
  }
  
  closeCart(): void {
    this.cartService.closeMiniCart();
  }
  
  removeItem(itemKey: string): void {
    this.cartService.removeItem(itemKey);
  }
}
