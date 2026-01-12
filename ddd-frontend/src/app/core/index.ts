/**
 * Core Module Public API
 * 
 * This barrel file exports all public APIs from the core module.
 * Import from '@core' to access these exports.
 */

// Domain Base Classes
export * from './domain/base-entity';
export * from './domain/base-value-object';
export * from './domain/result';

// Infrastructure
export * from './infrastructure/api/api.service';
export * from './infrastructure/api/api.interceptor';
export * from './infrastructure/api/hateoas.model';
export * from './infrastructure/api/hateoas.service';
export * from './infrastructure/storage/local-storage.service';

// Guards
export * from './guards/auth.guard';

// Utils
export * from './utils/signal-utils';
export * from './utils/validators';
