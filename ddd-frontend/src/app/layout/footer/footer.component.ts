import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Footer Component
 * 
 * Application footer with links and copyright.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <a routerLink="/" class="logo">
              <span class="logo-icon">⚡</span>
              <span class="logo-text">DDD<span class="logo-accent">Shop</span></span>
            </a>
            <p class="brand-desc">
              Modern e-commerce platform built with Domain-Driven Design principles.
            </p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook">
                <i class="pi pi-facebook"></i>
              </a>
              <a href="#" class="social-link" aria-label="Twitter">
                <i class="pi pi-twitter"></i>
              </a>
              <a href="#" class="social-link" aria-label="Instagram">
                <i class="pi pi-instagram"></i>
              </a>
              <a href="#" class="social-link" aria-label="LinkedIn">
                <i class="pi pi-linkedin"></i>
              </a>
            </div>
          </div>
          
          <!-- Shop -->
          <div class="footer-column">
            <h4 class="column-title">Shop</h4>
            <ul class="footer-links">
              <li><a routerLink="/products">All Products</a></li>
              <li><a routerLink="/products/category/electronics">Electronics</a></li>
              <li><a routerLink="/products/category/clothing">Clothing</a></li>
              <li><a routerLink="/products/category/home">Home & Garden</a></li>
            </ul>
          </div>
          
          <!-- Customer Service -->
          <div class="footer-column">
            <h4 class="column-title">Customer Service</h4>
            <ul class="footer-links">
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
              <li><a href="#">Track Order</a></li>
            </ul>
          </div>
          
          <!-- Company -->
          <div class="footer-column">
            <h4 class="column-title">Company</h4>
            <ul class="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Sustainability</a></li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p class="copyright">
            © {{ currentYear }} DDDShop. All rights reserved.
          </p>
          <div class="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: var(--color-primary);
      color: var(--color-text-inverse);
      padding: 4rem 0 0;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
      padding-bottom: 3rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }

      .footer-brand {
        grid-column: span 2;
      }
    }

    @media (max-width: 600px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }

      .footer-brand {
        grid-column: span 1;
      }
    }

    /* Brand */
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-inverse);
    }

    .logo-accent {
      color: var(--color-accent);
    }

    .brand-desc {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      max-width: 300px;
    }

    .social-links {
      display: flex;
      gap: 0.75rem;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-text-inverse);
      transition: all var(--transition-fast);
    }

    .social-link:hover {
      background: var(--color-accent);
      color: var(--color-primary);
    }

    /* Columns */
    .column-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 1.25rem;
      color: var(--color-text-inverse);
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.75rem;
    }

    .footer-links a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-size: 0.9375rem;
      transition: color var(--transition-fast);
    }

    .footer-links a:hover {
      color: var(--color-accent);
    }

    /* Bottom */
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0;
    }

    @media (max-width: 600px) {
      .footer-bottom {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }

    .copyright {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      margin: 0;
    }

    .legal-links {
      display: flex;
      gap: 1.5rem;
    }

    .legal-links a {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .legal-links a:hover {
      color: var(--color-text-inverse);
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
