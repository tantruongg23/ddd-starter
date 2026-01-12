package tony.ddd.catalog.web.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request object for updating product information.
 */
@Schema(description = "Request to update product name and description")
public record UpdateProductRequest(
    @Schema(
        description = "New product name",
        example = "Premium Wireless Bluetooth Headphones",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name cannot exceed 255 characters")
    String name,

    @Schema(
        description = "New product description",
        example = "Premium wireless headphones with enhanced bass and 40-hour battery life"
    )
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    String description
) {
}
