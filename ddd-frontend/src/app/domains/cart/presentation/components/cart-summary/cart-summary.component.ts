import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { CartState } from '../../../application/state/cart.state';
import { CartService } from '../../../application/services/cart.service';

/**
 * Cart Summary Component
 * 
 * Displays cart totals and checkout action.
 * Used in cart page and checkout sidebar.
 */
@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    ButtonModule, 
    InputTextModule,
    DividerModule
  ],
  template: `
    <div class="cart-summary">
      <h3 class="summary-title">Order Summary</h3>
      
      <!-- Subtotal -->
      <div class="summary-row">
        <span>Subtotal ({{ totalItems() }} items)</span>
        <span>{{ formattedSubtotal() }}</span>
      </div>
      
      <!-- Shipping -->
      <div class="summary-row">
        <span>Shipping</span>
        <span class="shipping-value">
          @if (showShipping()) {
            {{ shippingCost() > 0 ? ('$' + shippingCost().toFixed(2)) : 'Free' }}
          } @else {
            Calculated at checkout
          }
        </span>
      </div>
      
      <!-- Discount -->
      @if (hasCoupon()) {
        <div class="summary-row discount-row">
          <span class="discount-label">
            Discount
            <span class="coupon-code">({{ appliedCoupon() }})</span>
            <button 
              type="button" 
              class="remove-coupon"
              (click)="removeCoupon()"
              aria-label="Remove coupon"
            >
              <i class="pi pi-times"></i>
            </button>
          </span>
          <span class="discount-amount">-{{ formattedDiscount() }}</span>
        </div>
      }
      
      <!-- Coupon Input -->
      @if (!hasCoupon() && showCouponInput()) {
        <div class="coupon-section">
          <div class="coupon-input-group">
            <input
              type="text"
              pInputText
              [(ngModel)]="couponCode"
              placeholder="Enter coupon code"
              class="coupon-input"
              [disabled]="isApplyingCoupon()"
            />
            <p-button
              label="Apply"
              [loading]="isApplyingCoupon()"
              [disabled]="!couponCode.trim()"
              (onClick)="applyCoupon()"
              severity="secondary"
              styleClass="apply-btn"
            />
          </div>
          @if (couponError()) {
            <span class="coupon-error">{{ couponError() }}</span>
          }
        </div>
      }
      
      <p-divider />
      
      <!-- Total -->
      <div class="summary-row total-row">
        <span class="total-label">Total</span>
        <span class="total-amount">{{ formattedTotal() }}</span>
      </div>
      
      <!-- Checkout Button -->
      @if (showCheckoutButton()) {
        <p-button
          label="Proceed to Checkout"
          icon="pi pi-lock"
          routerLink="/checkout"
          styleClass="checkout-btn"
          [disabled]="isEmpty()"
        />
      }
      
      <!-- Continue Shopping -->
      @if (showContinueShopping()) {
        <a routerLink="/products" class="continue-shopping">
          <i class="pi pi-arrow-left"></i>
          Continue Shopping
        </a>
      }
      
      <!-- Security Notice -->
      <div class="security-notice">
        <i class="pi pi-shield"></i>
        <span>Secure checkout with SSL encryption</span>
      </div>
    </div>
  `,
  styles: [`
    .cart-summary {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
    }

    .summary-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 1.25rem;
      color: var(--color-text-primary);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
    }

    .shipping-value {
      color: var(--color-success);
      font-weight: 500;
    }

    .discount-row {
      color: var(--color-success);
    }

    .discount-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .coupon-code {
      font-size: 0.8125rem;
      opacity: 0.8;
    }

    .remove-coupon {
      width: 1.25rem;
      height: 1.25rem;
      border: none;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .remove-coupon:hover {
      background: var(--color-success);
      color: white;
    }

    .remove-coupon i {
      font-size: 0.5rem;
    }

    .discount-amount {
      font-weight: 600;
    }

    .coupon-section {
      padding: 0.75rem 0;
    }

    .coupon-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .coupon-input {
      flex: 1;
    }

    :host ::ng-deep .apply-btn {
      white-space: nowrap;
    }

    .coupon-error {
      display: block;
      font-size: 0.8125rem;
      color: var(--color-danger);
      margin-top: 0.5rem;
    }

    .total-row {
      padding: 0.75rem 0;
    }

    .total-label {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .total-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    :host ::ng-deep .checkout-btn {
      width: 100%;
      margin-top: 1rem;
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-primary);
    }

    :host ::ng-deep .checkout-btn:hover:not(:disabled) {
      background: var(--color-accent-dark);
      border-color: var(--color-accent-dark);
    }

    .continue-shopping {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
      transition: color var(--transition-fast);
    }

    .continue-shopping:hover {
      color: var(--color-accent);
    }

    .security-notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .security-notice i {
      color: var(--color-success);
    }
  `]
})
export class CartSummaryComponent {
  private readonly cartState = inject(CartState);
  private readonly cartService = inject(CartService);
  
  // Inputs
  showCouponInput = input<boolean>(true);
  showCheckoutButton = input<boolean>(true);
  showContinueShopping = input<boolean>(true);
  showShipping = input<boolean>(false);
  shippingCost = input<number>(0);
  
  // State selectors
  readonly totalItems = this.cartState.totalItems;
  readonly isEmpty = this.cartState.isEmpty;
  readonly formattedSubtotal = this.cartState.formattedSubtotal;
  readonly formattedTotal = this.cartState.formattedTotal;
  readonly formattedDiscount = this.cartState.formattedDiscount;
  readonly appliedCoupon = this.cartState.appliedCoupon;
  readonly hasCoupon = this.cartState.hasCoupon;
  
  // Local state
  couponCode = '';
  isApplyingCoupon = signal(false);
  couponError = signal<string | null>(null);
  
  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    
    this.isApplyingCoupon.set(true);
    this.couponError.set(null);
    
    this.cartService.applyCoupon(this.couponCode.trim()).subscribe(result => {
      this.isApplyingCoupon.set(false);
      
      if (result.isSuccess) {
        this.couponCode = '';
      } else {
        this.couponError.set(result.error.message);
      }
    });
  }
  
  removeCoupon(): void {
    this.cartService.removeCoupon();
    this.couponError.set(null);
  }
}
