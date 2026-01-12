import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from '../storage/local-storage.service';
import { environment } from '@env';

/**
 * Authentication Interceptor
 * 
 * Automatically attaches authentication tokens to outgoing requests
 * and handles 401 responses by redirecting to login.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const storageService = inject(LocalStorageService);
  const router = inject(Router);
  
  // Get the auth token
  const token = storageService.get<string>(environment.auth.tokenKey);
  
  // Clone the request and add auth header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Clear stored tokens
        storageService.remove(environment.auth.tokenKey);
        storageService.remove(environment.auth.refreshTokenKey);
        
        // Redirect to login
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url }
        });
      }
      return throwError(() => error);
    })
  );
};

/**
 * Logging Interceptor
 * 
 * Logs HTTP requests and responses in development mode.
 * Useful for debugging API calls.
 */
export const loggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Only log in development
  if (environment.production) {
    return next(req);
  }
  
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 9);
  
  console.group(`🌐 [${requestId}] ${req.method} ${req.url}`);
  console.log('Request:', {
    headers: req.headers.keys().reduce((acc, key) => {
      acc[key] = req.headers.get(key);
      return acc;
    }, {} as Record<string, string | null>),
    body: req.body
  });
  
  return next(req).pipe(
    finalize(() => {
      const duration = Date.now() - startTime;
      console.log(`⏱️ Duration: ${duration}ms`);
      console.groupEnd();
    })
  );
};

/**
 * Content Type Interceptor
 * 
 * Sets default content type headers for requests.
 */
export const contentTypeInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Skip if content-type is already set or if it's a multipart form
  if (req.headers.has('Content-Type') || req.body instanceof FormData) {
    return next(req);
  }
  
  // Set default content type for requests with body
  if (req.body) {
    const modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
    return next(modifiedReq);
  }
  
  return next(req);
};

/**
 * Error Handling Interceptor
 * 
 * Global error handling for HTTP requests.
 * Provides consistent error formatting and optional error reporting.
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log errors in development
      if (!environment.production) {
        console.error('HTTP Error:', {
          url: req.url,
          status: error.status,
          message: error.message,
          error: error.error
        });
      }
      
      // Re-throw the error for further handling
      return throwError(() => error);
    })
  );
};

/**
 * Cache Interceptor
 * 
 * Simple in-memory cache for GET requests.
 * Useful for reducing redundant API calls.
 */
const cache = new Map<string, { response: HttpEvent<unknown>; timestamp: number }>();

export const cacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }
  
  // Check for cache-control header to skip caching
  if (req.headers.get('Cache-Control') === 'no-cache') {
    return next(req);
  }
  
  const cacheKey = req.urlWithParams;
  const cached = cache.get(cacheKey);
  const ttl = environment.cache.defaultTTLMinutes * 60 * 1000;
  
  // Return cached response if valid
  if (cached && Date.now() - cached.timestamp < ttl) {
    return new Observable(observer => {
      observer.next(cached.response);
      observer.complete();
    });
  }
  
  // Make request and cache response
  return next(req).pipe(
    finalize(() => {
      // Clean up old cache entries
      if (cache.size > environment.cache.maxItems) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }
    })
  );
};
