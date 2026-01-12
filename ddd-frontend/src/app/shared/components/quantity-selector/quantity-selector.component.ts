import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

/**
 * Quantity Selector Component
 * 
 * A reusable quantity input with increment/decrement buttons.
 */
@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="quantity-selector" [class.disabled]="disabled()">
      <button
        type="button"
        class="qty-btn qty-decrease"
        [disabled]="disabled() || isMinReached()"
        (click)="decrease()"
        aria-label="Decrease quantity"
      >
        <i class="pi pi-minus"></i>
      </button>
      
      <input
        type="number"
        class="qty-input"
        [value]="quantity()"
        [min]="min()"
        [max]="max()"
        [disabled]="disabled()"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        aria-label="Quantity"
      />
      
      <button
        type="button"
        class="qty-btn qty-increase"
        [disabled]="disabled() || isMaxReached()"
        (click)="increase()"
        aria-label="Increase quantity"
      >
        <i class="pi pi-plus"></i>
      </button>
    </div>
  `,
  styles: [`
    .quantity-selector {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface);
    }

    .quantity-selector.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .qty-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      background: var(--color-surface);
      color: var(--color-text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .qty-btn:hover:not(:disabled) {
      background: var(--color-surface-dark);
    }

    .qty-btn:disabled {
      color: var(--color-text-muted);
      cursor: not-allowed;
    }

    .qty-btn i {
      font-size: 0.75rem;
    }

    .qty-input {
      width: 3rem;
      height: 2.5rem;
      border: none;
      border-left: 1px solid var(--color-border);
      border-right: 1px solid var(--color-border);
      text-align: center;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-text-primary);
      background: var(--color-surface);
      -moz-appearance: textfield;
    }

    .qty-input::-webkit-outer-spin-button,
    .qty-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .qty-input:focus {
      outline: none;
      background: var(--color-surface-alt);
    }
  `]
})
export class QuantitySelectorComponent {
  quantity = input<number>(1);
  min = input<number>(1);
  max = input<number>(99);
  disabled = input<boolean>(false);
  
  quantityChange = output<number>();
  
  private internalQuantity = signal(1);
  
  isMinReached = computed(() => this.quantity() <= this.min());
  isMaxReached = computed(() => this.quantity() >= this.max());
  
  increase(): void {
    const newQty = Math.min(this.quantity() + 1, this.max());
    this.quantityChange.emit(newQty);
  }
  
  decrease(): void {
    const newQty = Math.max(this.quantity() - 1, this.min());
    this.quantityChange.emit(newQty);
  }
  
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    
    if (!isNaN(value)) {
      this.internalQuantity.set(value);
    }
  }
  
  onBlur(): void {
    let value = this.internalQuantity();
    value = Math.max(this.min(), Math.min(this.max(), value));
    this.quantityChange.emit(value);
  }
}
