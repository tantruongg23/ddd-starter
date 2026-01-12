import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

import { CatalogState } from '../../../application/state/catalog.state';
import { CatalogService } from '../../../application/services/catalog.service';
import { PriceDisplayComponent } from '@shared/components/price-display/price-display.component';
import { RatingStarsComponent } from '@shared/components/rating-stars/rating-stars.component';
import { QuantitySelectorComponent } from '@shared/components/quantity-selector/quantity-selector.component';

/**
 * Product Detail Page Component
 * 
 * Displays detailed information about a single product.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    GalleriaModule,
    ButtonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    DividerModule,
    TagModule,
    SkeletonModule,
    BreadcrumbModule,
    PriceDisplayComponent,
    RatingStarsComponent,
    QuantitySelectorComponent
  ],
  template: `
    <div class="product-detail-page">
      @if (isLoading()) {
        <!-- Loading Skeleton -->
        <div class="container">
          <div class="product-skeleton">
            <div class="skeleton-gallery">
              <p-skeleton height="500px" />
            </div>
            <div class="skeleton-info">
              <p-skeleton width="30%" height="1rem" styleClass="mb-3" />
              <p-skeleton width="80%" height="2rem" styleClass="mb-3" />
              <p-skeleton width="40%" height="1.5rem" styleClass="mb-4" />
              <p-skeleton width="60%" height="1rem" styleClass="mb-2" />
              <p-skeleton width="100%" height="4rem" styleClass="mb-4" />
              <p-skeleton width="50%" height="2.5rem" />
            </div>
          </div>
        </div>
      } @else if (product(); as prod) {
        <!-- Breadcrumb -->
        <div class="breadcrumb-wrapper animate-fade-in">
          <div class="container">
            <p-breadcrumb [model]="breadcrumbItems()" [home]="homeItem" />
          </div>
        </div>
        
        <!-- Product Content -->
        <div class="container">
          <div class="product-content">
            <!-- Gallery Section -->
            <div class="product-gallery animate-slide-up">
              <p-galleria 
                [value]="galleryImages()" 
                [responsiveOptions]="galleryResponsiveOptions"
                [showItemNavigators]="true"
                [showThumbnails]="true"
                [showIndicators]="false"
                [circular]="true"
              >
                <ng-template pTemplate="item" let-item>
                  <img [src]="item.url" [alt]="item.alt" class="gallery-image" />
                </ng-template>
                <ng-template pTemplate="thumbnail" let-item>
                  <img [src]="item.url" [alt]="item.alt" class="thumbnail-image" />
                </ng-template>
              </p-galleria>
            </div>
            
            <!-- Info Section -->
            <div class="product-info animate-slide-up stagger-1">
              <!-- Brand & Tags -->
              <div class="product-meta">
                @if (prod.brand) {
                  <span class="product-brand">{{ prod.brand }}</span>
                }
                @if (prod.isOnSale) {
                  <p-tag severity="danger" value="Sale" />
                }
                @if (!prod.isInStock) {
                  <p-tag severity="secondary" value="Out of Stock" />
                }
              </div>
              
              <!-- Name -->
              <h1 class="product-name">{{ prod.name }}</h1>
              
              <!-- Rating -->
              <div class="product-rating">
                <app-rating-stars 
                  [rating]="prod.rating.average"
                  [reviewCount]="prod.rating.count"
                  [showValue]="true"
                />
              </div>
              
              <!-- Price -->
              <div class="product-price">
                <app-price-display
                  [price]="prod.price.amount"
                  [originalPrice]="prod.originalPrice?.amount ?? null"
                  [salePrice]="prod.isOnSale ? prod.price.amount : null"
                  [currency]="prod.price.currency"
                  size="lg"
                />
                @if (prod.isOnSale) {
                  <span class="savings">
                    You save {{ prod.price.currency }} {{ savingsAmount() | number:'1.2-2' }}
                  </span>
                }
              </div>
              
              <p-divider />
              
              <!-- Short Description -->
              <p class="product-short-desc">
                {{ prod.description | slice:0:200 }}{{ prod.description.length > 200 ? '...' : '' }}
              </p>
              
              <!-- Key Attributes -->
              @if (prod.attributes.length > 0) {
                <ul class="product-highlights">
                  @for (attr of prod.attributes.slice(0, 4); track attr.name) {
                    <li>
                      <strong>{{ attr.name }}:</strong> {{ attr.value }}{{ attr.unit ? ' ' + attr.unit : '' }}
                    </li>
                  }
                </ul>
              }
              
              <!-- Purchase Section -->
              <div class="purchase-section">
                <div class="quantity-row">
                  <span class="quantity-label">Quantity:</span>
                  <app-quantity-selector
                    [quantity]="quantity()"
                    [max]="prod.stock.value"
                    [disabled]="!prod.isInStock"
                    (quantityChange)="onQuantityChange($event)"
                  />
                  <span class="stock-info">
                    @if (prod.isInStock) {
                      {{ prod.stock.value }} available
                    } @else {
                      Out of stock
                    }
                  </span>
                </div>
                
                <div class="action-buttons">
                  <p-button 
                    label="Add to Cart" 
                    icon="pi pi-shopping-cart"
                    [disabled]="!prod.isInStock"
                    (onClick)="addToCart()"
                    styleClass="add-to-cart-btn"
                  />
                  <p-button 
                    label="Buy Now" 
                    icon="pi pi-bolt"
                    [disabled]="!prod.isInStock"
                    (onClick)="buyNow()"
                    severity="secondary"
                    styleClass="buy-now-btn"
                  />
                  <button 
                    type="button" 
                    class="wishlist-btn"
                    (click)="addToWishlist()"
                    aria-label="Add to wishlist"
                  >
                    <i class="pi pi-heart"></i>
                  </button>
                </div>
              </div>
              
              <!-- SKU -->
              <p class="product-sku">
                <span>SKU:</span> {{ prod.sku }}
              </p>
            </div>
          </div>
          
          <!-- Tabs Section -->
          <div class="product-tabs animate-slide-up stagger-2">
            <p-tabs value="0">
              <p-tablist>
                <p-tab value="0">Description</p-tab>
                <p-tab value="1">Specifications</p-tab>
                <p-tab value="2">Reviews ({{ prod.rating.count }})</p-tab>
              </p-tablist>
              <p-tabpanels>
                <p-tabpanel value="0">
                  <div class="tab-content">
                    <p>{{ prod.description }}</p>
                  </div>
                </p-tabpanel>
                <p-tabpanel value="1">
                  <div class="tab-content">
                    @if (prod.attributes.length > 0) {
                      <table class="specs-table">
                        <tbody>
                          @for (attr of prod.attributes; track attr.name) {
                            <tr>
                              <th>{{ attr.name }}</th>
                              <td>{{ attr.value }}{{ attr.unit ? ' ' + attr.unit : '' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    } @else {
                      <p class="no-specs">No specifications available.</p>
                    }
                  </div>
                </p-tabpanel>
                <p-tabpanel value="2">
                  <div class="tab-content">
                    <div class="reviews-summary">
                      <div class="average-rating">
                        <span class="rating-number">{{ prod.rating.average.toFixed(1) }}</span>
                        <app-rating-stars 
                          [rating]="prod.rating.average"
                          [showCount]="false"
                        />
                        <span class="total-reviews">Based on {{ prod.rating.count }} reviews</span>
                      </div>
                    </div>
                    <p class="reviews-placeholder">Review functionality coming soon...</p>
                  </div>
                </p-tabpanel>
              </p-tabpanels>
            </p-tabs>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-detail-page {
      min-height: 100vh;
      background: var(--color-surface-alt);
      padding-bottom: 3rem;
    }

    .breadcrumb-wrapper {
      background: var(--color-surface);
      padding: 1rem 0;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    @media (max-width: 1024px) {
      .product-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Gallery */
    .product-gallery {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 1rem;
      box-shadow: var(--shadow-md);
    }

    .gallery-image {
      width: 100%;
      height: auto;
      max-height: 500px;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }

    .thumbnail-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--radius-md);
    }

    /* Product Info */
    .product-info {
      display: flex;
      flex-direction: column;
    }

    .product-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .product-brand {
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-accent);
    }

    .product-name {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.3;
      color: var(--color-text-primary);
      margin: 0 0 0.75rem;
    }

    .product-rating {
      margin-bottom: 1rem;
    }

    .product-price {
      margin-bottom: 1rem;
    }

    .savings {
      display: block;
      font-size: 0.875rem;
      color: var(--color-success);
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .product-short-desc {
      color: var(--color-text-secondary);
      line-height: 1.7;
      margin: 0 0 1rem;
    }

    .product-highlights {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem;
    }

    .product-highlights li {
      padding: 0.375rem 0;
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
    }

    .product-highlights li::before {
      content: '✓';
      color: var(--color-success);
      margin-right: 0.5rem;
      font-weight: bold;
    }

    /* Purchase Section */
    .purchase-section {
      background: var(--color-surface-alt);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .quantity-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .quantity-label {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .stock-info {
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
    }

    :host ::ng-deep .add-to-cart-btn {
      flex: 1;
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-primary);
    }

    :host ::ng-deep .add-to-cart-btn:hover {
      background: var(--color-accent-dark);
      border-color: var(--color-accent-dark);
    }

    :host ::ng-deep .buy-now-btn {
      flex: 1;
    }

    .wishlist-btn {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .wishlist-btn:hover {
      border-color: var(--color-danger);
      color: var(--color-danger);
    }

    .product-sku {
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .product-sku span {
      color: var(--color-text-secondary);
    }

    /* Tabs */
    .product-tabs {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
    }

    .tab-content {
      padding: 1rem 0;
    }

    .specs-table {
      width: 100%;
      border-collapse: collapse;
    }

    .specs-table tr {
      border-bottom: 1px solid var(--color-border);
    }

    .specs-table th,
    .specs-table td {
      padding: 0.75rem 0;
      text-align: left;
    }

    .specs-table th {
      width: 40%;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .specs-table td {
      color: var(--color-text-primary);
    }

    .no-specs {
      color: var(--color-text-muted);
      font-style: italic;
    }

    .reviews-summary {
      margin-bottom: 1.5rem;
    }

    .average-rating {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rating-number {
      font-size: 3rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .total-reviews {
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .reviews-placeholder {
      color: var(--color-text-muted);
      font-style: italic;
    }

    /* Skeleton */
    .product-skeleton {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    .skeleton-gallery,
    .skeleton-info {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly catalogState = inject(CatalogState);
  
  // State selectors
  readonly product = this.catalogState.selectedProduct;
  readonly isLoading = this.catalogState.productsLoading;
  
  // Local state
  quantity = signal(1);
  
  // Computed
  savingsAmount = computed(() => {
    const prod = this.product();
    if (!prod || !prod.originalPrice) return 0;
    return prod.originalPrice.amount - prod.price.amount;
  });
  
  galleryImages = computed(() => {
    const prod = this.product();
    if (!prod) return [];
    return prod.images.map(img => ({
      url: img.url,
      alt: img.alt
    }));
  });
  
  breadcrumbItems = computed((): MenuItem[] => {
    const prod = this.product();
    return [
      { label: 'Products', routerLink: '/products' },
      { label: prod?.name ?? 'Loading...' }
    ];
  });
  
  homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  
  galleryResponsiveOptions = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];
  
  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.catalogService.loadProduct(productId).subscribe();
    }
  }
  
  onQuantityChange(qty: number): void {
    this.quantity.set(qty);
  }
  
  addToCart(): void {
    const prod = this.product();
    if (prod) {
      console.log('Add to cart:', prod.name, 'Qty:', this.quantity());
      // TODO: Integrate with cart service
    }
  }
  
  buyNow(): void {
    const prod = this.product();
    if (prod) {
      console.log('Buy now:', prod.name, 'Qty:', this.quantity());
      // TODO: Add to cart and navigate to checkout
    }
  }
  
  addToWishlist(): void {
    const prod = this.product();
    if (prod) {
      console.log('Add to wishlist:', prod.name);
      // TODO: Integrate with wishlist service
    }
  }
}
