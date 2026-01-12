/**
 * Base Entity Abstract Class
 * 
 * In DDD, Entities are objects that have a distinct identity that runs through time
 * and different states. This base class provides common functionality for all entities.
 * 
 * Key characteristics:
 * - Has a unique identifier
 * - Identity remains constant even if attributes change
 * - Equality is based on identity, not attributes
 */
export abstract class BaseEntity<TId = string> {
  protected readonly _id: TId;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
  }

  get id(): TId {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Marks the entity as updated
   */
  protected markAsUpdated(): void {
    this._updatedAt = new Date();
  }

  /**
   * Compares two entities for equality based on their identifiers
   */
  equals(other: BaseEntity<TId> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (!(other instanceof BaseEntity)) {
      return false;
    }

    return this._id === other._id;
  }
}

/**
 * Base Aggregate Root Abstract Class
 * 
 * An Aggregate is a cluster of domain objects that can be treated as a single unit.
 * The Aggregate Root is the entry point to the aggregate and ensures consistency.
 * 
 * Key characteristics:
 * - External objects can only reference the root
 * - The root enforces invariants across the aggregate
 * - Changes to the aggregate go through the root
 */
export abstract class AggregateRoot<TId = string> extends BaseEntity<TId> {
  private _domainEvents: DomainEvent[] = [];

  /**
   * Gets all pending domain events
   */
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return [...this._domainEvents];
  }

  /**
   * Adds a domain event to be dispatched
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Clears all domain events (call after dispatching)
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}

/**
 * Domain Event Interface
 * 
 * Domain events represent something that happened in the domain
 * that domain experts care about.
 */
export interface DomainEvent {
  readonly eventType: string;
  readonly occurredOn: Date;
  readonly aggregateId: string;
}
