package tony.ddd.order.application.query;

import tony.ddd.order.domain.model.OrderStatus;
import tony.ddd.shared.application.Query;

/**
 * Query to get all Orders with a specific status.
 */
public record GetOrdersByStatusQuery(OrderStatus status) implements Query {
}
