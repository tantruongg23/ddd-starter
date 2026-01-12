import { Directive, ElementRef, input, inject, OnInit, Renderer2 } from '@angular/core';

/**
 * Lazy Image Directive
 * 
 * Lazy loads images using Intersection Observer API.
 * Shows a placeholder until the image enters the viewport.
 * 
 * Usage:
 * <img appLazyImage [lazySrc]="imageUrl" [placeholder]="placeholderUrl" />
 */
@Directive({
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLImageElement>);
  private readonly renderer = inject(Renderer2);
  
  lazySrc = input.required<string>();
  placeholder = input<string>('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3C/svg%3E');
  
  private observer?: IntersectionObserver;
  
  ngOnInit(): void {
    const img = this.elementRef.nativeElement;
    
    // Set placeholder initially
    this.renderer.setAttribute(img, 'src', this.placeholder());
    this.renderer.addClass(img, 'lazy-image');
    this.renderer.setStyle(img, 'transition', 'opacity 0.3s ease');
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage();
              this.observer?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before entering viewport
          threshold: 0.01
        }
      );
      
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
    }
  }
  
  private loadImage(): void {
    const img = this.elementRef.nativeElement;
    const src = this.lazySrc();
    
    // Create a new image to preload
    const tempImg = new Image();
    tempImg.onload = () => {
      this.renderer.setStyle(img, 'opacity', '0');
      this.renderer.setAttribute(img, 'src', src);
      this.renderer.removeClass(img, 'lazy-image');
      this.renderer.addClass(img, 'lazy-image-loaded');
      
      // Fade in
      setTimeout(() => {
        this.renderer.setStyle(img, 'opacity', '1');
      }, 50);
    };
    
    tempImg.onerror = () => {
      // Keep placeholder on error
      this.renderer.addClass(img, 'lazy-image-error');
    };
    
    tempImg.src = src;
  }
}
