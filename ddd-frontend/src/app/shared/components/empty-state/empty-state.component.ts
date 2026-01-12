import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

/**
 * Empty State Component
 * 
 * Displays a friendly message when there's no content to show.
 * Useful for empty lists, search results, etc.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="empty-state animate-fade-in">
      <div class="empty-state-icon">
        <i [class]="'pi ' + icon()" aria-hidden="true"></i>
      </div>
      <h3 class="empty-state-title">{{ title() }}</h3>
      @if (description()) {
        <p class="empty-state-description">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <p-button 
          [label]="actionLabel()" 
          [icon]="actionIcon()"
          styleClass="p-button-accent mt-4"
          (onClick)="actionClick.emit()"
        />
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      min-height: 300px;
    }

    .empty-state-icon {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-surface-dark) 0%, var(--color-border) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .empty-state-icon i {
      font-size: 2rem;
      color: var(--color-text-muted);
    }

    .empty-state-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 0.5rem;
    }

    .empty-state-description {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      max-width: 320px;
      line-height: 1.5;
    }

    :host ::ng-deep .p-button-accent {
      background-color: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-primary);
    }

    :host ::ng-deep .p-button-accent:hover {
      background-color: var(--color-accent-dark);
      border-color: var(--color-accent-dark);
    }
  `]
})
export class EmptyStateComponent {
  icon = input<string>('pi-inbox');
  title = input.required<string>();
  description = input<string>('');
  actionLabel = input<string>('');
  actionIcon = input<string>('');
  
  actionClick = output<void>();
}
