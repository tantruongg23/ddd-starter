package tony.ddd.catalog.domain.exception;

import tony.ddd.shared.domain.DomainException;

/**
 * Exception thrown when a Product is not found.
 */
public class ProductNotFoundException extends DomainException {

    public ProductNotFoundException(String productId) {
        super("PRODUCT_NOT_FOUND", "Product not found with ID: " + productId);
    }

    public ProductNotFoundException(String productId, String message) {
        super("PRODUCT_NOT_FOUND", message);
    }
}
