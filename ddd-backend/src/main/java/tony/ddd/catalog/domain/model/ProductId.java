package tony.ddd.catalog.domain.model;

import tony.ddd.shared.domain.Identifier;

import java.util.Objects;
import java.util.UUID;

/**
 * Strongly-typed identifier for Product aggregate.
 */
public class ProductId extends Identifier {

    private ProductId(String value) {
        super(value);
    }

    public static ProductId of(String value) {
        Objects.requireNonNull(value, "ProductId value cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("ProductId value cannot be blank");
        }
        return new ProductId(value);
    }

    public static ProductId generate() {
        return new ProductId(UUID.randomUUID().toString());
    }

    @Override
    public String toString() {
        return "ProductId{" + getValue() + "}";
    }
}
