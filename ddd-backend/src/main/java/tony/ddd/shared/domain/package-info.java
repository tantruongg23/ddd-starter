/**
 * Shared Domain package - contains base classes for DDD building blocks.
 * 
 * <p>This package provides the foundational abstractions for implementing
 * Domain-Driven Design patterns:</p>
 * 
 * <ul>
 *   <li>{@link tony.ddd.shared.domain.AggregateRoot} - Base class for aggregate roots</li>
 *   <li>{@link tony.ddd.shared.domain.Entity} - Base class for domain entities</li>
 *   <li>{@link tony.ddd.shared.domain.ValueObject} - Marker interface for value objects</li>
 *   <li>{@link tony.ddd.shared.domain.Identifier} - Base class for strongly-typed IDs</li>
 *   <li>{@link tony.ddd.shared.domain.DomainEvent} - Base class for domain events</li>
 *   <li>{@link tony.ddd.shared.domain.DomainException} - Base exception for domain errors</li>
 * </ul>
 * 
 * <p>These building blocks are technology-agnostic and contain no infrastructure concerns.</p>
 */
package tony.ddd.shared.domain;
