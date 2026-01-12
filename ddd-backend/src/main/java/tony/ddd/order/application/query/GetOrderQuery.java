package tony.ddd.order.application.query;

import tony.ddd.shared.application.Query;

/**
 * Query to get a single Order by ID.
 */
public record GetOrderQuery(String orderId) implements Query {
}
