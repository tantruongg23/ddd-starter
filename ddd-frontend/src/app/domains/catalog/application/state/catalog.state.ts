import { Injectable, signal, computed, inject } from '@angular/core';
import { Product, ProductSortOption } from '../../domain/models/product.model';
import { Category } from '../../domain/models/category.model';
import { ProductFilterCriteria, ProductFilterService } from '../../domain/services/product-filter.service';

/**
 * Catalog State
 * 
 * Signal-based state management for the catalog domain.
 * Follows the store pattern with clear separation of concerns.
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogState {
  private readonly filterService = inject(ProductFilterService);
  
  // ==========================================
  // State Signals
  // ==========================================
  
  // Products
  private readonly _products = signal<Product[]>([]);
  private readonly _selectedProduct = signal<Product | null>(null);
  private readonly _productsLoading = signal<boolean>(false);
  private readonly _productsError = signal<string | null>(null);
  
  // Categories
  private readonly _categories = signal<Category[]>([]);
  private readonly _selectedCategory = signal<Category | null>(null);
  private readonly _categoriesLoading = signal<boolean>(false);
  
  // Filters
  private readonly _filterCriteria = signal<ProductFilterCriteria>({
    sortBy: ProductSortOption.NEWEST
  });
  
  // Pagination
  private readonly _currentPage = signal<number>(1);
  private readonly _pageSize = signal<number>(12);
  private readonly _totalItems = signal<number>(0);
  
  // ==========================================
  // Public Read-only Selectors
  // ==========================================
  
  // Products
  readonly products = this._products.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly productsLoading = this._productsLoading.asReadonly();
  readonly productsError = this._productsError.asReadonly();
  
  // Categories
  readonly categories = this._categories.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly categoriesLoading = this._categoriesLoading.asReadonly();
  
  // Filters
  readonly filterCriteria = this._filterCriteria.asReadonly();
  
  // Pagination
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalItems = this._totalItems.asReadonly();
  
  // ==========================================
  // Computed Selectors
  // ==========================================
  
  /**
   * Filtered and sorted products based on current criteria
   */
  readonly filteredProducts = computed(() => {
    const products = this._products();
    const criteria = this._filterCriteria();
    return this.filterService.filter(products, criteria);
  });
  
  /**
   * Paginated products for current page
   */
  readonly paginatedProducts = computed(() => {
    const filtered = this.filteredProducts();
    const page = this._currentPage();
    const size = this._pageSize();
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });
  
  /**
   * Total pages based on filtered products
   */
  readonly totalPages = computed(() => {
    const total = this._totalItems() || this.filteredProducts().length;
    const size = this._pageSize();
    return Math.ceil(total / size);
  });
  
  /**
   * Whether there are more pages
   */
  readonly hasNextPage = computed(() => {
    return this._currentPage() < this.totalPages();
  });
  
  /**
   * Whether there is a previous page
   */
  readonly hasPreviousPage = computed(() => {
    return this._currentPage() > 1;
  });
  
  /**
   * Available brands from loaded products
   */
  readonly availableBrands = computed(() => {
    return this.filterService.extractBrands(this._products());
  });
  
  /**
   * Price range from loaded products
   */
  readonly priceRange = computed(() => {
    return this.filterService.extractPriceRange(this._products());
  });
  
  /**
   * Available tags from loaded products
   */
  readonly availableTags = computed(() => {
    return this.filterService.extractTags(this._products());
  });
  
  /**
   * Root categories only
   */
  readonly rootCategories = computed(() => {
    return this._categories().filter(c => c.isRootCategory);
  });
  
  /**
   * Featured products (highest rated)
   */
  readonly featuredProducts = computed(() => {
    return this.filterService.sort(this._products(), ProductSortOption.RATING).slice(0, 8);
  });
  
  /**
   * On sale products
   */
  readonly onSaleProducts = computed(() => {
    return this._products().filter(p => p.isOnSale);
  });
  
  /**
   * New arrivals (newest products)
   */
  readonly newArrivals = computed(() => {
    return this.filterService.sort(this._products(), ProductSortOption.NEWEST).slice(0, 8);
  });
  
  /**
   * Current filter summary
   */
  readonly filterSummary = computed(() => {
    const criteria = this._filterCriteria();
    const parts: string[] = [];
    
    if (criteria.search) {
      parts.push(`Search: "${criteria.search}"`);
    }
    if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
      parts.push(`Price: $${criteria.minPrice ?? 0} - $${criteria.maxPrice ?? '∞'}`);
    }
    if (criteria.brands && criteria.brands.length > 0) {
      parts.push(`Brands: ${criteria.brands.join(', ')}`);
    }
    if (criteria.inStockOnly) {
      parts.push('In Stock');
    }
    if (criteria.onSaleOnly) {
      parts.push('On Sale');
    }
    
    return parts.join(' • ');
  });
  
  /**
   * Whether any filters are active
   */
  readonly hasActiveFilters = computed(() => {
    const criteria = this._filterCriteria();
    return !!(
      criteria.search ||
      criteria.categoryId ||
      criteria.minPrice !== undefined ||
      criteria.maxPrice !== undefined ||
      (criteria.brands && criteria.brands.length > 0) ||
      (criteria.tags && criteria.tags.length > 0) ||
      criteria.inStockOnly ||
      criteria.onSaleOnly ||
      criteria.rating
    );
  });
  
  // ==========================================
  // Actions (State Mutators)
  // ==========================================
  
  /**
   * Sets the products list
   */
  setProducts(products: Product[]): void {
    this._products.set(products);
    this._totalItems.set(products.length);
  }
  
  /**
   * Adds products to the existing list (for pagination)
   */
  appendProducts(products: Product[]): void {
    this._products.update(current => [...current, ...products]);
  }
  
  /**
   * Adds a single product to the list
   */
  addProduct(product: Product): void {
    this._products.update(current => [product, ...current]);
    this._totalItems.update(total => total + 1);
  }
  
  /**
   * Updates an existing product in the list
   */
  updateProduct(product: Product): void {
    this._products.update(current => 
      current.map(p => p.id === product.id ? product : p)
    );
    // Also update selected product if it's the same
    if (this._selectedProduct()?.id === product.id) {
      this._selectedProduct.set(product);
    }
  }
  
  /**
   * Removes a product from the list by ID
   */
  removeProduct(productId: string): void {
    this._products.update(current => 
      current.filter(p => p.id !== productId)
    );
    this._totalItems.update(total => Math.max(0, total - 1));
    // Clear selection if removed product was selected
    if (this._selectedProduct()?.id === productId) {
      this._selectedProduct.set(null);
    }
  }
  
  /**
   * Sets the selected product
   */
  selectProduct(product: Product | null): void {
    this._selectedProduct.set(product);
  }
  
  /**
   * Sets products loading state
   */
  setProductsLoading(loading: boolean): void {
    this._productsLoading.set(loading);
    if (loading) {
      this._productsError.set(null);
    }
  }
  
  /**
   * Sets products error state
   */
  setProductsError(error: string | null): void {
    this._productsError.set(error);
    this._productsLoading.set(false);
  }
  
  /**
   * Sets the categories list
   */
  setCategories(categories: Category[]): void {
    this._categories.set(categories);
  }
  
  /**
   * Sets the selected category
   */
  selectCategory(category: Category | null): void {
    this._selectedCategory.set(category);
    if (category) {
      this.updateFilter({ categoryId: category.id });
    } else {
      this.updateFilter({ categoryId: undefined });
    }
  }
  
  /**
   * Sets categories loading state
   */
  setCategoriesLoading(loading: boolean): void {
    this._categoriesLoading.set(loading);
  }
  
  /**
   * Updates filter criteria
   */
  updateFilter(criteria: Partial<ProductFilterCriteria>): void {
    this._filterCriteria.update(current => ({
      ...current,
      ...criteria
    }));
    // Reset to first page when filters change
    this._currentPage.set(1);
  }
  
  /**
   * Clears all filters
   */
  clearFilters(): void {
    this._filterCriteria.set({
      sortBy: this._filterCriteria().sortBy // Keep sort option
    });
    this._currentPage.set(1);
  }
  
  /**
   * Sets the search term
   */
  setSearch(search: string): void {
    this.updateFilter({ search: search || undefined });
  }
  
  /**
   * Sets the sort option
   */
  setSortBy(sortBy: ProductSortOption): void {
    this.updateFilter({ sortBy });
  }
  
  /**
   * Sets the price range
   */
  setPriceRange(minPrice?: number, maxPrice?: number): void {
    this.updateFilter({ minPrice, maxPrice });
  }
  
  /**
   * Toggles a brand filter
   */
  toggleBrand(brand: string): void {
    const current = this._filterCriteria().brands ?? [];
    const brands = current.includes(brand)
      ? current.filter(b => b !== brand)
      : [...current, brand];
    this.updateFilter({ brands: brands.length > 0 ? brands : undefined });
  }
  
  /**
   * Sets the current page
   */
  setPage(page: number): void {
    this._currentPage.set(page);
  }
  
  /**
   * Goes to next page
   */
  nextPage(): void {
    if (this.hasNextPage()) {
      this._currentPage.update(p => p + 1);
    }
  }
  
  /**
   * Goes to previous page
   */
  previousPage(): void {
    if (this.hasPreviousPage()) {
      this._currentPage.update(p => p - 1);
    }
  }
  
  /**
   * Sets page size
   */
  setPageSize(size: number): void {
    this._pageSize.set(size);
    this._currentPage.set(1);
  }
  
  /**
   * Sets total items (for server-side pagination)
   */
  setTotalItems(total: number): void {
    this._totalItems.set(total);
  }
  
  /**
   * Resets all state
   */
  reset(): void {
    this._products.set([]);
    this._selectedProduct.set(null);
    this._productsLoading.set(false);
    this._productsError.set(null);
    this._categories.set([]);
    this._selectedCategory.set(null);
    this._categoriesLoading.set(false);
    this._filterCriteria.set({ sortBy: ProductSortOption.NEWEST });
    this._currentPage.set(1);
    this._pageSize.set(12);
    this._totalItems.set(0);
  }
}
