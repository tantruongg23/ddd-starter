package tony.ddd.order.application.port.out;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Output port for Order to query product information from Catalog.
 * This allows the Order context to validate products without depending
 * directly on the Catalog context.
 */
public interface ProductPort {

    /**
     * Information about a product needed by Order context.
     */
    record ProductInfo(
        String productId,
        String name,
        BigDecimal price,
        String currency,
        boolean availableForPurchase
    ) {}

    /**
     * Finds product information by product ID.
     *
     * @param productId The product ID to look up
     * @return Optional containing product info if found
     */
    Optional<ProductInfo> findProduct(String productId);

    /**
     * Checks if a product exists and is available for purchase.
     *
     * @param productId The product ID to check
     * @return true if product exists and is active
     */
    boolean isProductAvailable(String productId);

    /**
     * Gets the current price of a product.
     *
     * @param productId The product ID
     * @return Optional containing the price if product exists
     */
    Optional<BigDecimal> getProductPrice(String productId);
}
