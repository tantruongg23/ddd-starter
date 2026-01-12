import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Rating Stars Component
 * 
 * Displays and optionally allows interaction with star ratings.
 */
@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="rating-stars"
      [class.interactive]="interactive()"
      [attr.aria-label]="'Rating: ' + rating() + ' out of ' + maxStars() + ' stars'"
    >
      <div class="stars-container">
        @for (star of stars(); track star.index) {
          <button
            type="button"
            class="star-btn"
            [class.filled]="star.filled"
            [class.half]="star.half"
            [disabled]="!interactive()"
            (mouseenter)="onStarHover(star.index)"
            (mouseleave)="onStarLeave()"
            (click)="onStarClick(star.index)"
            [attr.aria-label]="'Rate ' + (star.index + 1) + ' stars'"
          >
            <i class="pi" [class.pi-star-fill]="star.filled || star.half" [class.pi-star]="!star.filled && !star.half"></i>
          </button>
        }
      </div>
      @if (showCount() && reviewCount() !== null) {
        <span class="review-count">({{ reviewCount() }})</span>
      }
      @if (showValue()) {
        <span class="rating-value">{{ rating().toFixed(1) }}</span>
      }
    </div>
  `,
  styles: [`
    .rating-stars {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stars-container {
      display: flex;
      gap: 0.125rem;
    }

    .star-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: default;
      font-size: 1rem;
      line-height: 1;
      color: var(--color-border-dark);
      transition: transform var(--transition-fast), color var(--transition-fast);
    }

    .star-btn.filled,
    .star-btn.half {
      color: var(--color-accent);
    }

    .interactive .star-btn {
      cursor: pointer;
    }

    .interactive .star-btn:hover {
      transform: scale(1.15);
    }

    .review-count {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .rating-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  `]
})
export class RatingStarsComponent {
  rating = input<number>(0);
  maxStars = input<number>(5);
  interactive = input<boolean>(false);
  showCount = input<boolean>(true);
  showValue = input<boolean>(false);
  reviewCount = input<number | null>(null);
  
  ratingChange = output<number>();
  
  private hoverRating = signal<number | null>(null);
  
  stars = computed(() => {
    const current = this.hoverRating() ?? this.rating();
    const max = this.maxStars();
    
    return Array.from({ length: max }, (_, i) => ({
      index: i,
      filled: i < Math.floor(current),
      half: i === Math.floor(current) && current % 1 >= 0.5
    }));
  });
  
  onStarHover(index: number): void {
    if (this.interactive()) {
      this.hoverRating.set(index + 1);
    }
  }
  
  onStarLeave(): void {
    this.hoverRating.set(null);
  }
  
  onStarClick(index: number): void {
    if (this.interactive()) {
      this.ratingChange.emit(index + 1);
    }
  }
}
