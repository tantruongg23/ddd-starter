import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Loading Spinner Component
 * 
 * A reusable loading indicator with multiple size options.
 * Uses pure CSS animations for optimal performance.
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="loading-spinner"
      [class.spinner-sm]="size() === 'sm'"
      [class.spinner-md]="size() === 'md'"
      [class.spinner-lg]="size() === 'lg'"
      [attr.aria-label]="'Loading'"
      role="status"
    >
      <div class="spinner-ring"></div>
      @if (showText()) {
        <span class="spinner-text">{{ text() }}</span>
      }
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .spinner-ring {
      border-radius: 50%;
      border-style: solid;
      border-color: var(--color-accent);
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
    }

    .spinner-sm .spinner-ring {
      width: 1.25rem;
      height: 1.25rem;
      border-width: 2px;
    }

    .spinner-md .spinner-ring {
      width: 2rem;
      height: 2rem;
      border-width: 3px;
    }

    .spinner-lg .spinner-ring {
      width: 3rem;
      height: 3rem;
      border-width: 4px;
    }

    .spinner-text {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  showText = input<boolean>(false);
  text = input<string>('Loading...');
}
