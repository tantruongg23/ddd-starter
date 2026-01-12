import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

/**
 * Not Found (404) Page Component
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-content animate-slide-up">
        <span class="error-code">404</span>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-desc">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="error-actions">
          <a routerLink="/" class="home-btn">
            <i class="pi pi-home"></i>
            Go to Homepage
          </a>
          <a routerLink="/products" class="shop-btn">
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-surface) 100%);
    }

    .not-found-content {
      text-align: center;
      max-width: 500px;
    }

    .error-code {
      display: block;
      font-family: 'Outfit', sans-serif;
      font-size: 8rem;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }

    .error-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 1rem;
    }

    .error-desc {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin: 0 0 2rem;
    }

    .error-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    @media (max-width: 480px) {
      .error-actions {
        flex-direction: column;
      }
    }

    .home-btn,
    .shop-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: var(--radius-md);
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .home-btn {
      background: var(--color-primary);
      color: var(--color-text-inverse);
    }

    .home-btn:hover {
      background: var(--color-primary-light);
    }

    .shop-btn {
      background: transparent;
      color: var(--color-primary);
      border: 2px solid var(--color-primary);
    }

    .shop-btn:hover {
      background: var(--color-primary);
      color: var(--color-text-inverse);
    }
  `]
})
export class NotFoundComponent {}
