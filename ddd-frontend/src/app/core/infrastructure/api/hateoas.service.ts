import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  HateoasLink, 
  HateoasLinks, 
  HateoasResource, 
  ParsedLink, 
  ResourceActions,
  LinkRel,
  LinkRelType 
} from './hateoas.model';
import { Result, DomainError, ValidationError } from '../../domain/result';
import { environment } from '@env';

/**
 * HATEOAS Service
 * 
 * Provides utilities for working with hypermedia links in API responses.
 * Enables navigation through the API by following links rather than
 * constructing URLs manually.
 * 
 * Key capabilities:
 * - Extract and parse links from resources
 * - Follow links to fetch related resources
 * - Determine available actions based on links
 * - Expand templated URLs
 */
@Injectable({
  providedIn: 'root'
})
export class HateoasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/${environment.apiVersion}`;

  /**
   * Extracts a specific link from a resource by relation name
   */
  getLink<T extends HateoasResource>(resource: T, rel: LinkRelType): HateoasLink | null {
    if (!resource._links) return null;
    
    const link = resource._links[rel];
    if (!link) return null;
    
    // Handle array of links (return first one)
    return Array.isArray(link) ? link[0] : link;
  }

  /**
   * Gets all links with a specific relation (useful when multiple links share a rel)
   */
  getLinks<T extends HateoasResource>(resource: T, rel: LinkRelType): HateoasLink[] {
    if (!resource._links) return [];
    
    const link = resource._links[rel];
    if (!link) return [];
    
    return Array.isArray(link) ? link : [link];
  }

  /**
   * Checks if a resource has a specific link
   */
  hasLink<T extends HateoasResource>(resource: T, rel: LinkRelType): boolean {
    return this.getLink(resource, rel) !== null;
  }

  /**
   * Gets the href from a link, optionally expanding template variables
   */
  getHref<T extends HateoasResource>(
    resource: T, 
    rel: LinkRelType, 
    variables?: Record<string, string | number>
  ): string | null {
    const link = this.getLink(resource, rel);
    if (!link) return null;
    
    if (link.templated && variables) {
      return this.expandTemplate(link.href, variables);
    }
    
    return link.href;
  }

  /**
   * Follows a link and returns the response
   */
  follow<R>(link: HateoasLink | string, options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Observable<Result<R, DomainError>> {
    const href = typeof link === 'string' ? link : link.href;
    const method = options?.method ?? 'GET';
    const url = this.resolveUrl(href);

    const httpOptions: {
      headers?: HttpHeaders;
      params?: HttpParams;
    } = {};

    if (options?.headers) {
      httpOptions.headers = new HttpHeaders(options.headers);
    }

    if (options?.params) {
      httpOptions.params = new HttpParams({ fromObject: options.params });
    }

    let request$: Observable<R>;

    switch (method) {
      case 'POST':
        request$ = this.http.post<R>(url, options?.body, httpOptions);
        break;
      case 'PUT':
        request$ = this.http.put<R>(url, options?.body, httpOptions);
        break;
      case 'PATCH':
        request$ = this.http.patch<R>(url, options?.body, httpOptions);
        break;
      case 'DELETE':
        request$ = this.http.delete<R>(url, httpOptions);
        break;
      default:
        request$ = this.http.get<R>(url, httpOptions);
    }

    return request$.pipe(
      map(response => Result.ok<R, DomainError>(response)),
      catchError(error => {
        const domainError = this.mapHttpError(error);
        return of(Result.fail<R, DomainError>(domainError));
      })
    );
  }

  /**
   * Follows a link from a resource
   */
  followLink<T extends HateoasResource, R>(
    resource: T,
    rel: LinkRelType,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: unknown;
      params?: Record<string, string>;
      variables?: Record<string, string | number>;
    }
  ): Observable<Result<R, DomainError>> {
    const href = this.getHref(resource, rel, options?.variables);
    
    if (!href) {
      return of(Result.fail<R, DomainError>(
        new ValidationError(`Link '${rel}' not found on resource`)
      ));
    }

    return this.follow<R>(href, options);
  }

  /**
   * Parses a link into its components
   */
  parseLink(link: HateoasLink, rel: string): ParsedLink {
    const parsed: ParsedLink = {
      href: link.href,
      rel,
      isTemplated: link.templated ?? false,
    };

    if (link.type) {
      parsed.method = link.type;
    }

    if (parsed.isTemplated) {
      parsed.templateVariables = this.extractTemplateVariables(link.href);
    }

    return parsed;
  }

  /**
   * Parses all links from a resource
   */
  parseAllLinks<T extends HateoasResource>(resource: T): ParsedLink[] {
    if (!resource._links) return [];

    const parsed: ParsedLink[] = [];

    for (const [rel, link] of Object.entries(resource._links)) {
      if (link) {
        if (Array.isArray(link)) {
          link.forEach(l => parsed.push(this.parseLink(l, rel)));
        } else {
          parsed.push(this.parseLink(link, rel));
        }
      }
    }

    return parsed;
  }

  /**
   * Determines available actions based on the links present in a resource
   */
  getAvailableActions<T extends HateoasResource>(resource: T): ResourceActions {
    const links = resource._links ?? {};
    const customActions = new Map<string, HateoasLink>();

    // Collect custom actions (links not in standard set)
    const standardRels = new Set(Object.values(LinkRel));
    for (const [rel, link] of Object.entries(links)) {
      if (link && !standardRels.has(rel as typeof LinkRel[keyof typeof LinkRel])) {
        const singleLink = Array.isArray(link) ? link[0] : link;
        customActions.set(rel, singleLink);
      }
    }

    return {
      canCreate: this.hasLink(resource, LinkRel.CREATE),
      canUpdate: this.hasLink(resource, LinkRel.UPDATE),
      canDelete: this.hasLink(resource, LinkRel.DELETE),
      canActivate: this.hasLink(resource, LinkRel.ACTIVATE),
      canDeactivate: this.hasLink(resource, LinkRel.DEACTIVATE),
      canSubmit: this.hasLink(resource, LinkRel.SUBMIT),
      canConfirm: this.hasLink(resource, LinkRel.CONFIRM),
      canCancel: this.hasLink(resource, LinkRel.CANCEL),
      canShip: this.hasLink(resource, LinkRel.SHIP),
      canDeliver: this.hasLink(resource, LinkRel.DELIVER),
      canAddItem: this.hasLink(resource, LinkRel.ADD_ITEM),
      canRemoveItem: this.hasLink(resource, LinkRel.REMOVE_ITEM),
      customActions
    };
  }

  /**
   * Expands a URI template with the provided variables
   * Supports RFC 6570 URI Template Level 1 (simple string expansion)
   */
  expandTemplate(template: string, variables: Record<string, string | number>): string {
    return template.replace(/\{([^}]+)\}/g, (match, varName) => {
      const value = variables[varName];
      return value !== undefined ? encodeURIComponent(String(value)) : match;
    });
  }

  /**
   * Extracts template variable names from a templated URI
   */
  extractTemplateVariables(template: string): string[] {
    const matches = template.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    return matches.map(m => m.slice(1, -1));
  }

  /**
   * Builds a full URL from a potentially relative href
   */
  resolveUrl(href: string): string {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href;
    }

    // Handle absolute paths
    if (href.startsWith('/')) {
      // Extract base domain from environment API URL
      const match = environment.apiUrl.match(/^(https?:\/\/[^/]+)/);
      if (match) {
        return `${match[1]}${href}`;
      }
    }

    // Handle relative paths
    return `${this.baseUrl}/${href.replace(/^\//, '')}`;
  }

  /**
   * Extracts the self link href from a resource
   */
  getSelfHref<T extends HateoasResource>(resource: T): string | null {
    return this.getHref(resource, LinkRel.SELF);
  }

  /**
   * Maps HTTP errors to domain errors
   */
  private mapHttpError(error: { status?: number; error?: { message?: string } }): DomainError {
    const message = error.error?.message ?? 'An error occurred';
    
    switch (error.status) {
      case 400:
        return { code: 'VALIDATION_ERROR', message };
      case 401:
        return { code: 'UNAUTHORIZED', message: 'Authentication required' };
      case 403:
        return { code: 'FORBIDDEN', message: 'Access denied' };
      case 404:
        return { code: 'NOT_FOUND', message: 'Resource not found' };
      case 409:
        return { code: 'CONFLICT', message };
      default:
        return { code: 'UNKNOWN_ERROR', message };
    }
  }
}
