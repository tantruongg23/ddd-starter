/**
 * Order Infrastructure package - technical implementations and adapters.
 * 
 * <p>This package contains infrastructure concerns following 
 * Hexagonal Architecture (Ports & Adapters):</p>
 * 
 * <h2>Subpackages:</h2>
 * <ul>
 *   <li><b>persistence/entity</b> - JPA entities for database mapping</li>
 *   <li><b>persistence/repository</b> - Spring Data JPA repositories</li>
 *   <li><b>persistence/mapper</b> - Mappers between domain and persistence models</li>
 *   <li><b>persistence/adapter</b> - Adapters implementing domain repository ports</li>
 *   <li><b>event</b> - Event listeners and handlers</li>
 * </ul>
 * 
 * <h2>Key Patterns:</h2>
 * <ul>
 *   <li><b>Adapter Pattern</b> - Adapters implement domain ports</li>
 *   <li><b>Repository Pattern</b> - Abstracts persistence details</li>
 *   <li><b>Separation of Models</b> - JPA entities separate from domain entities</li>
 * </ul>
 * 
 * <p>The infrastructure layer implements the domain's ports without polluting 
 * the domain with technical concerns.</p>
 */
package tony.ddd.order.infrastructure;
