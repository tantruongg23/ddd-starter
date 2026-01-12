package tony.ddd.catalog.web.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Request object for creating a new product.
 */
@Schema(description = "Request to create a new product in the catalog")
public record CreateProductRequest(
    @Schema(
        description = "Product name",
        example = "Wireless Bluetooth Headphones",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name cannot exceed 255 characters")
    String name,

    @Schema(
        description = "Product description",
        example = "High-quality wireless headphones with active noise cancellation and 30-hour battery life"
    )
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    String description,

    @Schema(
        description = "Product price (must be positive)",
        example = "149.99",
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
    String currency,

    @Schema(
        description = "Stock Keeping Unit - unique product identifier",
        example = "WBH-2024-BLK",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU cannot exceed 50 characters")
    String sku
) {
}
