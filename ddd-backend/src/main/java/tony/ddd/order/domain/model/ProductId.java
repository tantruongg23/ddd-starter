package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.Identifier;

/**
 * Value Object representing the unique identifier of a Product.
 * Referenced by OrderItem to identify the product being ordered.
 */
public class ProductId extends Identifier {

    private ProductId(String value) {
        super(value);
    }

    /**
     * Creates a new ProductId with a generated UUID.
     */
    public static ProductId generate() {
        return new ProductId(generateNewId());
    }

    /**
     * Creates a ProductId from an existing string value.
     */
    public static ProductId of(String value) {
        return new ProductId(value);
    }
}
