import { BaseEntity, AggregateRoot } from '@core/domain/base-entity';
import { Money, Quantity } from '@core/domain/base-value-object';
import { HateoasLinks, HateoasResource, ResourceActions, LinkRel } from '@core/infrastructure/api/hateoas.model';

/**
 * Product Aggregate Root
 * 
 * Represents a product in the e-commerce catalog.
 * This is an aggregate root that maintains its own invariants.
 */
export class Product extends AggregateRoot<string> {
  private _name: string;
  private _description: string;
  private _price: Money;
  private _originalPrice: Money | null;
  private _sku: string;
  private _categoryId: string;
  private _images: ProductImage[];
  private _attributes: ProductAttribute[];
  private _stock: Quantity;
  private _rating: ProductRating;
  private _status: ProductStatus;
  private _brand: string;
  private _tags: string[];
  private _links: HateoasLinks | null;

  private constructor(props: ProductProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._originalPrice = props.originalPrice ?? null;
    this._sku = props.sku;
    this._categoryId = props.categoryId;
    this._images = props.images ?? [];
    this._attributes = props.attributes ?? [];
    this._stock = props.stock ?? Quantity.zero();
    this._rating = props.rating ?? { average: 0, count: 0 };
    this._status = props.status ?? ProductStatus.ACTIVE;
    this._brand = props.brand ?? '';
    this._tags = props.tags ?? [];
    this._links = props.links ?? null;
  }

  /**
   * Factory method to create a Product
   */
  static create(props: ProductProps): Product {
    return new Product(props);
  }

  /**
   * Factory method to create a Product from API response
   */
  static fromDTO(dto: ProductDTO): Product {
    return new Product({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: Money.create(dto.price, dto.currency ?? 'USD'),
      originalPrice: dto.originalPrice ? Money.create(dto.originalPrice, dto.currency ?? 'USD') : null,
      sku: dto.sku,
      categoryId: dto.categoryId,
      images: dto.images?.map(img => ({
        url: img.url,
        alt: img.alt ?? dto.name,
        isPrimary: img.isPrimary ?? false
      })) ?? [],
      attributes: dto.attributes ?? [],
      stock: Quantity.create(dto.stock ?? 0),
      rating: dto.rating ?? { average: 0, count: 0 },
      status: dto.status as ProductStatus ?? ProductStatus.ACTIVE,
      brand: dto.brand ?? '',
      tags: dto.tags ?? [],
      links: dto._links ?? null,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined
    });
  }

  // Getters
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get price(): Money { return this._price; }
  get originalPrice(): Money | null { return this._originalPrice; }
  get sku(): string { return this._sku; }
  get categoryId(): string { return this._categoryId; }
  get images(): readonly ProductImage[] { return this._images; }
  get primaryImage(): ProductImage | null {
    return this._images.find(img => img.isPrimary) ?? this._images[0] ?? null;
  }
  get attributes(): readonly ProductAttribute[] { return this._attributes; }
  get stock(): Quantity { return this._stock; }
  get rating(): ProductRating { return this._rating; }
  get status(): ProductStatus { return this._status; }
  get brand(): string { return this._brand; }
  get tags(): readonly string[] { return this._tags; }
  
  // HATEOAS Links
  get links(): HateoasLinks | null { return this._links; }
  get hasLinks(): boolean { return this._links !== null && Object.keys(this._links).length > 0; }

  /**
   * Gets the self link URL for this product
   */
  get selfLink(): string | null {
    return this._links?.self?.href ?? null;
  }

  /**
   * Gets available actions based on HATEOAS links
   */
  get availableActions(): ProductActions {
    return {
      canUpdate: this.hasAction(LinkRel.UPDATE),
      canDelete: this.hasAction(LinkRel.DELETE),
      canActivate: this.hasAction(LinkRel.ACTIVATE),
      canDeactivate: this.hasAction(LinkRel.DEACTIVATE),
      canAddToCart: this.hasAction(LinkRel.ADD_TO_CART) || this.isInStock,
    };
  }

  /**
   * Checks if a specific action is available
   */
  hasAction(rel: string): boolean {
    return this._links?.[rel] !== undefined;
  }

  /**
   * Gets the href for a specific link relation
   */
  getActionHref(rel: string): string | null {
    const link = this._links?.[rel];
    if (!link) return null;
    return Array.isArray(link) ? link[0]?.href : link.href;
  }

  // Computed properties
  get isOnSale(): boolean {
    return this._originalPrice !== null && this._originalPrice.amount > this._price.amount;
  }

  get discountPercentage(): number {
    if (!this.isOnSale || !this._originalPrice) return 0;
    return Math.round(((this._originalPrice.amount - this._price.amount) / this._originalPrice.amount) * 100);
  }

  get isInStock(): boolean {
    return !this._stock.isZero() && this._status === ProductStatus.ACTIVE;
  }

  get isAvailable(): boolean {
    return this._status === ProductStatus.ACTIVE;
  }

  // Domain methods
  getAttribute(name: string): ProductAttribute | undefined {
    return this._attributes.find(attr => attr.name.toLowerCase() === name.toLowerCase());
  }

  hasTag(tag: string): boolean {
    return this._tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  /**
   * Converts to a plain object for API calls or storage
   */
  toDTO(): ProductDTO {
    return {
      id: this.id,
      name: this._name,
      description: this._description,
      price: this._price.amount,
      currency: this._price.currency,
      originalPrice: this._originalPrice?.amount ?? undefined,
      sku: this._sku,
      categoryId: this._categoryId,
      images: this._images.map(img => ({ ...img })),
      attributes: this._attributes.map(attr => ({ ...attr })),
      stock: this._stock.value,
      rating: { ...this._rating },
      status: this._status,
      brand: this._brand,
      tags: [...this._tags],
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}

/**
 * Product Properties Interface
 */
export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  originalPrice?: Money | null;
  sku: string;
  categoryId: string;
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  stock?: Quantity;
  rating?: ProductRating;
  status?: ProductStatus;
  brand?: string;
  tags?: string[];
  links?: HateoasLinks | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Available actions for a product based on HATEOAS links
 */
export interface ProductActions {
  canUpdate: boolean;
  canDelete: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canAddToCart: boolean;
}

/**
 * Product DTO for API communication
 * Includes optional HATEOAS _links from the API response
 */
export interface ProductDTO extends HateoasResource {
  id: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  originalPrice?: number;
  sku: string;
  categoryId: string;
  images?: ProductImageDTO[];
  attributes?: ProductAttribute[];
  stock?: number;
  rating?: ProductRating;
  status?: string;
  brand?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImageDTO {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

/**
 * Product Image Value Object
 */
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

/**
 * Product Attribute
 */
export interface ProductAttribute {
  name: string;
  value: string;
  unit?: string;
}

/**
 * Product Rating
 */
export interface ProductRating {
  average: number;
  count: number;
}

/**
 * Product Status Enum
 */
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

/**
 * Product Sort Options
 */
export enum ProductSortOption {
  NEWEST = 'newest',
  PRICE_LOW = 'price_low',
  PRICE_HIGH = 'price_high',
  RATING = 'rating',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  POPULARITY = 'popularity'
}
