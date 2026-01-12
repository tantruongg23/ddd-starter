import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../application/services/auth.service';

/**
 * Register Page Component
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    DividerModule,
    MessageModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-container animate-slide-up">
        <!-- Header -->
        <div class="auth-header">
          <h1 class="auth-title">Create account</h1>
          <p class="auth-subtitle">Join us to start shopping</p>
        </div>
        
        <!-- Error Message -->
        @if (error()) {
          <p-message severity="error" [text]="error()!" styleClass="auth-error" />
        }
        
        <!-- Register Form -->
        <form (ngSubmit)="onSubmit()" class="auth-form">
          <!-- Name Row -->
          <div class="form-row-2">
            <div class="form-field">
              <label for="firstName" class="form-label">First Name</label>
              <input 
                id="firstName"
                type="text" 
                pInputText 
                [(ngModel)]="firstName"
                name="firstName"
                placeholder="John"
                class="form-input"
              />
            </div>
            <div class="form-field">
              <label for="lastName" class="form-label">Last Name</label>
              <input 
                id="lastName"
                type="text" 
                pInputText 
                [(ngModel)]="lastName"
                name="lastName"
                placeholder="Doe"
                class="form-input"
              />
            </div>
          </div>
          
          <!-- Email -->
          <div class="form-field">
            <label for="email" class="form-label">Email</label>
            <input 
              id="email"
              type="email" 
              pInputText 
              [(ngModel)]="email"
              name="email"
              placeholder="john@example.com"
              class="form-input"
            />
          </div>
          
          <!-- Password -->
          <div class="form-field">
            <label for="password" class="form-label">Password</label>
            <p-password
              id="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Create a password"
              [toggleMask]="true"
              [feedback]="true"
              styleClass="form-password"
              inputStyleClass="form-input"
            />
            <small class="field-hint">At least 8 characters with uppercase, lowercase, and number</small>
          </div>
          
          <!-- Confirm Password -->
          <div class="form-field">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <p-password
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="form-password"
              inputStyleClass="form-input"
            />
          </div>
          
          <!-- Terms -->
          <div class="form-field">
            <p-checkbox 
              [(ngModel)]="acceptTerms" 
              name="acceptTerms"
              [binary]="true"
              inputId="terms"
            />
            <label for="terms" class="terms-label">
              I agree to the 
              <a href="/terms" target="_blank" class="terms-link">Terms of Service</a>
              and
              <a href="/privacy" target="_blank" class="terms-link">Privacy Policy</a>
            </label>
          </div>
          
          <!-- Submit Button -->
          <p-button 
            type="submit" 
            label="Create Account"
            [loading]="isLoading()"
            styleClass="submit-btn"
          />
        </form>
        
        <p-divider align="center">
          <span class="divider-text">or</span>
        </p-divider>
        
        <!-- Social Register -->
        <div class="social-login">
          <button type="button" class="social-btn google-btn">
            <i class="pi pi-google"></i>
            Continue with Google
          </button>
        </div>
        
        <!-- Login Link -->
        <p class="auth-footer">
          Already have an account? 
          <a routerLink="/auth/login" class="auth-link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    }

    .auth-container {
      width: 100%;
      max-width: 480px;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      box-shadow: var(--shadow-xl);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 0.5rem;
    }

    .auth-subtitle {
      color: var(--color-text-secondary);
      margin: 0;
    }

    :host ::ng-deep .auth-error {
      width: 100%;
      margin-bottom: 1rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-input {
      width: 100%;
    }

    :host ::ng-deep .form-password {
      width: 100%;
    }

    :host ::ng-deep .form-password input {
      width: 100%;
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .terms-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-left: 0.5rem;
    }

    .terms-link {
      color: var(--color-accent);
      font-weight: 500;
    }

    .terms-link:hover {
      text-decoration: underline;
    }

    :host ::ng-deep .submit-btn {
      width: 100%;
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-primary);
      font-weight: 600;
    }

    :host ::ng-deep .submit-btn:hover {
      background: var(--color-accent-dark);
      border-color: var(--color-accent-dark);
    }

    .divider-text {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .social-login {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text-primary);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .social-btn:hover {
      background: var(--color-surface-dark);
      border-color: var(--color-border-dark);
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
    }

    .auth-link {
      color: var(--color-accent);
      font-weight: 600;
    }

    .auth-link:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  
  readonly isLoading = this.authService.isLoading;
  readonly error = this.authService.error;
  
  onSubmit(): void {
    this.authService.register(
      this.email,
      this.password,
      this.confirmPassword,
      this.firstName,
      this.lastName,
      this.acceptTerms
    ).subscribe(result => {
      if (result.isSuccess) {
        this.router.navigate(['/']);
      }
    });
  }
}
