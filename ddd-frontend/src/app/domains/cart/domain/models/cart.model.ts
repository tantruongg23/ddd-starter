import { AggregateRoot, DomainEvent } from '@core/domain/base-entity';
import { Money } from '@core/domain/base-value-object';
import { CartItem, CartItemDTO, CartItemVariant } from './cart-item.model';

/**
 * Cart Aggregate Root
 * 
 * Represents the shopping cart aggregate.
 * Maintains invariants and business rules for the cart.
 */
export class Cart extends AggregateRoot<string> {
  private _items: CartItem[];
  private _currency: string;
  private _appliedCouponCode: string | null;
  private _discountAmount: Money;

  private constructor(props: CartProps) {
    super(props.id ?? Cart.generateId(), props.createdAt, props.updatedAt);
    this._items = props.items ?? [];
    this._currency = props.currency ?? 'USD';
    this._appliedCouponCode = props.appliedCouponCode ?? null;
    this._discountAmount = props.discountAmount ?? Money.zero(this._currency);
  }

  private static generateId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Factory method to create a new empty Cart
   */
  static create(currency: string = 'USD'): Cart {
    return new Cart({ currency });
  }

  /**
   * Creates a Cart from a DTO
   */
  static fromDTO(dto: CartDTO): Cart {
    return new Cart({
      id: dto.id,
      items: dto.items?.map(item => CartItem.fromDTO(item)) ?? [],
      currency: dto.currency,
      appliedCouponCode: dto.appliedCouponCode,
      discountAmount: dto.discountAmount 
        ? Money.create(dto.discountAmount, dto.currency ?? 'USD')
        : undefined,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined
    });
  }

  // Getters
  get items(): readonly CartItem[] { return this._items; }
  get currency(): string { return this._currency; }
  get appliedCouponCode(): string | null { return this._appliedCouponCode; }
  get discountAmount(): Money { return this._discountAmount; }

  /**
   * Gets the total number of items (sum of quantities)
   */
  get totalItems(): number {
    return this._items.reduce((sum, item) => sum + item.quantity.value, 0);
  }

  /**
   * Gets the number of unique items
   */
  get uniqueItemCount(): number {
    return this._items.length;
  }

  /**
   * Checks if the cart is empty
   */
  get isEmpty(): boolean {
    return this._items.length === 0;
  }

  /**
   * Calculates the subtotal (before discounts)
   */
  get subtotal(): Money {
    if (this._items.length === 0) {
      return Money.zero(this._currency);
    }
    return this._items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero(this._currency)
    );
  }

  /**
   * Calculates the total (after discounts)
   */
  get total(): Money {
    return this.subtotal.subtract(this._discountAmount);
  }

  /**
   * Checks if a coupon is applied
   */
  get hasCouponApplied(): boolean {
    return this._appliedCouponCode !== null;
  }

  // Domain Methods

  /**
   * Adds an item to the cart
   * If the same product/variant already exists, updates quantity
   */
  addItem(item: CartItem): Cart {
    const existingIndex = this._items.findIndex(i => i.itemKey === item.itemKey);
    
    let newItems: CartItem[];
    if (existingIndex >= 0) {
      // Update existing item quantity
      const existingItem = this._items[existingIndex];
      const updatedItem = existingItem.increaseQuantity(item.quantity.value);
      newItems = [
        ...this._items.slice(0, existingIndex),
        updatedItem,
        ...this._items.slice(existingIndex + 1)
      ];
    } else {
      // Add new item
      newItems = [...this._items, item];
    }

    const newCart = new Cart({
      ...this.toProps(),
      items: newItems
    });

    newCart.addDomainEvent({
      eventType: 'CartItemAdded',
      occurredOn: new Date(),
      aggregateId: this.id,
      productId: item.productId,
      quantity: item.quantity.value
    } as CartItemAddedEvent);

    return newCart;
  }

  /**
   * Removes an item from the cart by item key
   */
  removeItem(itemKey: string): Cart {
    const removedItem = this._items.find(i => i.itemKey === itemKey);
    if (!removedItem) return this;

    const newCart = new Cart({
      ...this.toProps(),
      items: this._items.filter(i => i.itemKey !== itemKey)
    });

    newCart.addDomainEvent({
      eventType: 'CartItemRemoved',
      occurredOn: new Date(),
      aggregateId: this.id,
      productId: removedItem.productId
    } as CartItemRemovedEvent);

    return newCart;
  }

  /**
   * Updates the quantity of an item
   */
  updateItemQuantity(itemKey: string, quantity: number): Cart {
    if (quantity <= 0) {
      return this.removeItem(itemKey);
    }

    const itemIndex = this._items.findIndex(i => i.itemKey === itemKey);
    if (itemIndex < 0) return this;

    const updatedItem = this._items[itemIndex].updateQuantity(quantity);
    const newItems = [
      ...this._items.slice(0, itemIndex),
      updatedItem,
      ...this._items.slice(itemIndex + 1)
    ];

    return new Cart({
      ...this.toProps(),
      items: newItems
    });
  }

  /**
   * Applies a coupon code
   */
  applyCoupon(couponCode: string, discountAmount: Money): Cart {
    const newCart = new Cart({
      ...this.toProps(),
      appliedCouponCode: couponCode,
      discountAmount
    });

    newCart.addDomainEvent({
      eventType: 'CouponApplied',
      occurredOn: new Date(),
      aggregateId: this.id,
      couponCode
    } as CouponAppliedEvent);

    return newCart;
  }

  /**
   * Removes the applied coupon
   */
  removeCoupon(): Cart {
    if (!this._appliedCouponCode) return this;

    return new Cart({
      ...this.toProps(),
      appliedCouponCode: null,
      discountAmount: Money.zero(this._currency)
    });
  }

  /**
   * Clears all items from the cart
   */
  clear(): Cart {
    const newCart = new Cart({
      ...this.toProps(),
      items: [],
      appliedCouponCode: null,
      discountAmount: Money.zero(this._currency)
    });

    newCart.addDomainEvent({
      eventType: 'CartCleared',
      occurredOn: new Date(),
      aggregateId: this.id
    });

    return newCart;
  }

  /**
   * Finds an item by product ID and variants
   */
  findItem(productId: string, variants?: CartItemVariant[]): CartItem | undefined {
    return this._items.find(item => item.matches(productId, variants));
  }

  /**
   * Checks if a product is in the cart
   */
  hasProduct(productId: string): boolean {
    return this._items.some(item => item.productId === productId);
  }

  /**
   * Converts to a DTO
   */
  toDTO(): CartDTO {
    return {
      id: this.id,
      items: this._items.map(item => item.toDTO()),
      currency: this._currency,
      appliedCouponCode: this._appliedCouponCode ?? undefined,
      discountAmount: this._discountAmount.amount,
      subtotal: this.subtotal.amount,
      total: this.total.amount,
      totalItems: this.totalItems,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  private toProps(): CartProps {
    return {
      id: this.id,
      items: [...this._items],
      currency: this._currency,
      appliedCouponCode: this._appliedCouponCode,
      discountAmount: this._discountAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Cart Properties Interface
 */
export interface CartProps {
  id?: string;
  items?: CartItem[];
  currency?: string;
  appliedCouponCode?: string | null;
  discountAmount?: Money;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Cart DTO for API/Storage
 */
export interface CartDTO {
  id?: string;
  items?: CartItemDTO[];
  currency?: string;
  appliedCouponCode?: string;
  discountAmount?: number;
  subtotal?: number;
  total?: number;
  totalItems?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Domain Events
export interface CartItemAddedEvent extends DomainEvent {
  eventType: 'CartItemAdded';
  productId: string;
  quantity: number;
}

export interface CartItemRemovedEvent extends DomainEvent {
  eventType: 'CartItemRemoved';
  productId: string;
}

export interface CouponAppliedEvent extends DomainEvent {
  eventType: 'CouponApplied';
  couponCode: string;
}
