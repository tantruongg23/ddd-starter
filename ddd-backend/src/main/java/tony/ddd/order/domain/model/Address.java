package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.DomainException;
import tony.ddd.shared.domain.ValueObject;

/**
 * Value Object representing a shipping address.
 * Immutable and self-validating.
 */
public record Address(
    String street,
    String city,
    String state,
    String zipCode,
    String country
) implements ValueObject {

    public Address {
        if (street == null || street.isBlank()) {
            throw new DomainException("INVALID_ADDRESS", "Street is required");
        }
        if (city == null || city.isBlank()) {
            throw new DomainException("INVALID_ADDRESS", "City is required");
        }
        if (state == null || state.isBlank()) {
            throw new DomainException("INVALID_ADDRESS", "State is required");
        }
        if (zipCode == null || zipCode.isBlank()) {
            throw new DomainException("INVALID_ADDRESS", "Zip code is required");
        }
        if (country == null || country.isBlank()) {
            throw new DomainException("INVALID_ADDRESS", "Country is required");
        }
        
        street = street.trim();
        city = city.trim();
        state = state.trim();
        zipCode = zipCode.trim();
        country = country.trim();
    }

    /**
     * Creates an Address with all required fields.
     */
    public static Address of(String street, String city, String state, String zipCode, String country) {
        return new Address(street, city, state, zipCode, country);
    }

    /**
     * Returns the full address as a formatted string.
     */
    public String getFullAddress() {
        return String.format("%s, %s, %s %s, %s", street, city, state, zipCode, country);
    }

    @Override
    public String toString() {
        return getFullAddress();
    }
}
