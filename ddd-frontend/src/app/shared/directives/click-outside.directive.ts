import { Directive, ElementRef, output, inject, OnInit, OnDestroy } from '@angular/core';

/**
 * Click Outside Directive
 * 
 * Emits an event when a click occurs outside the host element.
 * Useful for closing dropdowns, modals, etc.
 * 
 * Usage:
 * <div appClickOutside (clickOutside)="onClose()">Content</div>
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  
  clickOutside = output<void>();
  
  private handleClick = (event: Event) => {
    const target = event.target as HTMLElement;
    
    if (!this.elementRef.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  };
  
  ngOnInit(): void {
    // Use setTimeout to avoid immediate trigger
    setTimeout(() => {
      document.addEventListener('click', this.handleClick, true);
    });
  }
  
  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClick, true);
  }
}
