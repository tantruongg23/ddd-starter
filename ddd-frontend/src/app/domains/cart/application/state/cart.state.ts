import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Cart, CartDTO } from '../../domain/models/cart.model';
import { CartItem, CartItemVariant } from '../../domain/models/cart-item.model';
import { Money, Quantity } from '@core/domain/base-value-object';
import { LocalStorageService } from '@core/infrastructure/storage/local-storage.service';

const CART_STORAGE_KEY = 'shopping_cart';

/**
 * Cart State
 * 
 * Signal-based state management for the shopping cart.
 * Persists cart data to localStorage for persistence across sessions.
 */
@Injectable({
  providedIn: 'root'
})
export class CartState {
  private readonly storageService = inject(LocalStorageService);
  
  // ==========================================
  // State Signals
  // ==========================================
  
  private readonly _cart = signal<Cart>(Cart.create());
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _isMiniCartOpen = signal<boolean>(false);
  
  // ==========================================
  // Public Read-only Selectors
  // ==========================================
  
  readonly cart = this._cart.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isMiniCartOpen = this._isMiniCartOpen.asReadonly();
  
  // ==========================================
  // Computed Selectors
  // ==========================================
  
  /**
   * All cart items
   */
  readonly items = computed(() => this._cart().items);
  
  /**
   * Total number of items in cart
   */
  readonly totalItems = computed(() => this._cart().totalItems);
  
  /**
   * Number of unique items
   */
  readonly uniqueItemCount = computed(() => this._cart().uniqueItemCount);
  
  /**
   * Whether cart is empty
   */
  readonly isEmpty = computed(() => this._cart().isEmpty);
  
  /**
   * Cart subtotal (before discounts)
   */
  readonly subtotal = computed(() => this._cart().subtotal);
  
  /**
   * Cart total (after discounts)
   */
  readonly total = computed(() => this._cart().total);
  
  /**
   * Applied coupon code
   */
  readonly appliedCoupon = computed(() => this._cart().appliedCouponCode);
  
  /**
   * Discount amount
   */
  readonly discount = computed(() => this._cart().discountAmount);
  
  /**
   * Whether a coupon is applied
   */
  readonly hasCoupon = computed(() => this._cart().hasCouponApplied);
  
  /**
   * Formatted subtotal
   */
  readonly formattedSubtotal = computed(() => this._cart().subtotal.format());
  
  /**
   * Formatted total
   */
  readonly formattedTotal = computed(() => this._cart().total.format());
  
  /**
   * Formatted discount
   */
  readonly formattedDiscount = computed(() => this._cart().discountAmount.format());
  
  /**
   * Cart badge text (for header icon)
   */
  readonly badgeText = computed(() => {
    const count = this.totalItems();
    if (count === 0) return '';
    return count > 99 ? '99+' : count.toString();
  });
  
  constructor() {
    // Load cart from storage on initialization
    this.loadFromStorage();
    
    // Persist cart changes to storage
    effect(() => {
      const cart = this._cart();
      this.saveToStorage(cart);
    });
  }
  
  // ==========================================
  // Actions (State Mutators)
  // ==========================================
  
  /**
   * Adds an item to the cart
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
    const item = CartItem.create({
      productId,
      productName,
      productImage,
      productSku,
      unitPrice: Money.create(unitPrice, currency),
      quantity: Quantity.create(quantity),
      selectedVariants: variants
    });
    
    this._cart.update(cart => cart.addItem(item));
    
    // Show mini cart briefly after adding item
    this.openMiniCart();
    setTimeout(() => this.closeMiniCart(), 3000);
  }
  
  /**
   * Removes an item from the cart
   */
  removeItem(itemKey: string): void {
    this._cart.update(cart => cart.removeItem(itemKey));
  }
  
  /**
   * Updates item quantity
   */
  updateQuantity(itemKey: string, quantity: number): void {
    this._cart.update(cart => cart.updateItemQuantity(itemKey, quantity));
  }
  
  /**
   * Increases item quantity by 1
   */
  increaseQuantity(itemKey: string): void {
    const item = this._cart().items.find(i => i.itemKey === itemKey);
    if (item) {
      this.updateQuantity(itemKey, item.quantity.value + 1);
    }
  }
  
  /**
   * Decreases item quantity by 1
   */
  decreaseQuantity(itemKey: string): void {
    const item = this._cart().items.find(i => i.itemKey === itemKey);
    if (item) {
      const newQty = item.quantity.value - 1;
      if (newQty <= 0) {
        this.removeItem(itemKey);
      } else {
        this.updateQuantity(itemKey, newQty);
      }
    }
  }
  
  /**
   * Applies a coupon code
   */
  applyCoupon(couponCode: string, discountAmount: number, currency: string = 'USD'): void {
    this._cart.update(cart => 
      cart.applyCoupon(couponCode, Money.create(discountAmount, currency))
    );
  }
  
  /**
   * Removes the applied coupon
   */
  removeCoupon(): void {
    this._cart.update(cart => cart.removeCoupon());
  }
  
  /**
   * Clears all items from the cart
   */
  clearCart(): void {
    this._cart.update(cart => cart.clear());
  }
  
  /**
   * Sets loading state
   */
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }
  
  /**
   * Sets error state
   */
  setError(error: string | null): void {
    this._error.set(error);
  }
  
  /**
   * Opens mini cart dropdown
   */
  openMiniCart(): void {
    this._isMiniCartOpen.set(true);
  }
  
  /**
   * Closes mini cart dropdown
   */
  closeMiniCart(): void {
    this._isMiniCartOpen.set(false);
  }
  
  /**
   * Toggles mini cart dropdown
   */
  toggleMiniCart(): void {
    this._isMiniCartOpen.update(open => !open);
  }
  
  /**
   * Checks if a product is in the cart
   */
  hasProduct(productId: string): boolean {
    return this._cart().hasProduct(productId);
  }
  
  /**
   * Gets quantity of a product in cart
   */
  getProductQuantity(productId: string): number {
    const items = this._cart().items.filter(i => i.productId === productId);
    return items.reduce((sum, item) => sum + item.quantity.value, 0);
  }
  
  // ==========================================
  // Persistence
  // ==========================================
  
  private loadFromStorage(): void {
    const savedCart = this.storageService.get<CartDTO>(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const cart = Cart.fromDTO(savedCart);
        this._cart.set(cart);
      } catch (error) {
        console.error('Failed to load cart from storage:', error);
        this.storageService.remove(CART_STORAGE_KEY);
      }
    }
  }
  
  private saveToStorage(cart: Cart): void {
    this.storageService.set(CART_STORAGE_KEY, cart.toDTO());
  }
}
