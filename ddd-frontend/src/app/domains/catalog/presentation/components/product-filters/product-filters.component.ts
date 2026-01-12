import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { Slider } from 'primeng/slider';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Category } from '../../../domain/models/category.model';
import { ProductFilterCriteria } from '../../../domain/services/product-filter.service';
import { RatingStarsComponent } from '@shared/components/rating-stars/rating-stars.component';

/**
 * Product Filters Component
 * 
 * Sidebar component for filtering products.
 */
@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Checkbox,
    Slider,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    ButtonModule,
    RatingStarsComponent
  ],
  template: `
    <aside class="product-filters">
      <!-- Filter Header -->
      <div class="filters-header">
        <h3 class="filters-title">Filters</h3>
        @if (hasActiveFilters()) {
          <button 
            type="button" 
            class="clear-btn"
            (click)="onClearFilters()"
          >
            Clear All
          </button>
        }
      </div>
      
      <p-accordion [multiple]="true" [value]="['0', '1', '2']">
        <!-- Categories -->
        @if (categories().length > 0) {
          <p-accordion-panel value="0">
            <p-accordion-header>Categories</p-accordion-header>
            <p-accordion-content>
              <ul class="category-list">
                @for (category of categories(); track category.id) {
                  <li class="category-item">
                    <button
                      type="button"
                      class="category-btn"
                      [class.active]="filters().categoryId === category.id"
                      (click)="onCategorySelect(category)"
                    >
                      {{ category.name }}
                      <span class="category-count">({{ category.productCount }})</span>
                    </button>
                  </li>
                }
              </ul>
            </p-accordion-content>
          </p-accordion-panel>
        }
        
        <!-- Price Range -->
        <p-accordion-panel value="1">
          <p-accordion-header>Price Range</p-accordion-header>
          <p-accordion-content>
            <div class="price-range-filter">
              <div class="price-inputs">
                <div class="price-input-group">
                  <label for="minPrice">Min</label>
                  <input 
                    id="minPrice"
                    type="number" 
                    [value]="filters().minPrice ?? priceRange().min"
                    (change)="onMinPriceChange($event)"
                    class="price-input"
                  />
                </div>
                <span class="price-separator">-</span>
                <div class="price-input-group">
                  <label for="maxPrice">Max</label>
                  <input 
                    id="maxPrice"
                    type="number" 
                    [value]="filters().maxPrice ?? priceRange().max"
                    (change)="onMaxPriceChange($event)"
                    class="price-input"
                  />
                </div>
              </div>
              <p-slider 
                [(ngModel)]="priceRangeValue" 
                [range]="true" 
                [min]="priceRange().min"
                [max]="priceRange().max"
                [step]="1"
                (onSlideEnd)="onPriceRangeChange()"
                styleClass="price-slider"
              />
            </div>
          </p-accordion-content>
        </p-accordion-panel>
        
        <!-- Brands -->
        @if (brands().length > 0) {
          <p-accordion-panel value="2">
            <p-accordion-header>Brands</p-accordion-header>
            <p-accordion-content>
              <ul class="brand-list">
                @for (brand of brands(); track brand) {
                  <li class="brand-item">
                    <label class="brand-label">
                      <p-checkbox 
                        [value]="brand"
                        [ngModel]="isBrandSelected(brand)"
                        (ngModelChange)="onBrandToggle(brand)"
                        [binary]="true"
                      />
                      <span>{{ brand }}</span>
                    </label>
                  </li>
                }
              </ul>
            </p-accordion-content>
          </p-accordion-panel>
        }
        
        <!-- Rating -->
        <p-accordion-panel value="3">
          <p-accordion-header>Rating</p-accordion-header>
          <p-accordion-content>
            <ul class="rating-list">
              @for (rating of [4, 3, 2, 1]; track rating) {
                <li class="rating-item">
                  <button
                    type="button"
                    class="rating-btn"
                    [class.active]="filters().rating === rating"
                    (click)="onRatingSelect(rating)"
                  >
                    <app-rating-stars 
                      [rating]="rating" 
                      [showCount]="false"
                    />
                    <span class="rating-label">& Up</span>
                  </button>
                </li>
              }
            </ul>
          </p-accordion-content>
        </p-accordion-panel>
        
        <!-- Availability -->
        <p-accordion-panel value="4">
          <p-accordion-header>Availability</p-accordion-header>
          <p-accordion-content>
            <div class="availability-filters">
              <label class="filter-checkbox">
                <p-checkbox 
                  [ngModel]="filters().inStockOnly ?? false"
                  (ngModelChange)="onInStockChange($event)"
                  [binary]="true"
                />
                <span>In Stock Only</span>
              </label>
              <label class="filter-checkbox">
                <p-checkbox 
                  [ngModel]="filters().onSaleOnly ?? false"
                  (ngModelChange)="onSaleChange($event)"
                  [binary]="true"
                />
                <span>On Sale</span>
              </label>
            </div>
          </p-accordion-content>
        </p-accordion-panel>
      </p-accordion>
    </aside>
  `,
  styles: [`
    .product-filters {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border);
    }

    .filters-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .clear-btn {
      background: none;
      border: none;
      color: var(--color-accent);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
    }

    .clear-btn:hover {
      color: var(--color-accent-dark);
      text-decoration: underline;
    }

    /* Categories */
    .category-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .category-item {
      margin-bottom: 0.25rem;
    }

    .category-btn {
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-btn:hover {
      background: var(--color-surface-dark);
      color: var(--color-text-primary);
    }

    .category-btn.active {
      background: var(--color-accent);
      color: var(--color-primary);
      font-weight: 500;
    }

    .category-count {
      font-size: 0.8125rem;
      opacity: 0.7;
    }

    /* Price Range */
    .price-range-filter {
      padding: 0.5rem 0;
    }

    .price-inputs {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .price-input-group {
      flex: 1;
    }

    .price-input-group label {
      display: block;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 0.25rem;
    }

    .price-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .price-input:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .price-separator {
      color: var(--color-text-muted);
      padding-bottom: 0.5rem;
    }

    :host ::ng-deep .price-slider .p-slider-range {
      background: var(--color-accent);
    }

    :host ::ng-deep .price-slider .p-slider-handle {
      border-color: var(--color-accent);
    }

    /* Brands */
    .brand-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .brand-item {
      margin-bottom: 0.5rem;
    }

    .brand-label,
    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    /* Rating */
    .rating-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .rating-item {
      margin-bottom: 0.5rem;
    }

    .rating-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      padding: 0.375rem 0.5rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      width: 100%;
      transition: all var(--transition-fast);
    }

    .rating-btn:hover {
      background: var(--color-surface-dark);
    }

    .rating-btn.active {
      background: var(--color-surface-dark);
    }

    .rating-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    /* Availability */
    .availability-filters {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  `]
})
export class ProductFiltersComponent {
  filters = input.required<ProductFilterCriteria>();
  categories = input<Category[]>([]);
  brands = input<string[]>([]);
  priceRange = input<{ min: number; max: number }>({ min: 0, max: 1000 });
  
  filterChange = output<Partial<ProductFilterCriteria>>();
  clearFilters = output<void>();
  
  priceRangeValue: number[] = [0, 1000];
  
  hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(
      f.categoryId ||
      f.minPrice !== undefined ||
      f.maxPrice !== undefined ||
      (f.brands && f.brands.length > 0) ||
      f.inStockOnly ||
      f.onSaleOnly ||
      f.rating
    );
  });
  
  constructor() {
    // Initialize price range value
    const range = this.priceRange();
    this.priceRangeValue = [range.min, range.max];
  }
  
  isBrandSelected(brand: string): boolean {
    return (this.filters().brands ?? []).includes(brand);
  }
  
  onCategorySelect(category: Category): void {
    const currentCategoryId = this.filters().categoryId;
    this.filterChange.emit({ 
      categoryId: currentCategoryId === category.id ? undefined : category.id 
    });
  }
  
  onMinPriceChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.filterChange.emit({ minPrice: isNaN(value) ? undefined : value });
  }
  
  onMaxPriceChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.filterChange.emit({ maxPrice: isNaN(value) ? undefined : value });
  }
  
  onPriceRangeChange(): void {
    this.filterChange.emit({
      minPrice: this.priceRangeValue[0],
      maxPrice: this.priceRangeValue[1]
    });
  }
  
  onBrandToggle(brand: string): void {
    const currentBrands = this.filters().brands ?? [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    this.filterChange.emit({ brands: newBrands.length > 0 ? newBrands : undefined });
  }
  
  onRatingSelect(rating: number): void {
    const currentRating = this.filters().rating;
    this.filterChange.emit({ 
      rating: currentRating === rating ? undefined : rating 
    });
  }
  
  onInStockChange(checked: boolean): void {
    this.filterChange.emit({ inStockOnly: checked || undefined });
  }
  
  onSaleChange(checked: boolean): void {
    this.filterChange.emit({ onSaleOnly: checked || undefined });
  }
  
  onClearFilters(): void {
    this.clearFilters.emit();
  }
}
