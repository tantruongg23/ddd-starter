import { Component, input, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

/**
 * Price Display Component
 * 
 * Displays product prices with support for original/sale prices.
 */
@Component({
  selector: 'app-price-display',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="price-display" [class.has-sale]="hasSalePrice()">
      @if (hasSalePrice()) {
        <span class="price-original">{{ originalPrice() | currency:currency() }}</span>
        <span class="price-sale">{{ salePrice() | currency:currency() }}</span>
        @if (showDiscount()) {
          <span class="price-discount">-{{ discountPercent() }}%</span>
        }
      } @else {
        <span class="price-current" [class.price-lg]="size() === 'lg'">
          {{ price() | currency:currency() }}
        </span>
      }
    </div>
  `,
  styles: [`
    .price-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .price-current {
      font-weight: 700;
      color: var(--color-text-primary);
      font-size: 1.125rem;
    }

    .price-current.price-lg {
      font-size: 1.5rem;
    }

    .price-original {
      font-size: 0.9375rem;
      color: var(--color-text-muted);
      text-decoration: line-through;
    }

    .price-sale {
      font-weight: 700;
      color: var(--color-danger);
      font-size: 1.125rem;
    }

    .price-discount {
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      background-color: var(--color-danger);
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-full);
    }
  `]
})
export class PriceDisplayComponent {
  price = input.required<number>();
  originalPrice = input<number | null>(null);
  salePrice = input<number | null>(null);
  currency = input<string>('USD');
  size = input<'sm' | 'md' | 'lg'>('md');
  showDiscount = input<boolean>(true);
  
  hasSalePrice = computed(() => {
    return this.salePrice() !== null && this.originalPrice() !== null;
  });
  
  discountPercent = computed(() => {
    const original = this.originalPrice();
    const sale = this.salePrice();
    if (!original || !sale) return 0;
    return Math.round(((original - sale) / original) * 100);
  });
}
