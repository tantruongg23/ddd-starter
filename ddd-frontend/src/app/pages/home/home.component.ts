import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { CatalogState } from '@domains/catalog/application/state/catalog.state';
import { CatalogService } from '@domains/catalog/application/services/catalog.service';
import { ProductCardComponent } from '@domains/catalog/presentation/components/product-card/product-card.component';

/**
 * Home Page Component
 * 
 * Landing page with featured products and categories.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CarouselModule, ProductCardComponent],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero animate-fade-in">
        <div class="hero-content">
          <span class="hero-badge">New Collection</span>
          <h1 class="hero-title">
            Discover Premium<br/>
            <span class="highlight">Quality Products</span>
          </h1>
          <p class="hero-desc">
            Shop the latest trends with confidence. Quality guaranteed, fast delivery, and exceptional customer service.
          </p>
          <div class="hero-actions">
            <a routerLink="/products" class="hero-btn primary">
              <span>Shop Now</span>
              <i class="pi pi-arrow-right"></i>
            </a>
            <a routerLink="/products/category/electronics" class="hero-btn secondary">
              View Collections
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-shape"></div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">10K+</span>
              <span class="stat-label">Products</span>
            </div>
            <div class="stat">
              <span class="stat-number">50K+</span>
              <span class="stat-label">Customers</span>
            </div>
            <div class="stat">
              <span class="stat-number">4.9</span>
              <span class="stat-label">Rating</span>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Categories Section -->
      <section class="categories-section">
        <div class="container">
          <div class="section-header animate-slide-up">
            <h2 class="section-title">Shop by Category</h2>
            <a routerLink="/products" class="view-all-link">
              View All <i class="pi pi-arrow-right"></i>
            </a>
          </div>
          <div class="category-grid">
            @for (category of categories; track category.slug; let i = $index) {
              <a 
                [routerLink]="['/products/category', category.slug]" 
                class="category-card animate-slide-up"
                [style.animation-delay]="(i * 100) + 'ms'"
              >
                <div class="category-icon">
                  <i [class]="'pi ' + category.icon"></i>
                </div>
                <h3 class="category-name">{{ category.name }}</h3>
                <span class="category-count">{{ category.count }} items</span>
              </a>
            }
          </div>
        </div>
      </section>
      
      <!-- Featured Products -->
      <section class="products-section">
        <div class="container">
          <div class="section-header animate-slide-up">
            <h2 class="section-title">Featured Products</h2>
            <a routerLink="/products" class="view-all-link">
              View All <i class="pi pi-arrow-right"></i>
            </a>
          </div>
          @if (featuredProducts().length > 0) {
            <div class="products-grid">
              @for (product of featuredProducts(); track product.id; let i = $index) {
                <app-product-card 
                  [product]="product"
                  class="animate-slide-up"
                  [style.animation-delay]="(i * 100) + 'ms'"
                />
              }
            </div>
          } @else {
            <div class="products-placeholder">
              <p>Loading featured products...</p>
            </div>
          }
        </div>
      </section>
      
      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <div class="features-grid">
            @for (feature of features; track feature.title; let i = $index) {
              <div 
                class="feature-card animate-slide-up"
                [style.animation-delay]="(i * 100) + 'ms'"
              >
                <div class="feature-icon">
                  <i [class]="'pi ' + feature.icon"></i>
                </div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-desc">{{ feature.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta-section animate-slide-up">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">Subscribe to Our Newsletter</h2>
            <p class="cta-desc">Get the latest updates on new products and exclusive offers.</p>
            <div class="cta-form">
              <input type="email" placeholder="Enter your email" class="cta-input" />
              <button class="cta-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      overflow: hidden;
    }

    /* Hero */
    .hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      min-height: 600px;
      padding: 4rem;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
      position: relative;
      overflow: hidden;
    }

    @media (max-width: 1024px) {
      .hero {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 3rem 1.5rem;
      }
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 1;
    }

    .hero-badge {
      display: inline-block;
      width: fit-content;
      padding: 0.5rem 1rem;
      background: var(--color-accent);
      color: var(--color-primary);
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: var(--radius-full);
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1024px) {
      .hero-badge {
        margin-left: auto;
        margin-right: auto;
      }
    }

    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.1;
      color: var(--color-text-inverse);
      margin: 0 0 1.5rem;
    }

    .hero-title .highlight {
      color: var(--color-accent);
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
    }

    .hero-desc {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.7;
      max-width: 500px;
      margin: 0 0 2rem;
    }

    @media (max-width: 1024px) {
      .hero-desc {
        margin-left: auto;
        margin-right: auto;
      }
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 1024px) {
      .hero-actions {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .hero-actions {
        flex-direction: column;
      }
    }

    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .hero-btn.primary {
      background: var(--color-accent);
      color: var(--color-primary);
    }

    .hero-btn.primary:hover {
      background: var(--color-accent-dark);
      transform: translateX(4px);
    }

    .hero-btn.secondary {
      background: transparent;
      color: var(--color-text-inverse);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .hero-btn.secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .hero-visual {
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    @media (max-width: 1024px) {
      .hero-visual {
        display: none;
      }
    }

    .hero-shape {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%);
      filter: blur(60px);
    }

    .hero-stats {
      display: flex;
      gap: 3rem;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: var(--radius-lg);
      z-index: 1;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-accent);
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
    }

    /* Sections */
    .categories-section,
    .products-section,
    .features-section {
      padding: 5rem 0;
    }

    .products-section {
      background: var(--color-surface-alt);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
    }

    .view-all-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-accent);
      font-weight: 500;
      text-decoration: none;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    /* Categories */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      text-decoration: none;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-normal);
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .category-icon {
      width: 4rem;
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
      margin-bottom: 1rem;
    }

    .category-icon i {
      font-size: 1.5rem;
      color: var(--color-primary);
    }

    .category-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 0.25rem;
    }

    .category-count {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    /* Products */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .products-placeholder {
      text-align: center;
      padding: 4rem;
      color: var(--color-text-muted);
    }

    /* Features */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      text-align: center;
      padding: 2rem;
    }

    .feature-icon {
      width: 4rem;
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      background: var(--color-surface-dark);
    }

    .feature-icon i {
      font-size: 1.5rem;
      color: var(--color-accent);
    }

    .feature-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
    }

    .feature-desc {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.6;
    }

    /* CTA */
    .cta-section {
      padding: 5rem 0;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    }

    .cta-content {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text-inverse);
      margin: 0 0 0.75rem;
    }

    .cta-desc {
      font-size: 1.0625rem;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 2rem;
    }

    .cta-form {
      display: flex;
      gap: 0.75rem;
      max-width: 450px;
      margin: 0 auto;
    }

    @media (max-width: 480px) {
      .cta-form {
        flex-direction: column;
      }
    }

    .cta-input {
      flex: 1;
      padding: 1rem 1.25rem;
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      outline: none;
    }

    .cta-btn {
      padding: 1rem 2rem;
      background: var(--color-accent);
      color: var(--color-primary);
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .cta-btn:hover {
      background: var(--color-accent-dark);
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly catalogState = inject(CatalogState);
  private readonly catalogService = inject(CatalogService);
  
  readonly featuredProducts = this.catalogState.featuredProducts;
  
  categories = [
    { name: 'Electronics', slug: 'electronics', icon: 'pi-mobile', count: 234 },
    { name: 'Clothing', slug: 'clothing', icon: 'pi-tag', count: 567 },
    { name: 'Home & Garden', slug: 'home', icon: 'pi-home', count: 189 },
    { name: 'Sports', slug: 'sports', icon: 'pi-heart', count: 156 },
    { name: 'Books', slug: 'books', icon: 'pi-book', count: 423 },
    { name: 'Toys', slug: 'toys', icon: 'pi-star', count: 98 }
  ];
  
  features = [
    {
      icon: 'pi-truck',
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50. Fast and reliable delivery.'
    },
    {
      icon: 'pi-shield',
      title: 'Secure Payment',
      description: 'Your payment information is always safe and encrypted.'
    },
    {
      icon: 'pi-refresh',
      title: 'Easy Returns',
      description: '30-day return policy. No questions asked.'
    },
    {
      icon: 'pi-headphones',
      title: '24/7 Support',
      description: 'Our support team is here to help you anytime.'
    }
  ];
  
  ngOnInit(): void {
    this.catalogService.loadProducts().subscribe();
  }
}
