/**
 * Base Value Object Abstract Class
 * 
 * In DDD, Value Objects are objects that describe some characteristic or attribute
 * but carry no concept of identity. They are immutable and are compared by their
 * attribute values rather than by identity.
 * 
 * Key characteristics:
 * - Immutable (cannot be changed after creation)
 * - No identity - equality based on all attribute values
 * - Self-validating (throws on invalid state)
 * - Side-effect free behavior
 * 
 * Examples: Money, Address, Email, DateRange, Quantity
 */
export abstract class ValueObject<T extends Record<string, unknown>> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.validate(props);
    this.props = Object.freeze(props) as T;
  }

  /**
   * Validates the value object properties.
   * Override this method to implement validation logic.
   * Should throw an error if validation fails.
   */
  protected abstract validate(props: T): void;

  /**
   * Compares two value objects for equality.
   * Value objects are equal if all their properties are equal.
   */
  equals(other: ValueObject<T> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (other.constructor !== this.constructor) {
      return false;
    }

    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  /**
   * Creates a copy of the value object with updated properties.
   * This enables immutable updates.
   */
  protected clone(overrides: Partial<T>): T {
    return { ...this.props, ...overrides };
  }
}

/**
 * Money Value Object
 * 
 * Represents a monetary amount with currency.
 * Provides safe money operations.
 */
export class Money extends ValueObject<{ amount: number; currency: string }> {
  private constructor(props: { amount: number; currency: string }) {
    super(props);
  }

  static create(amount: number, currency: string = 'USD'): Money {
    return new Money({ amount, currency });
  }

  static zero(currency: string = 'USD'): Money {
    return new Money({ amount: 0, currency });
  }

  protected validate(props: { amount: number; currency: string }): void {
    if (typeof props.amount !== 'number' || isNaN(props.amount)) {
      throw new Error('Money amount must be a valid number');
    }
    if (!props.currency || props.currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot perform operation on different currencies: ${this.currency} vs ${other.currency}`);
    }
  }
}

/**
 * Email Value Object
 * 
 * Represents a validated email address.
 */
export class Email extends ValueObject<{ value: string }> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): Email {
    return new Email({ value: value.toLowerCase().trim() });
  }

  protected validate(props: { value: string }): void {
    if (!props.value || !Email.EMAIL_REGEX.test(props.value)) {
      throw new Error('Invalid email format');
    }
  }

  get value(): string {
    return this.props.value;
  }

  getDomain(): string {
    return this.props.value.split('@')[1];
  }
}

/**
 * Quantity Value Object
 * 
 * Represents a non-negative quantity.
 */
export class Quantity extends ValueObject<{ value: number }> {
  private constructor(props: { value: number }) {
    super(props);
  }

  static create(value: number): Quantity {
    return new Quantity({ value });
  }

  static zero(): Quantity {
    return new Quantity({ value: 0 });
  }

  protected validate(props: { value: number }): void {
    if (!Number.isInteger(props.value) || props.value < 0) {
      throw new Error('Quantity must be a non-negative integer');
    }
  }

  get value(): number {
    return this.props.value;
  }

  add(amount: number): Quantity {
    return Quantity.create(this.value + amount);
  }

  subtract(amount: number): Quantity {
    return Quantity.create(this.value - amount);
  }

  isZero(): boolean {
    return this.value === 0;
  }
}
