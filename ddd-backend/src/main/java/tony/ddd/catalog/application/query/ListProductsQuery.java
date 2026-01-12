package tony.ddd.catalog.application.query;

import tony.ddd.catalog.domain.model.ProductStatus;
import tony.ddd.shared.application.Query;

/**
 * Query to list Products with optional filtering by status.
 */
public record ListProductsQuery(
    ProductStatus status
) implements Query {

    /**
     * Creates a query to list all products regardless of status.
     */
    public static ListProductsQuery all() {
        return new ListProductsQuery(null);
    }

    /**
     * Creates a query to list products with a specific status.
     */
    public static ListProductsQuery byStatus(ProductStatus status) {
        return new ListProductsQuery(status);
    }

    /**
     * Returns true if this query should filter by status.
     */
    public boolean hasStatusFilter() {
        return status != null;
    }
}
