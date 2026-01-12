package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.DomainException;
import tony.ddd.shared.domain.ValueObject;

/**
 * Value Object representing a quantity of items.
 * Ensures quantity is always positive.
 */
public record Quantity(int value) implements ValueObject {

    public static final int MIN_VALUE = 1;
    public static final int MAX_VALUE = 9999;

    public Quantity {
        if (value < MIN_VALUE) {
            throw new DomainException("INVALID_QUANTITY", 
                "Quantity must be at least " + MIN_VALUE);
        }
        if (value > MAX_VALUE) {
            throw new DomainException("INVALID_QUANTITY", 
                "Quantity cannot exceed " + MAX_VALUE);
        }
    }

    /**
     * Creates a Quantity from an integer value.
     */
    public static Quantity of(int value) {
        return new Quantity(value);
    }

    /**
     * Adds to this quantity.
     */
    public Quantity add(Quantity other) {
        return new Quantity(this.value + other.value);
    }

    /**
     * Subtracts from this quantity.
     */
    public Quantity subtract(Quantity other) {
        return new Quantity(this.value - other.value);
    }

    /**
     * Checks if this quantity is greater than another.
     */
    public boolean isGreaterThan(Quantity other) {
        return this.value > other.value;
    }

    @Override
    public String toString() {
        return String.valueOf(value);
    }
}
