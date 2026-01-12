import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

/**
 * Confirm Dialog Component
 * 
 * A reusable confirmation dialog for destructive or important actions.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog 
      [header]="title()"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '400px' }"
      [breakpoints]="{ '640px': '90vw' }"
      styleClass="confirm-dialog"
    >
      <div class="confirm-dialog-content">
        @if (icon()) {
          <div class="confirm-dialog-icon" [class]="'icon-' + severity()">
            <i [class]="'pi ' + icon()"></i>
          </div>
        }
        <p class="confirm-dialog-message">{{ message() }}</p>
      </div>
      
      <ng-template pTemplate="footer">
        <div class="confirm-dialog-actions">
          <p-button 
            [label]="cancelLabel()" 
            severity="secondary"
            [outlined]="true"
            (onClick)="onCancel()"
          />
          <p-button 
            [label]="confirmLabel()" 
            [severity]="severity()"
            [loading]="loading()"
            (onClick)="onConfirm()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .confirm-dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1rem 0;
    }

    .confirm-dialog-icon {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .confirm-dialog-icon i {
      font-size: 1.75rem;
    }

    .icon-danger {
      background-color: rgba(239, 68, 68, 0.1);
    }

    .icon-danger i {
      color: var(--color-danger);
    }

    .icon-warn {
      background-color: rgba(245, 158, 11, 0.1);
    }

    .icon-warn i {
      color: var(--color-warning);
    }

    .icon-info {
      background-color: rgba(59, 130, 246, 0.1);
    }

    .icon-info i {
      color: var(--color-info);
    }

    .confirm-dialog-message {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    .confirm-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class ConfirmDialogComponent {
  title = input<string>('Confirm Action');
  message = input.required<string>();
  icon = input<string>('pi-exclamation-triangle');
  severity = input<'danger' | 'warn' | 'info'>('danger');
  confirmLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  loading = input<boolean>(false);
  
  confirm = output<void>();
  cancel = output<void>();
  
  visible = signal(false);
  
  show(): void {
    this.visible.set(true);
  }
  
  hide(): void {
    this.visible.set(false);
  }
  
  onConfirm(): void {
    this.confirm.emit();
  }
  
  onCancel(): void {
    this.visible.set(false);
    this.cancel.emit();
  }
}
