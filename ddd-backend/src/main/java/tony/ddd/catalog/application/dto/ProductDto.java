package tony.ddd.catalog.application.dto;

import tony.ddd.catalog.domain.model.Product;
import tony.ddd.catalog.domain.model.ProductStatus;

import java.math.BigDecimal;

/**
 * Data Transfer Object for Product.
 * Used to transfer product data across application boundaries.
 */
public record ProductDto(
    String id,
    String name,
    String description,
    BigDecimal price,
    String currency,
    String sku,
    ProductStatus status
) {
    /**
     * Creates a ProductDto from a Product domain entity.
     */
    public static ProductDto fromDomain(Product product) {
        return new ProductDto(
            product.getId().getValue(),
            product.getName(),
            product.getDescription(),
            product.getPrice().amount(),
            product.getPrice().currency().getCurrencyCode(),
            product.getSku(),
            product.getStatus()
        );
    }
}
