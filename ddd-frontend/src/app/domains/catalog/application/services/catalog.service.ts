import { Injectable, inject } from '@angular/core';
import { Observable, map, tap, catchError, of, switchMap } from 'rxjs';
import { ApiService, PaginatedResponse } from '@core/infrastructure/api/api.service';
import { HateoasService } from '@core/infrastructure/api/hateoas.service';
import { HateoasLinks, LinkRel, WithLinks } from '@core/infrastructure/api/hateoas.model';
import { Result, DomainError } from '@core/domain/result';
import { Product, ProductDTO, ProductSortOption } from '../../domain/models/product.model';
import { Category, CategoryDTO } from '../../domain/models/category.model';
import { ProductFilterCriteria } from '../../domain/services/product-filter.service';
import { CatalogState } from '../state/catalog.state';

/**
 * Catalog Application Service
 * 
 * Orchestrates catalog operations between the API and state.
 * Acts as a facade for the catalog bounded context.
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly api = inject(ApiService);
  private readonly hateoas = inject(HateoasService);
  private readonly state = inject(CatalogState);
  
  /** Stores collection-level HATEOAS links (e.g., create, filter by status) */
  private _collectionLinks: HateoasLinks = {};
  
  // ==========================================
  // Product Operations
  // ==========================================
  
  /**
   * Loads all products with optional filters
   * Uses HATEOAS-aware API methods to preserve hypermedia links
   */
  loadProducts(criteria?: ProductFilterCriteria): Observable<Result<Product[], DomainError>> {
    this.state.setProductsLoading(true);
    
    const params = this.buildProductParams(criteria);
    
    // Use getWithLinks to preserve HATEOAS links in the response
    return this.api.getWithLinks<ProductDTO[]>('products', { params }).pipe(
      map(result => {
        if (result.isSuccess) {
          // Store collection-level links for later use (e.g., create action)
          if (result.value._links) {
            this._collectionLinks = result.value._links;
          }
          
          // Map DTOs to domain entities, preserving individual item links
          const dtos = Array.isArray(result.value) ? result.value : (result.value as any);
          const products = (Array.isArray(dtos) ? dtos : []).map((dto: ProductDTO) => Product.fromDTO(dto));
          this.state.setProducts(products);
          return Result.ok<Product[], DomainError>(products);
        }
        this.state.setProductsError(result.error.message);
        return Result.fail<Product[], DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setProductsError('Failed to load products');
        this.state.setProductsLoading(false);
        return of(Result.fail<Product[], DomainError>({ code: 'LOAD_ERROR', message: 'Failed to load products' }));
      }),
      tap(() => this.state.setProductsLoading(false))
    );
  }
  
  /**
   * Gets the collection-level HATEOAS links (e.g., for create action)
   */
  get collectionLinks(): HateoasLinks {
    return this._collectionLinks;
  }
  
  /**
   * Checks if a specific action is available at the collection level
   */
  canPerformCollectionAction(rel: string): boolean {
    return this._collectionLinks[rel] !== undefined;
  }
  
  /**
   * Loads paginated products using HATEOAS-aware pagination
   * The response includes navigation links (next, prev, first, last)
   */
  loadProductsPaginated(
    page: number = 1, 
    pageSize: number = 12,
    criteria?: ProductFilterCriteria
  ): Observable<Result<PaginatedResponse<Product> & { links: HateoasLinks }, DomainError>> {
    this.state.setProductsLoading(true);
    
    const additionalParams = this.buildProductParams(criteria);
    
    // Use HATEOAS-aware pagination (Spring uses 0-based pages)
    return this.api.getHateoasPaginated<ProductDTO>(
      'products', 
      'products', 
      page - 1, // Convert to 0-based
      pageSize, 
      additionalParams
    ).pipe(
      map(result => {
        if (result.isSuccess) {
          const products = result.value.data.map((dto: ProductDTO) => Product.fromDTO(dto));
          
          if (page === 1) {
            this.state.setProducts(products);
          } else {
            this.state.appendProducts(products);
          }
          
          // Store collection-level links for navigation
          this._collectionLinks = result.value.links;
          
          this.state.setTotalItems(result.value.pagination.totalItems);
          this.state.setPage(page);
          
          return Result.ok<PaginatedResponse<Product> & { links: HateoasLinks }, DomainError>({
            data: products,
            pagination: result.value.pagination,
            _links: result.value.links,
            links: result.value.links
          });
        }
        
        this.state.setProductsError(result.error.message);
        return Result.fail<PaginatedResponse<Product> & { links: HateoasLinks }, DomainError>(result.error);
      }),
      tap(() => this.state.setProductsLoading(false)),
      catchError(error => {
        this.state.setProductsError('Failed to load products');
        return of(Result.fail<PaginatedResponse<Product> & { links: HateoasLinks }, DomainError>({ 
          code: 'LOAD_ERROR', 
          message: 'Failed to load products' 
        }));
      })
    );
  }
  
  /**
   * Loads the next page of products using HATEOAS navigation
   * Only available if the 'next' link exists
   */
  loadNextPage(): Observable<Result<Product[], DomainError>> {
    const nextLink = this._collectionLinks[LinkRel.NEXT];
    
    if (!nextLink) {
      return of(Result.fail<Product[], DomainError>({
        code: 'NO_NEXT_PAGE',
        message: 'No next page available'
      }));
    }
    
    const href = Array.isArray(nextLink) ? nextLink[0]?.href : nextLink.href;
    if (!href) {
      return of(Result.fail<Product[], DomainError>({
        code: 'INVALID_LINK',
        message: 'Invalid next page link'
      }));
    }
    
    this.state.setProductsLoading(true);
    
    return this.api.followLink<{ _embedded: { products: ProductDTO[] }; _links: HateoasLinks }>(href).pipe(
      map(result => {
        if (result.isSuccess) {
          const products = (result.value._embedded?.products ?? []).map((dto: ProductDTO) => Product.fromDTO(dto));
          this.state.appendProducts(products);
          
          // Update links for next navigation
          if (result.value._links) {
            this._collectionLinks = result.value._links;
          }
          
          this.state.nextPage();
          return Result.ok<Product[], DomainError>(products);
        }
        return Result.fail<Product[], DomainError>(result.error);
      }),
      tap(() => this.state.setProductsLoading(false)),
      catchError(error => {
        this.state.setProductsLoading(false);
        return of(Result.fail<Product[], DomainError>({
          code: 'LOAD_ERROR',
          message: 'Failed to load next page'
        }));
      })
    );
  }
  
  /**
   * Checks if there is a next page available
   */
  hasNextPage(): boolean {
    return this._collectionLinks[LinkRel.NEXT] !== undefined;
  }
  
  /**
   * Checks if there is a previous page available
   */
  hasPreviousPage(): boolean {
    return this._collectionLinks[LinkRel.PREV] !== undefined;
  }
  
  /**
   * Loads a single product by ID
   * Uses HATEOAS to get available actions for the product
   */
  loadProduct(productId: string): Observable<Result<Product, DomainError>> {
    this.state.setProductsLoading(true);
    
    return this.api.getWithLinks<ProductDTO>(`products/${productId}`).pipe(
      map(result => {
        if (result.isSuccess) {
          // The DTO now includes _links from the API response
          const product = Product.fromDTO(result.value as ProductDTO);
          this.state.selectProduct(product);
          return Result.ok<Product, DomainError>(product);
        }
        return Result.fail<Product, DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setProductsLoading(false);
        return of(Result.fail<Product, DomainError>({ 
          code: 'LOAD_ERROR', 
          message: 'Failed to load product' 
        }));
      }),
      tap(() => this.state.setProductsLoading(false))
    );
  }
  
  /**
   * Follows a product's HATEOAS link to perform an action
   * This is a generic method for following any link on a product
   */
  followProductLink<T>(product: Product, rel: string, body?: unknown): Observable<Result<T, DomainError>> {
    const href = product.getActionHref(rel);
    
    if (!href) {
      return of(Result.fail<T, DomainError>({
        code: 'LINK_NOT_FOUND',
        message: `Action '${rel}' is not available for this product`
      }));
    }
    
    // Determine HTTP method based on the relation
    if (body !== undefined) {
      return this.api.followLinkWithPost<T>(href, body);
    }
    
    return this.api.followLink<T>(href);
  }
  
  /**
   * Activates a product using its HATEOAS link
   * Only available if the product has an 'activate' link
   */
  activateProduct(product: Product): Observable<Result<Product, DomainError>> {
    if (!product.hasAction(LinkRel.ACTIVATE)) {
      return of(Result.fail<Product, DomainError>({
        code: 'ACTION_NOT_AVAILABLE',
        message: 'Activate action is not available for this product'
      }));
    }
    
    const href = product.getActionHref(LinkRel.ACTIVATE)!;
    
    return this.api.followLinkWithPost<ProductDTO>(href, {}).pipe(
      map(result => {
        if (result.isSuccess) {
          const updatedProduct = Product.fromDTO(result.value as ProductDTO);
          this.state.updateProduct(updatedProduct);
          return Result.ok<Product, DomainError>(updatedProduct);
        }
        return Result.fail<Product, DomainError>(result.error);
      })
    );
  }
  
  /**
   * Deactivates a product using its HATEOAS link
   * Only available if the product has a 'deactivate' link
   */
  deactivateProduct(product: Product): Observable<Result<Product, DomainError>> {
    if (!product.hasAction(LinkRel.DEACTIVATE)) {
      return of(Result.fail<Product, DomainError>({
        code: 'ACTION_NOT_AVAILABLE',
        message: 'Deactivate action is not available for this product'
      }));
    }
    
    const href = product.getActionHref(LinkRel.DEACTIVATE)!;
    
    return this.api.followLinkWithPost<ProductDTO>(href, {}).pipe(
      map(result => {
        if (result.isSuccess) {
          const updatedProduct = Product.fromDTO(result.value as ProductDTO);
          this.state.updateProduct(updatedProduct);
          return Result.ok<Product, DomainError>(updatedProduct);
        }
        return Result.fail<Product, DomainError>(result.error);
      })
    );
  }
  
  /**
   * Deletes a product using its HATEOAS link
   * Only available if the product has a 'delete' link
   */
  deleteProduct(product: Product): Observable<Result<void, DomainError>> {
    if (!product.hasAction(LinkRel.DELETE)) {
      return of(Result.fail<void, DomainError>({
        code: 'ACTION_NOT_AVAILABLE',
        message: 'Delete action is not available for this product'
      }));
    }
    
    const href = product.getActionHref(LinkRel.DELETE)!;
    
    return this.api.followLinkWithDelete<void>(href).pipe(
      tap(result => {
        if (result.isSuccess) {
          this.state.removeProduct(product.id);
        }
      })
    );
  }
  
  /**
   * Updates a product using its HATEOAS link
   * Only available if the product has an 'update' link
   */
  updateProduct(product: Product, updates: Partial<ProductDTO>): Observable<Result<Product, DomainError>> {
    if (!product.hasAction(LinkRel.UPDATE)) {
      return of(Result.fail<Product, DomainError>({
        code: 'ACTION_NOT_AVAILABLE',
        message: 'Update action is not available for this product'
      }));
    }
    
    const href = product.getActionHref(LinkRel.UPDATE)!;
    
    return this.api.followLinkWithPut<ProductDTO>(href, updates).pipe(
      map(result => {
        if (result.isSuccess) {
          const updatedProduct = Product.fromDTO(result.value as ProductDTO);
          this.state.updateProduct(updatedProduct);
          return Result.ok<Product, DomainError>(updatedProduct);
        }
        return Result.fail<Product, DomainError>(result.error);
      })
    );
  }
  
  /**
   * Creates a new product using the collection's HATEOAS link
   * Only available if the collection has a 'create' link
   */
  createProduct(productData: Partial<ProductDTO>): Observable<Result<Product, DomainError>> {
    if (!this.canPerformCollectionAction(LinkRel.CREATE)) {
      return of(Result.fail<Product, DomainError>({
        code: 'ACTION_NOT_AVAILABLE',
        message: 'Create action is not available'
      }));
    }
    
    const link = this._collectionLinks[LinkRel.CREATE];
    const href = Array.isArray(link) ? link[0]?.href : link?.href;
    
    if (!href) {
      return of(Result.fail<Product, DomainError>({
        code: 'LINK_NOT_FOUND',
        message: 'Create link not found'
      }));
    }
    
    return this.api.followLinkWithPost<ProductDTO>(href, productData).pipe(
      map(result => {
        if (result.isSuccess) {
          const newProduct = Product.fromDTO(result.value as ProductDTO);
          this.state.addProduct(newProduct);
          return Result.ok<Product, DomainError>(newProduct);
        }
        return Result.fail<Product, DomainError>(result.error);
      })
    );
  }
  
  /**
   * Loads products by category
   */
  loadProductsByCategory(categoryId: string): Observable<Result<Product[], DomainError>> {
    return this.loadProducts({ categoryId });
  }
  
  /**
   * Searches products
   */
  searchProducts(query: string): Observable<Result<Product[], DomainError>> {
    return this.loadProducts({ search: query });
  }
  
  /**
   * Loads featured products
   */
  loadFeaturedProducts(): Observable<Result<Product[], DomainError>> {
    return this.api.get<ProductDTO[]>('products/featured').pipe(
      map(result => {
        if (result.isSuccess) {
          return Result.ok(result.value.map(dto => Product.fromDTO(dto)));
        }
        return Result.fail<Product[], DomainError>(result.error);
      })
    );
  }
  
  /**
   * Loads related products for a given product
   */
  loadRelatedProducts(productId: string): Observable<Result<Product[], DomainError>> {
    return this.api.get<ProductDTO[]>(`products/${productId}/related`).pipe(
      map(result => {
        if (result.isSuccess) {
          return Result.ok(result.value.map(dto => Product.fromDTO(dto)));
        }
        return Result.fail<Product[], DomainError>(result.error);
      })
    );
  }
  
  // ==========================================
  // Category Operations
  // ==========================================
  
  /**
   * Loads all categories
   */
  loadCategories(): Observable<Result<Category[], DomainError>> {
    this.state.setCategoriesLoading(true);
    
    return this.api.get<CategoryDTO[]>('categories').pipe(
      map(result => {
        if (result.isSuccess) {
          const categories = result.value.map(dto => Category.fromDTO(dto));
          this.state.setCategories(categories);
          return Result.ok<Category[], DomainError>(categories);
        }
        return Result.fail<Category[], DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setCategoriesLoading(false);
        return of(Result.fail<Category[], DomainError>({ 
          code: 'LOAD_ERROR', 
          message: 'Failed to load categories' 
        }));
      }),
      tap(() => this.state.setCategoriesLoading(false))
    );
  }
  
  /**
   * Loads a category by ID
   */
  loadCategory(categoryId: string): Observable<Result<Category, DomainError>> {
    return this.api.get<CategoryDTO>(`categories/${categoryId}`).pipe(
      map(result => {
        if (result.isSuccess) {
          const category = Category.fromDTO(result.value);
          this.state.selectCategory(category);
          return Result.ok(category);
        }
        return Result.fail<Category, DomainError>(result.error);
      })
    );
  }
  
  /**
   * Loads a category by slug
   */
  loadCategoryBySlug(slug: string): Observable<Result<Category, DomainError>> {
    return this.api.get<CategoryDTO>(`categories/slug/${slug}`).pipe(
      map(result => {
        if (result.isSuccess) {
          const category = Category.fromDTO(result.value);
          this.state.selectCategory(category);
          return Result.ok(category);
        }
        return Result.fail<Category, DomainError>(result.error);
      })
    );
  }
  
  // ==========================================
  // Filter Operations
  // ==========================================
  
  /**
   * Updates the current filter criteria
   */
  updateFilter(criteria: Partial<ProductFilterCriteria>): void {
    this.state.updateFilter(criteria);
  }
  
  /**
   * Clears all filters
   */
  clearFilters(): void {
    this.state.clearFilters();
  }
  
  /**
   * Sets the search term
   */
  setSearch(term: string): void {
    this.state.setSearch(term);
  }
  
  /**
   * Sets the sort option
   */
  setSortBy(option: ProductSortOption): void {
    this.state.setSortBy(option);
  }
  
  /**
   * Toggles a brand filter
   */
  toggleBrand(brand: string): void {
    this.state.toggleBrand(brand);
  }
  
  /**
   * Sets the price range filter
   */
  setPriceRange(min?: number, max?: number): void {
    this.state.setPriceRange(min, max);
  }
  
  /**
   * Selects a category for filtering
   */
  selectCategory(category: Category | null): void {
    this.state.selectCategory(category);
  }
  
  // ==========================================
  // Pagination Operations
  // ==========================================
  
  /**
   * Goes to the next page
   */
  nextPage(): void {
    this.state.nextPage();
  }
  
  /**
   * Goes to the previous page
   */
  previousPage(): void {
    this.state.previousPage();
  }
  
  /**
   * Goes to a specific page
   */
  goToPage(page: number): void {
    this.state.setPage(page);
  }
  
  /**
   * Sets the page size
   */
  setPageSize(size: number): void {
    this.state.setPageSize(size);
  }
  
  // ==========================================
  // Private Helpers
  // ==========================================
  
  private buildProductParams(criteria?: ProductFilterCriteria): Record<string, string> {
    const params: Record<string, string> = {};
    
    if (!criteria) return params;
    
    if (criteria.search) params['search'] = criteria.search;
    if (criteria.categoryId) params['categoryId'] = criteria.categoryId;
    if (criteria.minPrice !== undefined) params['minPrice'] = criteria.minPrice.toString();
    if (criteria.maxPrice !== undefined) params['maxPrice'] = criteria.maxPrice.toString();
    if (criteria.brands && criteria.brands.length > 0) params['brands'] = criteria.brands.join(',');
    if (criteria.tags && criteria.tags.length > 0) params['tags'] = criteria.tags.join(',');
    if (criteria.inStockOnly) params['inStock'] = 'true';
    if (criteria.onSaleOnly) params['onSale'] = 'true';
    if (criteria.rating !== undefined) params['minRating'] = criteria.rating.toString();
    if (criteria.sortBy) params['sortBy'] = criteria.sortBy;
    
    return params;
  }
}
