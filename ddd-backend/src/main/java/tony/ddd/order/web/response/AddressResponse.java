package tony.ddd.order.web.response;

import io.swagger.v3.oas.annotations.media.Schema;
import tony.ddd.order.application.dto.AddressDto;

/**
 * Response model for Address.
 */
@Schema(description = "Shipping address details")
public record AddressResponse(
    @Schema(description = "Street address", example = "123 Main Street")
    String street,

    @Schema(description = "City name", example = "San Francisco")
    String city,

    @Schema(description = "State or province", example = "CA")
    String state,

    @Schema(description = "ZIP or postal code", example = "94105")
    String zipCode,

    @Schema(description = "Country name", example = "USA")
    String country,

    @Schema(description = "Full formatted address", example = "123 Main Street, San Francisco, CA 94105, USA")
    String fullAddress
) {

    /**
     * Creates an AddressResponse from an AddressDto.
     */
    public static AddressResponse fromDto(AddressDto dto) {
        return new AddressResponse(
            dto.street(),
            dto.city(),
            dto.state(),
            dto.zipCode(),
            dto.country(),
            dto.fullAddress()
        );
    }
}
