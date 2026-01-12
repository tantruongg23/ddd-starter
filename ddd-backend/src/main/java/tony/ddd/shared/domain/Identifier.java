package tony.ddd.shared.domain;

import java.util.Objects;
import java.util.UUID;

/**
 * Base class for strongly-typed identifiers.
 * Provides type safety for entity IDs to prevent mixing up different entity types.
 */
public abstract class Identifier implements ValueObject {

    private final String value;

    protected Identifier(String value) {
        if (value == null || value.isBlank()) {
            throw new DomainException("INVALID_ID", "Identifier cannot be null or blank");
        }
        this.value = value;
    }

    /**
     * Creates a new random identifier.
     */
    protected static String generateNewId() {
        return UUID.randomUUID().toString();
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Identifier that = (Identifier) o;
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
