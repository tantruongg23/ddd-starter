import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Product } from '../../../domain/models/product.model';
import { PriceDisplayComponent } from '@shared/components/price-display/price-display.component';
import { RatingStarsComponent } from '@shared/components/rating-stars/rating-stars.component';
import { LazyImageDirective } from '@shared/directives/lazy-image.directive';

/**
 * Product Card Component
 * 
 * Displays a product in a card format for grid/list views.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ButtonModule, 
    TagModule,
    PriceDisplayComponent,
    RatingStarsComponent,
    LazyImageDirective
  ],
  template: `
    <article class="product-card animate-slide-up" [class.out-of-stock]="!product().isInStock">
      <!-- Image Section -->
      <div class="product-image-wrapper">
        <a [routerLink]="['/products', product().id]" class="product-image-link">
          <img 
            appLazyImage
            [lazySrc]="product().primaryImage?.url || '/assets/images/placeholder-product.png'"
            [alt]="product().name"
            class="product-image"
          />
        </a>
        
        <!-- Badges -->
        <div class="product-badges">
          @if (product().isOnSale) {
            <p-tag severity="danger" value="-{{ product().discountPercentage }}%" />
          }
          @if (!product().isInStock) {
            <p-tag severity="secondary" value="Out of Stock" />
          }
        </div>
        
        <!-- Quick Actions -->
        <div class="product-actions">
          <button 
            type="button" 
            class="action-btn" 
            (click)="onAddToCart()"
            [disabled]="!product().isInStock"
            aria-label="Add to cart"
          >
            <i class="pi pi-shopping-cart"></i>
          </button>
          <button 
            type="button" 
            class="action-btn" 
            (click)="onAddToWishlist()"
            aria-label="Add to wishlist"
          >
            <i class="pi pi-heart"></i>
          </button>
          <button 
            type="button" 
            class="action-btn" 
            (click)="onQuickView()"
            aria-label="Quick view"
          >
            <i class="pi pi-eye"></i>
          </button>
        </div>
      </div>
      
      <!-- Content Section -->
      <div class="product-content">
        @if (product().brand) {
          <span class="product-brand">{{ product().brand }}</span>
        }
        
        <h3 class="product-name">
          <a [routerLink]="['/products', product().id]">{{ product().name }}</a>
        </h3>
        
        <app-rating-stars 
          [rating]="product().rating.average"
          [reviewCount]="product().rating.count"
          [showCount]="true"
        />
        
        <div class="product-price-row">
          <app-price-display
            [price]="product().price.amount"
            [originalPrice]="product().originalPrice?.amount ?? null"
            [salePrice]="product().isOnSale ? product().price.amount : null"
            [currency]="product().price.currency"
          />
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-sm);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
    }

    .product-card.out-of-stock {
      opacity: 0.7;
    }

    .product-image-wrapper {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--color-surface-dark);
    }

    .product-image-link {
      display: block;
      width: 100%;
      height: 100%;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .product-card:hover .product-image {
      transform: scale(1.05);
    }

    .product-badges {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .product-actions {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      opacity: 0;
      transition: all var(--transition-normal);
    }

    .product-card:hover .product-actions {
      opacity: 1;
    }

    .action-btn {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      border: none;
      background: var(--color-surface);
      color: var(--color-text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-fast);
      transform: translateX(20px);
    }

    .product-card:hover .action-btn {
      transform: translateX(0);
    }

    .action-btn:nth-child(2) { transition-delay: 50ms; }
    .action-btn:nth-child(3) { transition-delay: 100ms; }

    .action-btn:hover:not(:disabled) {
      background: var(--color-accent);
      color: var(--color-primary);
    }

    .action-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .action-btn i {
      font-size: 0.9375rem;
    }

    .product-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      flex-grow: 1;
    }

    .product-brand {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .product-name {
      font-size: 0.9375rem;
      font-weight: 600;
      line-height: 1.4;
      margin: 0;
    }

    .product-name a {
      color: var(--color-text-primary);
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-name a:hover {
      color: var(--color-accent);
    }

    .product-price-row {
      margin-top: auto;
      padding-top: 0.5rem;
    }
  `]
})
export class ProductCardComponent {
  product = input.required<Product>();
  
  addToCart = output<Product>();
  addToWishlist = output<Product>();
  quickView = output<Product>();
  
  onAddToCart(): void {
    if (this.product().isInStock) {
      this.addToCart.emit(this.product());
    }
  }
  
  onAddToWishlist(): void {
    this.addToWishlist.emit(this.product());
  }
  
  onQuickView(): void {
    this.quickView.emit(this.product());
  }
}
