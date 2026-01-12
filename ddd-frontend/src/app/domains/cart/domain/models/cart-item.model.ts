import { Money, Quantity } from '@core/domain/base-value-object';

/**
 * Cart Item Entity
 * 
 * Represents an item in the shopping cart.
 * Contains product information snapshot at the time of adding to cart.
 */
export class CartItem {
  private _productId: string;
  private _productName: string;
  private _productImage: string;
  private _productSku: string;
  private _unitPrice: Money;
  private _quantity: Quantity;
  private _selectedVariants: CartItemVariant[];
  private _addedAt: Date;

  private constructor(props: CartItemProps) {
    this._productId = props.productId;
    this._productName = props.productName;
    this._productImage = props.productImage;
    this._productSku = props.productSku;
    this._unitPrice = props.unitPrice;
    this._quantity = props.quantity;
    this._selectedVariants = props.selectedVariants ?? [];
    this._addedAt = props.addedAt ?? new Date();
  }

  /**
   * Factory method to create a CartItem
   */
  static create(props: CartItemProps): CartItem {
    return new CartItem(props);
  }

  /**
   * Creates a CartItem from a DTO
   */
  static fromDTO(dto: CartItemDTO): CartItem {
    return new CartItem({
      productId: dto.productId,
      productName: dto.productName,
      productImage: dto.productImage,
      productSku: dto.productSku,
      unitPrice: Money.create(dto.unitPrice, dto.currency ?? 'USD'),
      quantity: Quantity.create(dto.quantity),
      selectedVariants: dto.selectedVariants ?? [],
      addedAt: dto.addedAt ? new Date(dto.addedAt) : new Date()
    });
  }

  // Getters
  get productId(): string { return this._productId; }
  get productName(): string { return this._productName; }
  get productImage(): string { return this._productImage; }
  get productSku(): string { return this._productSku; }
  get unitPrice(): Money { return this._unitPrice; }
  get quantity(): Quantity { return this._quantity; }
  get selectedVariants(): readonly CartItemVariant[] { return this._selectedVariants; }
  get addedAt(): Date { return this._addedAt; }

  /**
   * Gets the unique identifier for this cart item
   * Combines product ID with variant selections
   */
  get itemKey(): string {
    const variantKey = this._selectedVariants
      .map(v => `${v.name}:${v.value}`)
      .sort()
      .join('|');
    return variantKey ? `${this._productId}::${variantKey}` : this._productId;
  }

  /**
   * Calculates the subtotal for this item
   */
  get subtotal(): Money {
    return this._unitPrice.multiply(this._quantity.value);
  }

  /**
   * Updates the quantity
   */
  updateQuantity(newQuantity: number): CartItem {
    return CartItem.create({
      ...this.toProps(),
      quantity: Quantity.create(newQuantity)
    });
  }

  /**
   * Increases quantity by amount
   */
  increaseQuantity(amount: number = 1): CartItem {
    return this.updateQuantity(this._quantity.value + amount);
  }

  /**
   * Decreases quantity by amount
   */
  decreaseQuantity(amount: number = 1): CartItem {
    const newQty = Math.max(1, this._quantity.value - amount);
    return this.updateQuantity(newQty);
  }

  /**
   * Checks if this item matches another by product ID and variants
   */
  matches(productId: string, variants?: CartItemVariant[]): boolean {
    if (this._productId !== productId) return false;
    
    if (!variants || variants.length === 0) {
      return this._selectedVariants.length === 0;
    }
    
    if (variants.length !== this._selectedVariants.length) return false;
    
    return variants.every(v => 
      this._selectedVariants.some(sv => sv.name === v.name && sv.value === v.value)
    );
  }

  /**
   * Gets variant display string
   */
  getVariantDisplay(): string {
    if (this._selectedVariants.length === 0) return '';
    return this._selectedVariants.map(v => `${v.name}: ${v.value}`).join(', ');
  }

  /**
   * Converts to a plain object
   */
  toDTO(): CartItemDTO {
    return {
      productId: this._productId,
      productName: this._productName,
      productImage: this._productImage,
      productSku: this._productSku,
      unitPrice: this._unitPrice.amount,
      currency: this._unitPrice.currency,
      quantity: this._quantity.value,
      selectedVariants: [...this._selectedVariants],
      addedAt: this._addedAt.toISOString()
    };
  }

  private toProps(): CartItemProps {
    return {
      productId: this._productId,
      productName: this._productName,
      productImage: this._productImage,
      productSku: this._productSku,
      unitPrice: this._unitPrice,
      quantity: this._quantity,
      selectedVariants: [...this._selectedVariants],
      addedAt: this._addedAt
    };
  }
}

/**
 * Cart Item Properties Interface
 */
export interface CartItemProps {
  productId: string;
  productName: string;
  productImage: string;
  productSku: string;
  unitPrice: Money;
  quantity: Quantity;
  selectedVariants?: CartItemVariant[];
  addedAt?: Date;
}

/**
 * Cart Item DTO for API/Storage
 */
export interface CartItemDTO {
  productId: string;
  productName: string;
  productImage: string;
  productSku: string;
  unitPrice: number;
  currency?: string;
  quantity: number;
  selectedVariants?: CartItemVariant[];
  addedAt?: string;
}

/**
 * Cart Item Variant
 */
export interface CartItemVariant {
  name: string;
  value: string;
}
