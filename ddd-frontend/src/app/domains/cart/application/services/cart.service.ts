import { Injectable, inject } from '@angular/core';
import { Observable, of, map, tap, catchError } from 'rxjs';
import { ApiService } from '@core/infrastructure/api/api.service';
import { Result, DomainError } from '@core/domain/result';
import { CartState } from '../state/cart.state';
import { CartDTO } from '../../domain/models/cart.model';
import { CartItemVariant } from '../../domain/models/cart-item.model';
import { Product } from '@catalog/domain/models/product.model';

/**
 * Coupon Validation Result
 */
export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  message?: string;
}

/**
 * Cart Application Service
 * 
 * Orchestrates cart operations and provides a facade for cart functionality.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly api = inject(ApiService);
  private readonly state = inject(CartState);
  
  // ==========================================
  // State Accessors
  // ==========================================
  
  get items() { return this.state.items; }
  get totalItems() { return this.state.totalItems; }
  get isEmpty() { return this.state.isEmpty; }
  get subtotal() { return this.state.subtotal; }
  get total() { return this.state.total; }
  get appliedCoupon() { return this.state.appliedCoupon; }
  get discount() { return this.state.discount; }
  get hasCoupon() { return this.state.hasCoupon; }
  get formattedSubtotal() { return this.state.formattedSubtotal; }
  get formattedTotal() { return this.state.formattedTotal; }
  get badgeText() { return this.state.badgeText; }
  get isMiniCartOpen() { return this.state.isMiniCartOpen; }
  
  // ==========================================
  // Cart Operations
  // ==========================================
  
  /**
   * Adds a product to the cart
   */
  addProduct(
    product: Product,
    quantity: number = 1,
    variants?: CartItemVariant[]
  ): void {
    this.state.addItem(
      product.id,
      product.name,
      product.primaryImage?.url ?? '',
      product.sku,
      product.price.amount,
      quantity,
      variants,
      product.price.currency
    );
  }
  
  /**
   * Adds an item directly with all properties
   */
  addItem(
    productId: string,
    productName: string,
    productImage: string,
    productSku: string,
    unitPrice: number,
    quantity: number = 1,
    variants?: CartItemVariant[],
    currency: string = 'USD'
  ): void {
    this.state.addItem(
      productId,
      productName,
      productImage,
      productSku,
      unitPrice,
      quantity,
      variants,
      currency
    );
  }
  
  /**
   * Removes an item from the cart
   */
  removeItem(itemKey: string): void {
    this.state.removeItem(itemKey);
  }
  
  /**
   * Updates item quantity
   */
  updateQuantity(itemKey: string, quantity: number): void {
    this.state.updateQuantity(itemKey, quantity);
  }
  
  /**
   * Increases item quantity
   */
  increaseQuantity(itemKey: string): void {
    this.state.increaseQuantity(itemKey);
  }
  
  /**
   * Decreases item quantity
   */
  decreaseQuantity(itemKey: string): void {
    this.state.decreaseQuantity(itemKey);
  }
  
  /**
   * Clears the entire cart
   */
  clearCart(): void {
    this.state.clearCart();
  }
  
  // ==========================================
  // Coupon Operations
  // ==========================================
  
  /**
   * Validates and applies a coupon code
   */
  applyCoupon(couponCode: string): Observable<Result<CouponValidationResult, DomainError>> {
    this.state.setLoading(true);
    
    const subtotal = this.state.subtotal().amount;
    
    return this.api.post<CouponValidationResult>('cart/coupons/validate', {
      code: couponCode,
      subtotal
    }).pipe(
      map(result => {
        if (result.isSuccess && result.value.valid) {
          this.state.applyCoupon(couponCode, result.value.discountAmount);
          return Result.ok<CouponValidationResult, DomainError>(result.value);
        }
        
        const error = result.isFailure 
          ? result.error 
          : { code: 'INVALID_COUPON', message: result.value.message ?? 'Invalid coupon code' };
        
        return Result.fail<CouponValidationResult, DomainError>(error);
      }),
      catchError(error => {
        this.state.setLoading(false);
        return of(Result.fail<CouponValidationResult, DomainError>({
          code: 'COUPON_ERROR',
          message: 'Failed to validate coupon'
        }));
      }),
      tap(() => this.state.setLoading(false))
    );
  }
  
  /**
   * Removes the applied coupon
   */
  removeCoupon(): void {
    this.state.removeCoupon();
  }
  
  // ==========================================
  // Mini Cart Operations
  // ==========================================
  
  /**
   * Opens the mini cart
   */
  openMiniCart(): void {
    this.state.openMiniCart();
  }
  
  /**
   * Closes the mini cart
   */
  closeMiniCart(): void {
    this.state.closeMiniCart();
  }
  
  /**
   * Toggles the mini cart
   */
  toggleMiniCart(): void {
    this.state.toggleMiniCart();
  }
  
  // ==========================================
  // Utility Methods
  // ==========================================
  
  /**
   * Checks if a product is in the cart
   */
  hasProduct(productId: string): boolean {
    return this.state.hasProduct(productId);
  }
  
  /**
   * Gets quantity of a product in the cart
   */
  getProductQuantity(productId: string): number {
    return this.state.getProductQuantity(productId);
  }
  
  // ==========================================
  // Server Sync (Optional - for logged in users)
  // ==========================================
  
  /**
   * Syncs cart with server (for logged-in users)
   */
  syncWithServer(): Observable<Result<CartDTO, DomainError>> {
    this.state.setLoading(true);
    
    return this.api.post<CartDTO>('cart/sync', this.state.cart().toDTO()).pipe(
      tap(() => this.state.setLoading(false)),
      catchError(error => {
        this.state.setLoading(false);
        return of(Result.fail<CartDTO, DomainError>({
          code: 'SYNC_ERROR',
          message: 'Failed to sync cart'
        }));
      })
    );
  }
  
  /**
   * Loads cart from server (for logged-in users)
   */
  loadFromServer(): Observable<Result<CartDTO, DomainError>> {
    this.state.setLoading(true);
    
    return this.api.get<CartDTO>('cart').pipe(
      tap(() => this.state.setLoading(false)),
      catchError(error => {
        this.state.setLoading(false);
        return of(Result.fail<CartDTO, DomainError>({
          code: 'LOAD_ERROR',
          message: 'Failed to load cart'
        }));
      })
    );
  }
}
