package tony.ddd.catalog.web.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Request object for updating a product's price.
 */
@Schema(description = "Request to update product price")
public record UpdatePriceRequest(
    @Schema(
        description = "New product price (must be positive)",
        example = "129.99",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    BigDecimal price,

    @Schema(
        description = "Currency code (ISO 4217)",
        example = "USD",
        minLength = 3,
        maxLength = 3,
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    String currency
) {
}
