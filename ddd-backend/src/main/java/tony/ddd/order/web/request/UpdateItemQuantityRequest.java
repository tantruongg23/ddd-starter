package tony.ddd.order.web.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import tony.ddd.order.application.command.UpdateItemQuantityCommand;

/**
 * Request object for updating the quantity of an item in an Order.
 */
@Schema(description = "Request to update item quantity in an order")
public record UpdateItemQuantityRequest(
    @Schema(
        description = "New quantity (must be positive)",
        example = "5",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Positive(message = "Quantity must be positive")
    int quantity
) {

    /**
     * Converts this request to an application command.
     */
    public UpdateItemQuantityCommand toCommand(String orderId, String productId) {
        return new UpdateItemQuantityCommand(orderId, productId, quantity);
    }
}
