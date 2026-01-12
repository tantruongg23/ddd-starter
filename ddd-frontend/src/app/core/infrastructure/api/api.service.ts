import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { environment } from '@env';
import { Result, DomainError, ValidationError, NotFoundError, UnauthorizedError } from '../../domain/result';
import { 
  HateoasResource, 
  HateoasLinks, 
  HateoasLink, 
  HateoasPagedResource,
  WithLinks,
  LinkRel 
} from './hateoas.model';

/**
 * API Request Options Interface
 */
export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  withCredentials?: boolean;
  reportProgress?: boolean;
}

/**
 * Paginated Response Interface (legacy format)
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  _links?: HateoasLinks;
}

/**
 * HATEOAS-aware Paginated Response
 */
export interface HateoasPaginatedResponse<T> extends HateoasResource {
  _embedded: {
    [key: string]: T[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: Record<string, unknown>;
}

/**
 * API Service
 * 
 * Central service for all HTTP communications with the backend.
 * Provides standardized error handling, retry logic, and response transformation.
 * 
 * Features:
 * - Automatic error transformation to domain errors
 * - Request/response logging in development
 * - Configurable timeout and retry logic
 * - Type-safe responses
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/${environment.apiVersion}`;
  private readonly defaultTimeout = 30000; // 30 seconds
  private readonly defaultRetries = 1;

  /**
   * Performs a GET request
   */
  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<Result<T, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.get<ApiResponse<T>>(url, { ...options }).pipe(
      timeout(this.defaultTimeout),
      retry(this.defaultRetries),
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError<T>(error))
    );
  }

  /**
   * Performs a POST request
   */
  post<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<Result<T, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.post<ApiResponse<T>>(url, body, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError<T>(error))
    );
  }

  /**
   * Performs a PUT request
   */
  put<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<Result<T, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.put<ApiResponse<T>>(url, body, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError<T>(error))
    );
  }

  /**
   * Performs a PATCH request
   */
  patch<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<Result<T, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.patch<ApiResponse<T>>(url, body, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError<T>(error))
    );
  }

  /**
   * Performs a DELETE request
   */
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<Result<T, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.delete<ApiResponse<T>>(url, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError<T>(error))
    );
  }

  /**
   * Performs a GET request for paginated data
   */
  getPaginated<T>(
    endpoint: string, 
    page: number = 1, 
    pageSize: number = environment.pagination.defaultPageSize,
    additionalParams?: Record<string, string>
  ): Observable<Result<PaginatedResponse<T>, DomainError>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    // Add additional params if provided
    let finalParams = params;
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        finalParams = finalParams.set(key, value);
      });
    }
    
    return this.get<PaginatedResponse<T>>(endpoint, { params: finalParams });
  }

  // ==========================================
  // HATEOAS-Aware Methods
  // ==========================================

  /**
   * Performs a GET request expecting a HATEOAS resource with _links
   */
  getWithLinks<T>(endpoint: string, options?: ApiRequestOptions): Observable<Result<WithLinks<T>, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.get<ApiResponse<WithLinks<T>> | WithLinks<T>>(url, { ...options }).pipe(
      timeout(this.defaultTimeout),
      retry(this.defaultRetries),
      map(response => this.handleHateoasResponse<T>(response)),
      catchError(error => this.handleError<WithLinks<T>>(error))
    );
  }

  /**
   * Performs a POST request expecting a HATEOAS resource with _links
   */
  postWithLinks<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<Result<WithLinks<T>, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.post<ApiResponse<WithLinks<T>> | WithLinks<T>>(url, body, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleHateoasResponse<T>(response)),
      catchError(error => this.handleError<WithLinks<T>>(error))
    );
  }

  /**
   * Performs a PUT request expecting a HATEOAS resource with _links
   */
  putWithLinks<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<Result<WithLinks<T>, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.put<ApiResponse<WithLinks<T>> | WithLinks<T>>(url, body, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleHateoasResponse<T>(response)),
      catchError(error => this.handleError<WithLinks<T>>(error))
    );
  }

  /**
   * Performs a PATCH request expecting a HATEOAS resource with _links
   */
  patchWithLinks<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<Result<WithLinks<T>, DomainError>> {
    const url = this.buildUrl(endpoint);
    
    return this.http.patch<ApiResponse<WithLinks<T>> | WithLinks<T>>(url, body, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleHateoasResponse<T>(response)),
      catchError(error => this.handleError<WithLinks<T>>(error))
    );
  }

  /**
   * Gets a paginated collection using Spring HATEOAS format
   * The response contains _embedded with the collection and page metadata
   */
  getHateoasPaginated<T>(
    endpoint: string,
    collectionName: string,
    page: number = 0,
    pageSize: number = environment.pagination.defaultPageSize,
    additionalParams?: Record<string, string>
  ): Observable<Result<{ data: WithLinks<T>[]; pagination: PaginatedResponse<T>['pagination']; links: HateoasLinks }, DomainError>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());
    
    let finalParams = params;
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        finalParams = finalParams.set(key, value);
      });
    }
    
    const url = this.buildUrl(endpoint);
    
    return this.http.get<HateoasPaginatedResponse<WithLinks<T>>>(url, { params: finalParams }).pipe(
      timeout(this.defaultTimeout),
      retry(this.defaultRetries),
      map(response => {
        const embedded = response._embedded?.[collectionName] ?? [];
        const pageInfo = response.page;
        
        return Result.ok<{ data: WithLinks<T>[]; pagination: PaginatedResponse<T>['pagination']; links: HateoasLinks }, DomainError>({
          data: embedded,
          pagination: {
            page: (pageInfo?.number ?? 0) + 1, // Spring uses 0-based pages
            pageSize: pageInfo?.size ?? pageSize,
            totalItems: pageInfo?.totalElements ?? embedded.length,
            totalPages: pageInfo?.totalPages ?? 1,
            hasNext: response._links?.['next'] !== undefined,
            hasPrevious: response._links?.['prev'] !== undefined
          },
          links: response._links ?? {}
        });
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Follows a HATEOAS link URL directly
   */
  followLink<T>(href: string, options?: ApiRequestOptions): Observable<Result<WithLinks<T>, DomainError>> {
    const url = this.resolveHateoasUrl(href);
    
    return this.http.get<ApiResponse<WithLinks<T>> | WithLinks<T>>(url, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleHateoasResponse<T>(response)),
      catchError(error => this.handleError<WithLinks<T>>(error))
    );
  }

  /**
   * Follows a link with POST method
   */
  followLinkWithPost<T>(href: string, body: unknown, options?: ApiRequestOptions): Observable<Result<WithLinks<T>, DomainError>> {
    const url = this.resolveHateoasUrl(href);
    
    return this.http.post<ApiResponse<WithLinks<T>> | WithLinks<T>>(url, body, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleHateoasResponse<T>(response)),
      catchError(error => this.handleError<WithLinks<T>>(error))
    );
  }

  /**
   * Follows a link with PUT method
   */
  followLinkWithPut<T>(href: string, body: unknown, options?: ApiRequestOptions): Observable<Result<WithLinks<T>, DomainError>> {
    const url = this.resolveHateoasUrl(href);
    
    return this.http.put<ApiResponse<WithLinks<T>> | WithLinks<T>>(url, body, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleHateoasResponse<T>(response)),
      catchError(error => this.handleError<WithLinks<T>>(error))
    );
  }

  /**
   * Follows a link with DELETE method
   */
  followLinkWithDelete<T>(href: string, options?: ApiRequestOptions): Observable<Result<T, DomainError>> {
    const url = this.resolveHateoasUrl(href);
    
    return this.http.delete<ApiResponse<T>>(url, { ...options }).pipe(
      timeout(this.defaultTimeout),
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError<T>(error))
    );
  }

  /**
   * Builds the full URL for an endpoint
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Handles successful API responses
   */
  private handleResponse<T>(response: ApiResponse<T>): Result<T, DomainError> {
    if (response.success && response.data !== undefined) {
      return Result.ok(response.data);
    }
    
    if (response.error) {
      return Result.fail(new ValidationError(response.error.message, response.error.details));
    }
    
    return Result.ok(response.data as T);
  }

  /**
   * Handles HATEOAS responses - can be either wrapped in ApiResponse or direct
   * Spring HATEOAS typically returns direct objects with _links
   */
  private handleHateoasResponse<T>(response: ApiResponse<WithLinks<T>> | WithLinks<T>): Result<WithLinks<T>, DomainError> {
    // Check if it's a wrapped ApiResponse
    if ('success' in response) {
      if (response.success && response.data !== undefined) {
        return Result.ok(response.data);
      }
      if (response.error) {
        return Result.fail(new ValidationError(response.error.message, response.error.details));
      }
      return Result.ok(response.data as WithLinks<T>);
    }
    
    // It's a direct HATEOAS response (Spring HATEOAS format)
    return Result.ok(response as WithLinks<T>);
  }

  /**
   * Resolves a HATEOAS link URL to a full URL
   */
  private resolveHateoasUrl(href: string): string {
    // Already absolute URL
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href;
    }
    
    // Absolute path - prepend the base domain
    if (href.startsWith('/')) {
      const match = environment.apiUrl.match(/^(https?:\/\/[^/]+)/);
      if (match) {
        return `${match[1]}${href}`;
      }
    }
    
    // Relative path - prepend the full base URL
    return `${this.baseUrl}/${href.replace(/^\//, '')}`;
  }

  /**
   * Handles HTTP errors and transforms them to domain errors
   */
  private handleError<T>(error: HttpErrorResponse): Observable<Result<T, DomainError>> {
    let domainError: DomainError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      domainError = new ValidationError(`Network error: ${error.error.message}`);
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          domainError = new ValidationError(
            error.error?.message || 'Invalid request',
            error.error?.details
          );
          break;
        case 401:
          domainError = new UnauthorizedError(
            error.error?.message || 'Authentication required'
          );
          break;
        case 403:
          domainError = new UnauthorizedError(
            error.error?.message || 'Access denied'
          );
          break;
        case 404:
          domainError = new NotFoundError(
            error.error?.message || 'Resource not found'
          );
          break;
        case 409:
          domainError = {
            code: 'CONFLICT',
            message: error.error?.message || 'Resource conflict'
          };
          break;
        case 422:
          domainError = new ValidationError(
            error.error?.message || 'Validation failed',
            error.error?.details
          );
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          domainError = {
            code: 'SERVER_ERROR',
            message: 'Server error. Please try again later.'
          };
          break;
        default:
          domainError = {
            code: 'UNKNOWN_ERROR',
            message: error.error?.message || 'An unexpected error occurred'
          };
      }
    }

    // Log error in development
    if (!environment.production) {
      console.error('[API Error]', {
        status: error.status,
        message: error.message,
        error: domainError
      });
    }

    return of(Result.fail<T, DomainError>(domainError));
  }
}
