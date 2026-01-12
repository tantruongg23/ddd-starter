package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.Identifier;

/**
 * Value Object representing the unique identifier of an OrderItem.
 */
public class OrderItemId extends Identifier {

    private OrderItemId(String value) {
        super(value);
    }

    /**
     * Creates a new OrderItemId with a generated UUID.
     */
    public static OrderItemId generate() {
        return new OrderItemId(generateNewId());
    }

    /**
     * Creates an OrderItemId from an existing string value.
     */
    public static OrderItemId of(String value) {
        return new OrderItemId(value);
    }
}
