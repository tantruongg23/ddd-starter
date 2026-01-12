/**
 * Order Domain package - the heart of the Order bounded context.
 * 
 * <p>This package contains the core domain model following DDD principles:</p>
 * 
 * <h2>Subpackages:</h2>
 * <ul>
 *   <li><b>model</b> - Contains the Order aggregate with its entities and value objects</li>
 *   <li><b>event</b> - Domain events raised by the Order aggregate</li>
 *   <li><b>repository</b> - Repository interfaces (ports) for persistence abstraction</li>
 *   <li><b>service</b> - Domain services for cross-aggregate business logic</li>
 *   <li><b>exception</b> - Domain-specific exceptions</li>
 * </ul>
 * 
 * <h2>Key Domain Concepts:</h2>
 * <ul>
 *   <li><b>Order</b> - The aggregate root managing order lifecycle</li>
 *   <li><b>OrderItem</b> - Entity representing items within an order</li>
 *   <li><b>Money</b> - Value object for monetary amounts</li>
 *   <li><b>Address</b> - Value object for shipping addresses</li>
 *   <li><b>OrderStatus</b> - Enum representing order states with transition rules</li>
 * </ul>
 * 
 * <p>The domain layer is independent of infrastructure and application concerns.</p>
 */
package tony.ddd.order.domain;
