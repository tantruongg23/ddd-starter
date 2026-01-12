import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CartState } from '../../../application/state/cart.state';
import { CartService } from '../../../application/services/cart.service';
import { CartSummaryComponent } from '../../components/cart-summary/cart-summary.component';
import { QuantitySelectorComponent } from '@shared/components/quantity-selector/quantity-selector.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { CartItem } from '../../../domain/models/cart-item.model';

/**
 * Cart Page Component
 * 
 * Full shopping cart page with item management.
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TableModule,
    CartSummaryComponent,
    QuantitySelectorComponent,
    EmptyStateComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="cart-page">
      <div class="container">
        <header class="page-header animate-slide-up">
          <h1 class="page-title">Shopping Cart</h1>
          @if (!isEmpty()) {
            <button 
              type="button" 
              class="clear-cart-btn"
              (click)="showClearConfirm()"
            >
              <i class="pi pi-trash"></i>
              Clear Cart
            </button>
          }
        </header>
        
        @if (isEmpty()) {
          <app-empty-state
            icon="pi-shopping-cart"
            title="Your cart is empty"
            description="Looks like you haven't added any items to your cart yet."
            actionLabel="Start Shopping"
            actionIcon="pi pi-arrow-right"
            (actionClick)="goToProducts()"
          />
        } @else {
          <div class="cart-layout">
            <!-- Cart Items -->
            <section class="cart-items-section animate-slide-up stagger-1">
              <div class="cart-items-container">
                @for (item of items(); track item.itemKey; let i = $index) {
                  <article class="cart-item" [class]="'stagger-' + ((i % 5) + 1)">
                    <!-- Product Image -->
                    <a [routerLink]="['/products', item.productId]" class="item-image-link">
                      <img [src]="item.productImage" [alt]="item.productName" class="item-image" />
                    </a>
                    
                    <!-- Product Info -->
                    <div class="item-info">
                      <h3 class="item-name">
                        <a [routerLink]="['/products', item.productId]">{{ item.productName }}</a>
                      </h3>
                      @if (item.getVariantDisplay()) {
                        <span class="item-variants">{{ item.getVariantDisplay() }}</span>
                      }
                      <span class="item-sku">SKU: {{ item.productSku }}</span>
                      <span class="item-price-mobile">{{ item.unitPrice.format() }} each</span>
                    </div>
                    
                    <!-- Unit Price (Desktop) -->
                    <div class="item-unit-price">
                      <span class="price-label">Price</span>
                      <span class="price-value">{{ item.unitPrice.format() }}</span>
                    </div>
                    
                    <!-- Quantity -->
                    <div class="item-quantity">
                      <span class="quantity-label">Quantity</span>
                      <app-quantity-selector
                        [quantity]="item.quantity.value"
                        [min]="1"
                        [max]="99"
                        (quantityChange)="updateQuantity(item.itemKey, $event)"
                      />
                    </div>
                    
                    <!-- Subtotal -->
                    <div class="item-subtotal">
                      <span class="subtotal-label">Subtotal</span>
                      <span class="subtotal-value">{{ item.subtotal.format() }}</span>
                    </div>
                    
                    <!-- Remove Button -->
                    <button 
                      type="button" 
                      class="remove-item-btn"
                      (click)="removeItem(item.itemKey)"
                      aria-label="Remove item"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </article>
                }
              </div>
            </section>
            
            <!-- Cart Summary -->
            <aside class="cart-summary-section animate-slide-up stagger-2">
              <app-cart-summary
                [showCouponInput]="true"
                [showCheckoutButton]="true"
                [showContinueShopping]="true"
              />
            </aside>
          </div>
        }
      </div>
      
      <!-- Clear Cart Confirmation -->
      <app-confirm-dialog
        #clearConfirmDialog
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        icon="pi-trash"
        severity="danger"
        confirmLabel="Clear Cart"
        (confirm)="clearCart()"
      />
    </div>
  `,
  styles: [`
    .cart-page {
      min-height: 100vh;
      background: var(--color-surface-alt);
      padding: 2rem 0 4rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-text-primary);
    }

    .clear-cart-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-danger);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-danger);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .clear-cart-btn:hover {
      background: var(--color-danger);
      color: white;
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
    }

    @media (max-width: 1024px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }

    .cart-items-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr 120px 140px 120px 40px;
      gap: 1.5rem;
      align-items: center;
      padding: 1.5rem;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: box-shadow var(--transition-fast);
    }

    .cart-item:hover {
      box-shadow: var(--shadow-md);
    }

    @media (max-width: 900px) {
      .cart-item {
        grid-template-columns: 80px 1fr auto;
        grid-template-rows: auto auto;
        gap: 1rem;
      }

      .item-unit-price {
        display: none;
      }

      .item-quantity {
        grid-column: 1 / -1;
        justify-self: start;
      }

      .item-subtotal {
        grid-column: span 2;
      }

      .remove-item-btn {
        grid-row: 1;
        grid-column: 3;
      }
    }

    .item-image-link {
      display: block;
    }

    .item-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: var(--radius-md);
    }

    @media (max-width: 900px) {
      .item-image {
        width: 80px;
        height: 80px;
      }
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-name {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .item-name a {
      color: var(--color-text-primary);
      text-decoration: none;
    }

    .item-name a:hover {
      color: var(--color-accent);
    }

    .item-variants {
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
    }

    .item-sku {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .item-price-mobile {
      display: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-top: 0.25rem;
    }

    @media (max-width: 900px) {
      .item-price-mobile {
        display: block;
      }
    }

    .item-unit-price,
    .item-quantity,
    .item-subtotal {
      text-align: center;
    }

    .price-label,
    .quantity-label,
    .subtotal-label {
      display: block;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 0.25rem;
    }

    @media (max-width: 900px) {
      .price-label,
      .quantity-label,
      .subtotal-label {
        display: none;
      }
    }

    .price-value,
    .subtotal-value {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .subtotal-value {
      font-size: 1.125rem;
    }

    .remove-item-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--color-surface-dark);
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-item-btn:hover {
      background: var(--color-danger);
      color: white;
    }
  `]
})
export class CartPageComponent {
  @ViewChild('clearConfirmDialog') clearConfirmDialog!: ConfirmDialogComponent;
  
  private readonly cartState = inject(CartState);
  private readonly cartService = inject(CartService);
  
  // State selectors
  readonly items = this.cartState.items;
  readonly isEmpty = this.cartState.isEmpty;
  
  updateQuantity(itemKey: string, quantity: number): void {
    this.cartService.updateQuantity(itemKey, quantity);
  }
  
  removeItem(itemKey: string): void {
    this.cartService.removeItem(itemKey);
  }
  
  showClearConfirm(): void {
    this.clearConfirmDialog.show();
  }
  
  clearCart(): void {
    this.cartService.clearCart();
    this.clearConfirmDialog.hide();
  }
  
  goToProducts(): void {
    // Navigate to products page
    window.location.href = '/products';
  }
}
