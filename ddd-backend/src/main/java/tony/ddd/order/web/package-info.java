/**
 * Order Web package - REST API controllers and HATEOAS support.
 * 
 * <p>This package implements the web/interface layer:</p>
 * 
 * <h2>Subpackages:</h2>
 * <ul>
 *   <li><b>controller</b> - REST controllers handling HTTP requests</li>
 *   <li><b>request</b> - Request DTOs with validation annotations</li>
 *   <li><b>response</b> - Response DTOs with HATEOAS support</li>
 *   <li><b>assembler</b> - HATEOAS model assemblers for hypermedia links</li>
 * </ul>
 * 
 * <h2>RESTful HATEOAS Features:</h2>
 * <ul>
 *   <li><b>Hypermedia Links</b> - Each resource includes relevant links</li>
 *   <li><b>Self-describing API</b> - Clients can navigate via links</li>
 *   <li><b>State Transitions</b> - Available actions based on current state</li>
 *   <li><b>HAL Format</b> - Standard hypermedia format</li>
 * </ul>
 * 
 * <h2>API Endpoints:</h2>
 * <ul>
 *   <li>GET /api/v1 - API root with available resources</li>
 *   <li>GET /api/v1/orders - List all orders</li>
 *   <li>POST /api/v1/orders - Create a new order</li>
 *   <li>GET /api/v1/orders/{id} - Get order by ID</li>
 *   <li>PATCH /api/v1/orders/{id}/status - Update order status</li>
 *   <li>POST /api/v1/orders/{id}/items - Add item to order</li>
 *   <li>DELETE /api/v1/orders/{id}/items/{productId} - Remove item</li>
 * </ul>
 */
package tony.ddd.order.web;
