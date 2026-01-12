/**
 * Result Pattern Implementation
 * 
 * The Result pattern is used to handle operations that can fail without using exceptions.
 * It provides a functional approach to error handling and makes the flow explicit.
 * 
 * Benefits:
 * - Explicit error handling (no hidden exceptions)
 * - Type-safe error information
 * - Chainable operations
 * - Clear success/failure paths
 */

/**
 * Represents the result of an operation that can either succeed or fail.
 */
export class Result<T, E = string> {
  private readonly _isSuccess: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    this._isSuccess = isSuccess;
    this._value = value;
    this._error = error;
  }

  /**
   * Creates a successful result with the given value.
   */
  static ok<T, E = string>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  /**
   * Creates a successful result with no value (void operations).
   */
  static okVoid<E = string>(): Result<void, E> {
    return new Result<void, E>(true);
  }

  /**
   * Creates a failed result with the given error.
   */
  static fail<T, E = string>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * Combines multiple results into a single result.
   * Fails if any result fails.
   */
  static combine<E = string>(results: Result<unknown, E>[]): Result<void, E> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error);
      }
    }
    return Result.okVoid();
  }

  /**
   * Wraps a function that may throw into a Result.
   */
  static fromTry<T>(fn: () => T): Result<T, Error> {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Wraps an async function that may throw into a Result.
   */
  static async fromTryAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      return Result.ok(await fn());
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Gets the value. Throws if the result is a failure.
   */
  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot access value of a failed result');
    }
    return this._value as T;
  }

  /**
   * Gets the error. Throws if the result is a success.
   */
  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot access error of a successful result');
    }
    return this._error as E;
  }

  /**
   * Gets the value or returns a default if the result is a failure.
   */
  getOrDefault(defaultValue: T): T {
    return this._isSuccess ? (this._value as T) : defaultValue;
  }

  /**
   * Gets the value or null if the result is a failure.
   */
  getOrNull(): T | null {
    return this._isSuccess ? (this._value as T) : null;
  }

  /**
   * Maps the value to a new value if successful.
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.ok(fn(this._value as T));
    }
    return Result.fail(this._error as E);
  }

  /**
   * Flat maps the value to a new Result if successful.
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value as T);
    }
    return Result.fail(this._error as E);
  }

  /**
   * Maps the error to a new error if failed.
   */
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this._isSuccess) {
      return Result.ok(this._value as T);
    }
    return Result.fail(fn(this._error as E));
  }

  /**
   * Executes a function if the result is successful.
   */
  onSuccess(fn: (value: T) => void): Result<T, E> {
    if (this._isSuccess) {
      fn(this._value as T);
    }
    return this;
  }

  /**
   * Executes a function if the result is a failure.
   */
  onFailure(fn: (error: E) => void): Result<T, E> {
    if (!this._isSuccess) {
      fn(this._error as E);
    }
    return this;
  }

  /**
   * Pattern matching for Result
   */
  match<U>(handlers: { success: (value: T) => U; failure: (error: E) => U }): U {
    return this._isSuccess 
      ? handlers.success(this._value as T) 
      : handlers.failure(this._error as E);
  }
}

/**
 * Error types for domain operations
 */
export interface DomainError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ValidationError implements DomainError {
  readonly code = 'VALIDATION_ERROR';
  
  constructor(
    readonly message: string,
    readonly details?: Record<string, unknown>
  ) {}
}

export class NotFoundError implements DomainError {
  readonly code = 'NOT_FOUND';
  
  constructor(
    readonly message: string,
    readonly details?: Record<string, unknown>
  ) {}
}

export class UnauthorizedError implements DomainError {
  readonly code = 'UNAUTHORIZED';
  
  constructor(
    readonly message: string = 'Unauthorized access',
    readonly details?: Record<string, unknown>
  ) {}
}

export class ConflictError implements DomainError {
  readonly code = 'CONFLICT';
  
  constructor(
    readonly message: string,
    readonly details?: Record<string, unknown>
  ) {}
}
