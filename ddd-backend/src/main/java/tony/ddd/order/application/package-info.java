/**
 * Order Application package - orchestrates use cases and application services.
 * 
 * <p>This package implements the application layer following DDD and 
 * Hexagonal Architecture (Ports & Adapters) patterns:</p>
 * 
 * <h2>Subpackages:</h2>
 * <ul>
 *   <li><b>command</b> - Command objects for write operations (CQRS)</li>
 *   <li><b>query</b> - Query objects for read operations (CQRS)</li>
 *   <li><b>dto</b> - Data Transfer Objects for layer boundaries</li>
 *   <li><b>service</b> - Application services implementing use cases</li>
 *   <li><b>port/in</b> - Input ports (use case interfaces)</li>
 * </ul>
 * 
 * <h2>Key Patterns:</h2>
 * <ul>
 *   <li><b>CQRS</b> - Separates commands (writes) from queries (reads)</li>
 *   <li><b>Use Cases</b> - Each use case has a clear interface</li>
 *   <li><b>Application Services</b> - Orchestrate domain objects and services</li>
 *   <li><b>DTOs</b> - Isolate domain model from external representations</li>
 * </ul>
 * 
 * <p>The application layer depends on the domain layer but not on infrastructure.</p>
 */
package tony.ddd.order.application;
