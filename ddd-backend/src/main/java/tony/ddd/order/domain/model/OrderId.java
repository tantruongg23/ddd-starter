package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.Identifier;

/**
 * Value Object representing the unique identifier of an Order.
 * Provides type safety to prevent mixing Order IDs with other entity IDs.
 */
public class OrderId extends Identifier {

    private OrderId(String value) {
        super(value);
    }

    /**
     * Creates a new OrderId with a generated UUID.
     */
    public static OrderId generate() {
        return new OrderId(generateNewId());
    }

    /**
     * Creates an OrderId from an existing string value.
     */
    public static OrderId of(String value) {
        return new OrderId(value);
    }
}
