import { BaseEntity } from '@core/domain/base-entity';
import { HateoasLinks, HateoasResource } from '@core/infrastructure/api/hateoas.model';

/**
 * Category Entity
 * 
 * Represents a product category in the catalog.
 * Categories can be nested to form a hierarchy.
 */
export class Category extends BaseEntity<string> {
  private _name: string;
  private _slug: string;
  private _description: string;
  private _imageUrl: string | null;
  private _parentId: string | null;
  private _level: number;
  private _productCount: number;
  private _isActive: boolean;
  private _sortOrder: number;
  private _children: Category[];

  private constructor(props: CategoryProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._slug = props.slug;
    this._description = props.description ?? '';
    this._imageUrl = props.imageUrl ?? null;
    this._parentId = props.parentId ?? null;
    this._level = props.level ?? 0;
    this._productCount = props.productCount ?? 0;
    this._isActive = props.isActive ?? true;
    this._sortOrder = props.sortOrder ?? 0;
    this._children = props.children ?? [];
  }

  /**
   * Factory method to create a Category
   */
  static create(props: CategoryProps): Category {
    return new Category(props);
  }

  /**
   * Factory method to create a Category from API response
   */
  static fromDTO(dto: CategoryDTO): Category {
    return new Category({
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      parentId: dto.parentId,
      level: dto.level,
      productCount: dto.productCount,
      isActive: dto.isActive,
      sortOrder: dto.sortOrder,
      children: dto.children?.map(child => Category.fromDTO(child)) ?? [],
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined
    });
  }

  // Getters
  get name(): string { return this._name; }
  get slug(): string { return this._slug; }
  get description(): string { return this._description; }
  get imageUrl(): string | null { return this._imageUrl; }
  get parentId(): string | null { return this._parentId; }
  get level(): number { return this._level; }
  get productCount(): number { return this._productCount; }
  get isActive(): boolean { return this._isActive; }
  get sortOrder(): number { return this._sortOrder; }
  get children(): readonly Category[] { return this._children; }

  // Computed properties
  get isRootCategory(): boolean {
    return this._parentId === null;
  }

  get hasChildren(): boolean {
    return this._children.length > 0;
  }

  get totalProductCount(): number {
    return this._productCount + this._children.reduce((sum, child) => sum + child.totalProductCount, 0);
  }

  // Domain methods
  findChildBySlug(slug: string): Category | undefined {
    return this._children.find(child => child.slug === slug);
  }

  getAllDescendants(): Category[] {
    const descendants: Category[] = [];
    const stack = [...this._children];
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      descendants.push(current);
      stack.push(...current.children);
    }
    
    return descendants;
  }

  /**
   * Converts to a plain object for API calls or storage
   */
  toDTO(): CategoryDTO {
    return {
      id: this.id,
      name: this._name,
      slug: this._slug,
      description: this._description,
      imageUrl: this._imageUrl ?? undefined,
      parentId: this._parentId ?? undefined,
      level: this._level,
      productCount: this._productCount,
      isActive: this._isActive,
      sortOrder: this._sortOrder,
      children: this._children.map(child => child.toDTO()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}

/**
 * Category Properties Interface
 */
export interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  parentId?: string | null;
  level?: number;
  productCount?: number;
  isActive?: boolean;
  sortOrder?: number;
  children?: Category[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Category DTO for API communication
 * Includes optional HATEOAS _links from the API response
 */
export interface CategoryDTO extends HateoasResource {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  level?: number;
  productCount?: number;
  isActive?: boolean;
  sortOrder?: number;
  children?: CategoryDTO[];
  createdAt?: string;
  updatedAt?: string;
}
