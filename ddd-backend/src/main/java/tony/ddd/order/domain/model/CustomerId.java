package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.Identifier;

/**
 * Value Object representing the unique identifier of a Customer.
 * Referenced by Order aggregate to identify the customer who placed the order.
 */
public class CustomerId extends Identifier {

    private CustomerId(String value) {
        super(value);
    }

    /**
     * Creates a new CustomerId with a generated UUID.
     */
    public static CustomerId generate() {
        return new CustomerId(generateNewId());
    }

    /**
     * Creates a CustomerId from an existing string value.
     */
    public static CustomerId of(String value) {
        return new CustomerId(value);
    }
}
