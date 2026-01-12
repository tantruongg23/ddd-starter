import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../application/services/auth.service';

/**
 * Login Page Component
 */
@Component({
  selector: 'app-login',
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
          <h1 class="auth-title">Welcome back</h1>
          <p class="auth-subtitle">Sign in to your account to continue</p>
        </div>
        
        <!-- Error Message -->
        @if (error()) {
          <p-message severity="error" [text]="error()!" styleClass="auth-error" />
        }
        
        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="auth-form">
          <!-- Email -->
          <div class="form-field">
            <label for="email" class="form-label">Email</label>
            <input 
              id="email"
              type="email" 
              pInputText 
              [(ngModel)]="email"
              name="email"
              placeholder="Enter your email"
              class="form-input"
              [class.p-invalid]="emailError()"
            />
            @if (emailError()) {
              <small class="field-error">{{ emailError() }}</small>
            }
          </div>
          
          <!-- Password -->
          <div class="form-field">
            <label for="password" class="form-label">Password</label>
            <p-password
              id="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Enter your password"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="form-password"
              inputStyleClass="form-input"
            />
            @if (passwordError()) {
              <small class="field-error">{{ passwordError() }}</small>
            }
          </div>
          
          <!-- Remember Me & Forgot Password -->
          <div class="form-row">
            <p-checkbox 
              [(ngModel)]="rememberMe" 
              name="rememberMe"
              [binary]="true"
              label="Remember me"
            />
            <a routerLink="/auth/forgot-password" class="forgot-link">
              Forgot password?
            </a>
          </div>
          
          <!-- Submit Button -->
          <p-button 
            type="submit" 
            label="Sign In"
            [loading]="isLoading()"
            styleClass="submit-btn"
          />
        </form>
        
        <p-divider align="center">
          <span class="divider-text">or</span>
        </p-divider>
        
        <!-- Social Login -->
        <div class="social-login">
          <button type="button" class="social-btn google-btn">
            <i class="pi pi-google"></i>
            Continue with Google
          </button>
        </div>
        
        <!-- Register Link -->
        <p class="auth-footer">
          Don't have an account? 
          <a routerLink="/auth/register" class="auth-link">Sign up</a>
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
      max-width: 420px;
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

    .field-error {
      color: var(--color-danger);
      font-size: 0.8125rem;
    }

    .form-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      font-size: 0.875rem;
      color: var(--color-accent);
      font-weight: 500;
    }

    .forgot-link:hover {
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
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  // Form fields
  email = '';
  password = '';
  rememberMe = false;
  
  // State
  emailError = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  
  readonly isLoading = this.authService.isLoading;
  readonly error = this.authService.error;
  
  onSubmit(): void {
    // Reset errors
    this.emailError.set(null);
    this.passwordError.set(null);
    
    // Basic validation
    if (!this.email.trim()) {
      this.emailError.set('Email is required');
      return;
    }
    if (!this.password) {
      this.passwordError.set('Password is required');
      return;
    }
    
    // Attempt login
    this.authService.login(this.email, this.password, this.rememberMe)
      .subscribe(result => {
        if (result.isSuccess) {
          // Get return URL from query params
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
          this.router.navigateByUrl(returnUrl);
        }
      });
  }
}
