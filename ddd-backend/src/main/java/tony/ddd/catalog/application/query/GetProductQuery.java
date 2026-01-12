package tony.ddd.catalog.application.query;

import tony.ddd.shared.application.Query;

/**
 * Query to get a single Product by ID.
 */
public record GetProductQuery(
    String productId
) implements Query {
}
