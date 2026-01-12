package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.DomainException;
import tony.ddd.shared.domain.ValueObject;

import java.time.Year;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

/**
 * Value Object representing a human-readable order reference.
 * Format: ORD-YYYY-NNNNN (e.g., ORD-2026-00001)
 */
public final class OrderNumber implements ValueObject {

    private static final String PREFIX = "ORD";
    private static final Pattern PATTERN = Pattern.compile("^ORD-\\d{4}-\\d{5}$");
    private static final AtomicInteger SEQUENCE = new AtomicInteger(0);

    private final String value;

    private OrderNumber(String value) {
        this.value = value;
        validate();
    }

    /**
     * Generates a new OrderNumber with the current year and next sequence number.
     */
    public static OrderNumber generate() {
        int year = Year.now().getValue();
        int sequence = SEQUENCE.incrementAndGet();
        String value = String.format("%s-%d-%05d", PREFIX, year, sequence);
        return new OrderNumber(value);
    }

    /**
     * Creates an OrderNumber from an existing value (for reconstitution from persistence).
     */
    public static OrderNumber of(String value) {
        return new OrderNumber(value);
    }

    @Override
    public void validate() {
        if (value == null || value.isBlank()) {
            throw new DomainException("INVALID_ORDER_NUMBER", "Order number cannot be null or blank");
        }
        if (!PATTERN.matcher(value).matches()) {
            throw new DomainException("INVALID_ORDER_NUMBER", 
                "Order number must match format ORD-YYYY-NNNNN: " + value);
        }
    }

    public String getValue() {
        return value;
    }

    /**
     * Extracts the year from the order number.
     */
    public int getYear() {
        String[] parts = value.split("-");
        return Integer.parseInt(parts[1]);
    }

    /**
     * Extracts the sequence number from the order number.
     */
    public int getSequence() {
        String[] parts = value.split("-");
        return Integer.parseInt(parts[2]);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderNumber that = (OrderNumber) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
