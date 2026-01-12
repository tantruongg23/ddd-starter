package tony.ddd.order.application.dto;

import tony.ddd.order.domain.model.Address;

/**
 * Data Transfer Object for Address.
 */
public record AddressDto(
    String street,
    String city,
    String state,
    String zipCode,
    String country,
    String fullAddress
) {

    /**
     * Creates an AddressDto from an Address domain object.
     */
    public static AddressDto fromDomain(Address address) {
        return new AddressDto(
            address.street(),
            address.city(),
            address.state(),
            address.zipCode(),
            address.country(),
            address.getFullAddress()
        );
    }
}
