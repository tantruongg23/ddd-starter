package tony.ddd.order.application.query;

import tony.ddd.shared.application.Query;

/**
 * Query to get all Orders for a specific customer.
 */
public record GetOrdersByCustomerQuery(String customerId) implements Query {
}
