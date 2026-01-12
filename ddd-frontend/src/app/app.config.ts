import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { 
  authInterceptor, 
  loggingInterceptor, 
  contentTypeInterceptor,
  errorInterceptor 
} from '@core/infrastructure/api/api.interceptor';

/**
 * Application Configuration
 * 
 * Provides all necessary Angular providers for the application.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Error handling
    provideBrowserGlobalErrorListeners(),
    
    // Zone.js configuration with event coalescing for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Router configuration
    provideRouter(
      routes,
      // Enable smooth view transitions
      withViewTransitions(),
      // Scroll to top on navigation
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    
    // HTTP client with interceptors
    provideHttpClient(
      withFetch(),
      withInterceptors([
        loggingInterceptor,
        contentTypeInterceptor,
        authInterceptor,
        errorInterceptor
      ])
    ),
    
    // Animations for PrimeNG
    provideAnimations()
  ]
};
