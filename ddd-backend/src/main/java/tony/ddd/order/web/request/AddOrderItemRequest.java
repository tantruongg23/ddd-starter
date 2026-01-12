package tony.ddd.order.web.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import tony.ddd.order.application.command.AddOrderItemCommand;

/**
 * Request object for adding an item to an Order.
 */
@Schema(description = "Request to add an item to an existing order")
public record AddOrderItemRequest(
    @Schema(
        description = "Product identifier",
        example = "prod-xyz789",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Product ID is required")
    String productId,

    @Schema(
        description = "Product name at time of adding",
        example = "USB-C Charging Cable",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Product name is required")
    String productName,

    @Schema(
        description = "Unit price (must be positive)",
        example = "19.99",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Positive(message = "Unit price must be positive")
    double unitPrice,

    @Schema(
        description = "Quantity to add (must be positive)",
        example = "3",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Positive(message = "Quantity must be positive")
    int quantity
) {

    /**
     * Converts this request to an application command.
     */
    public AddOrderItemCommand toCommand(String orderId) {
        return new AddOrderItemCommand(orderId, productId, productName, unitPrice, quantity);
    }
}
