/**
 * HATEOAS (Hypermedia as the Engine of Application State) Models
 * 
 * These types represent the hypermedia link structure returned by Spring HATEOAS.
 * Links enable clients to discover available actions without hardcoding URLs.
 */

/**
 * Single HATEOAS link
 * Represents a navigable hypermedia link returned by the server
 */
export interface HateoasLink {
  /** The URL of the linked resource */
  href: string;
  /** Whether the link is templated (contains URL template variables) */
  templated?: boolean;
  /** Optional link type (HTTP method hint) */
  type?: string;
  /** Optional deprecation URL */
  deprecation?: string;
  /** Optional profile URI */
  profile?: string;
  /** Optional title for the link */
  title?: string;
  /** Optional language tag */
  hreflang?: string;
  /** Optional name attribute */
  name?: string;
}

/**
 * Collection of HATEOAS links keyed by relation name
 * Common relations:
 * - self: Link to the resource itself
 * - collection: Link to the parent collection
 * - create: Link to create a new resource
 * - update: Link to update the resource
 * - delete: Link to delete the resource
 * - next/prev/first/last: Pagination links
 */
export interface HateoasLinks {
  self?: HateoasLink;
  [rel: string]: HateoasLink | HateoasLink[] | undefined;
}

/**
 * Base interface for resources that include HATEOAS links
 */
export interface HateoasResource<T = unknown> {
  _links?: HateoasLinks;
  _embedded?: Record<string, unknown>;
}

/**
 * Paginated collection response with HATEOAS links
 */
export interface HateoasPagedResource<T> extends HateoasResource {
  _embedded: {
    [key: string]: T[];
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

/**
 * Type that adds HATEOAS links to any DTO
 */
export type WithLinks<T> = T & HateoasResource;

/**
 * Link relation constants - common HATEOAS relations
 */
export const LinkRel = {
  // Navigation
  SELF: 'self',
  COLLECTION: 'collection',
  FIRST: 'first',
  LAST: 'last',
  NEXT: 'next',
  PREV: 'prev',
  
  // CRUD operations
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Product-specific relations
  PRODUCTS: 'products',
  ADD_TO_CART: 'add-to-cart',
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  
  // Order-specific relations
  ORDERS: 'orders',
  SUBMIT: 'submit',
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  SHIP: 'ship',
  DELIVER: 'deliver',
  ADD_ITEM: 'add-item',
  REMOVE_ITEM: 'remove-item',
  UPDATE_ITEM: 'update-item',
  SET_CUSTOMER_INFO: 'set-customer-info',
  CUSTOMER_ORDERS: 'customer-orders',
  
  // Category-specific relations
  CATEGORIES: 'categories',
  PARENT: 'parent',
  CHILDREN: 'children',
} as const;

export type LinkRelType = typeof LinkRel[keyof typeof LinkRel] | string;

/**
 * Parsed link with extracted URL components
 */
export interface ParsedLink {
  href: string;
  rel: string;
  method?: string;
  isTemplated: boolean;
  templateVariables?: string[];
}

/**
 * Available actions derived from HATEOAS links
 */
export interface ResourceActions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canSubmit: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  canShip: boolean;
  canDeliver: boolean;
  canAddItem: boolean;
  canRemoveItem: boolean;
  customActions: Map<string, HateoasLink>;
}
