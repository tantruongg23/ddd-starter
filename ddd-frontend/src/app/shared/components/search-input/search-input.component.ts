import { Component, input, output, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

/**
 * Search Input Component
 * 
 * A debounced search input with clear functionality.
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  template: `
    <div class="search-input-wrapper">
      <i class="pi pi-search search-icon"></i>
      <input
        type="text"
        pInputText
        class="search-input"
        [placeholder]="placeholder()"
        [(ngModel)]="searchValue"
        (ngModelChange)="onSearchChange($event)"
        [attr.aria-label]="placeholder()"
      />
      @if (searchValue) {
        <button
          type="button"
          class="clear-btn"
          (click)="clearSearch()"
          aria-label="Clear search"
        >
          <i class="pi pi-times"></i>
        </button>
      }
    </div>
  `,
  styles: [`
    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: var(--color-text-muted);
      font-size: 0.9375rem;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 2.75rem;
      font-size: 0.9375rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      transition: all var(--transition-fast);
    }

    .search-input:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }

    .search-input::placeholder {
      color: var(--color-text-muted);
    }

    .clear-btn {
      position: absolute;
      right: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border: none;
      border-radius: 50%;
      background: var(--color-surface-dark);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .clear-btn:hover {
      background: var(--color-border);
      color: var(--color-text-primary);
    }

    .clear-btn i {
      font-size: 0.6875rem;
    }
  `]
})
export class SearchInputComponent implements OnDestroy {
  placeholder = input<string>('Search...');
  debounceMs = input<number>(300);
  initialValue = input<string>('');
  
  search = output<string>();
  
  searchValue = '';
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  constructor() {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(this.debounceMs()),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.search.emit(value);
    });
    
    // Set initial value
    effect(() => {
      const initial = this.initialValue();
      if (initial) {
        this.searchValue = initial;
      }
    });
  }
  
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }
  
  clearSearch(): void {
    this.searchValue = '';
    this.searchSubject.next('');
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
