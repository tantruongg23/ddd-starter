import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';

import { CatalogState } from '../../../application/state/catalog.state';
import { CatalogService } from '../../../application/services/catalog.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';
import { ProductSortOption, Product } from '../../../domain/models/product.model';
import { ProductFilterCriteria } from '../../../domain/services/product-filter.service';

import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

/**
 * Product List Page Component
 * 
 * Main page for browsing products with filtering, sorting, and pagination.
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    PaginatorModule,
    SkeletonModule,
    ProductCardComponent,
    ProductFiltersComponent,
    SearchInputComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="product-list-page">
      <!-- Page Header -->
      <header class="page-header animate-slide-up">
        <div class="container">
          <div class="header-content">
            <div class="header-text">
              <h1 class="page-title">
                {{ selectedCategory()?.name || 'All Products' }}
              </h1>
              <p class="results-count">
                {{ filteredProducts().length }} products found
              </p>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="page-content">
        <div class="container">
          <div class="content-layout">
            <!-- Sidebar Filters -->
            <aside class="sidebar animate-slide-in stagger-1">
              <app-product-filters
                [filters]="filterCriteria()"
                [categories]="categories()"
                [brands]="availableBrands()"
                [priceRange]="priceRange()"
                (filterChange)="onFilterChange($event)"
                (clearFilters)="onClearFilters()"
              />
            </aside>
            
            <!-- Product Grid -->
            <section class="main-content">
              <!-- Toolbar -->
              <div class="toolbar animate-slide-up stagger-2">
                <div class="search-wrapper">
                  <app-search-input
                    [placeholder]="'Search products...'"
                    [initialValue]="filterCriteria().search ?? ''"
                    (search)="onSearch($event)"
                  />
                </div>
                
                <div class="toolbar-actions">
                  <div class="sort-wrapper">
                    <span class="sort-label">Sort by:</span>
                    <p-select 
                      [options]="sortOptions"
                      [(ngModel)]="selectedSort"
                      (onChange)="onSortChange($event.value)"
                      optionLabel="label"
                      optionValue="value"
                      styleClass="sort-dropdown"
                    />
                  </div>
                  
                  <div class="view-toggle">
                    <button 
                      type="button" 
                      class="view-btn"
                      [class.active]="viewMode() === 'grid'"
                      (click)="setViewMode('grid')"
                      aria-label="Grid view"
                    >
                      <i class="pi pi-th-large"></i>
                    </button>
                    <button 
                      type="button" 
                      class="view-btn"
                      [class.active]="viewMode() === 'list'"
                      (click)="setViewMode('list')"
                      aria-label="List view"
                    >
                      <i class="pi pi-list"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Active Filters -->
              @if (hasActiveFilters()) {
                <div class="active-filters animate-fade-in">
                  <span class="filters-label">Active filters:</span>
                  <span class="filter-summary">{{ filterSummary() }}</span>
                  <button 
                    type="button" 
                    class="clear-filters-btn"
                    (click)="onClearFilters()"
                  >
                    Clear all
                  </button>
                </div>
              }
              
              <!-- Loading State -->
              @if (isLoading()) {
                <div class="products-grid animate-fade-in">
                  @for (i of skeletonItems; track i) {
                    <div class="skeleton-card">
                      <p-skeleton height="200px" styleClass="mb-2" />
                      <p-skeleton width="60%" height="1rem" styleClass="mb-2" />
                      <p-skeleton width="80%" height="1.25rem" styleClass="mb-2" />
                      <p-skeleton width="40%" height="1rem" />
                    </div>
                  }
                </div>
              }
              
              <!-- Error State -->
              @else if (error()) {
                <app-empty-state
                  icon="pi-exclamation-circle"
                  [title]="'Oops! Something went wrong'"
                  [description]="error()!"
                  actionLabel="Try Again"
                  actionIcon="pi pi-refresh"
                  (actionClick)="loadProducts()"
                />
              }
              
              <!-- Empty State -->
              @else if (filteredProducts().length === 0) {
                <app-empty-state
                  icon="pi-search"
                  title="No products found"
                  description="Try adjusting your filters or search terms"
                  actionLabel="Clear Filters"
                  actionIcon="pi pi-filter-slash"
                  (actionClick)="onClearFilters()"
                />
              }
              
              <!-- Products Grid -->
              @else {
                <div class="products-grid" [class.list-view]="viewMode() === 'list'">
                  @for (product of paginatedProducts(); track product.id; let i = $index) {
                    <app-product-card
                      [product]="product"
                      [class]="'stagger-' + ((i % 5) + 1)"
                      (addToCart)="onAddToCart($event)"
                      (addToWishlist)="onAddToWishlist($event)"
                      (quickView)="onQuickView($event)"
                    />
                  }
                </div>
                
                <!-- Pagination -->
                @if (totalPages() > 1) {
                  <div class="pagination-wrapper">
                    <p-paginator
                      [rows]="pageSize()"
                      [totalRecords]="filteredProducts().length"
                      [first]="(currentPage() - 1) * pageSize()"
                      [rowsPerPageOptions]="[12, 24, 48]"
                      (onPageChange)="onPageChange($event)"
                    />
                  </div>
                }
              }
            </section>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .product-list-page {
      min-height: 100vh;
      background: var(--color-surface-alt);
    }

    .page-header {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
      padding: 2rem 0;
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 2rem;
      color: var(--color-text-inverse);
      margin: 0 0 0.25rem;
    }

    .results-count {
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .page-content {
      padding-bottom: 3rem;
    }

    .content-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
    }

    @media (max-width: 1024px) {
      .content-layout {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: none;
      }
    }

    .main-content {
      min-width: 0;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .search-wrapper {
      flex: 1;
      max-width: 400px;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sort-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }

    :host ::ng-deep .sort-dropdown {
      min-width: 180px;
    }

    .view-toggle {
      display: flex;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .view-btn {
      padding: 0.5rem 0.75rem;
      border: none;
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .view-btn:first-child {
      border-right: 1px solid var(--color-border);
    }

    .view-btn:hover {
      background: var(--color-surface-dark);
    }

    .view-btn.active {
      background: var(--color-primary);
      color: var(--color-text-inverse);
    }

    .active-filters {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--color-surface);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .filters-label {
      color: var(--color-text-muted);
    }

    .filter-summary {
      color: var(--color-text-primary);
      flex: 1;
    }

    .clear-filters-btn {
      background: none;
      border: none;
      color: var(--color-accent);
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0;
    }

    .clear-filters-btn:hover {
      text-decoration: underline;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .products-grid.list-view {
      grid-template-columns: 1fr;
    }

    .skeleton-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 1rem;
    }

    .pagination-wrapper {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
    }

    :host ::ng-deep .p-paginator {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
  `]
})
export class ProductListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly catalogState = inject(CatalogState);
  
  // State selectors
  readonly filteredProducts = this.catalogState.filteredProducts;
  readonly paginatedProducts = this.catalogState.paginatedProducts;
  readonly categories = this.catalogState.categories;
  readonly selectedCategory = this.catalogState.selectedCategory;
  readonly filterCriteria = this.catalogState.filterCriteria;
  readonly availableBrands = this.catalogState.availableBrands;
  readonly priceRange = this.catalogState.priceRange;
  readonly isLoading = this.catalogState.productsLoading;
  readonly error = this.catalogState.productsError;
  readonly currentPage = this.catalogState.currentPage;
  readonly pageSize = this.catalogState.pageSize;
  readonly totalPages = this.catalogState.totalPages;
  readonly hasActiveFilters = this.catalogState.hasActiveFilters;
  readonly filterSummary = this.catalogState.filterSummary;
  
  // Local state
  viewMode = signal<'grid' | 'list'>('grid');
  selectedSort: ProductSortOption = ProductSortOption.NEWEST;
  
  sortOptions = [
    { label: 'Newest', value: ProductSortOption.NEWEST },
    { label: 'Price: Low to High', value: ProductSortOption.PRICE_LOW },
    { label: 'Price: High to Low', value: ProductSortOption.PRICE_HIGH },
    { label: 'Best Rating', value: ProductSortOption.RATING },
    { label: 'Name: A-Z', value: ProductSortOption.NAME_ASC },
    { label: 'Most Popular', value: ProductSortOption.POPULARITY }
  ];
  
  skeletonItems = Array(12).fill(0);
  
  ngOnInit(): void {
    this.loadProducts();
    this.catalogService.loadCategories().subscribe();
  }
  
  loadProducts(): void {
    this.catalogService.loadProducts().subscribe();
  }
  
  onSearch(term: string): void {
    this.catalogService.setSearch(term);
  }
  
  onSortChange(sort: ProductSortOption): void {
    this.catalogService.setSortBy(sort);
  }
  
  onFilterChange(criteria: Partial<ProductFilterCriteria>): void {
    this.catalogService.updateFilter(criteria);
  }
  
  onClearFilters(): void {
    this.catalogService.clearFilters();
  }
  
  onPageChange(event: { first?: number; rows?: number }): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor(first / rows) + 1;
    this.catalogState.setPage(page);
    this.catalogState.setPageSize(rows);
  }
  
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
  
  onAddToCart(product: Product): void {
    // TODO: Integrate with cart service
    console.log('Add to cart:', product.name);
  }
  
  onAddToWishlist(product: Product): void {
    // TODO: Integrate with wishlist service
    console.log('Add to wishlist:', product.name);
  }
  
  onQuickView(product: Product): void {
    // TODO: Open quick view modal
    console.log('Quick view:', product.name);
  }
}
