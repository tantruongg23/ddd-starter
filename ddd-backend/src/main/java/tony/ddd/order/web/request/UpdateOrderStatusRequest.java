package tony.ddd.order.web.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import tony.ddd.order.application.command.UpdateOrderStatusCommand;
import tony.ddd.order.domain.model.OrderStatus;

/**
 * Request object for updating an Order's status.
 */
@Schema(description = "Request to update order status")
public record UpdateOrderStatusRequest(
    @Schema(
        description = "Target status for the order",
        example = "CONFIRMED",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "Status is required")
    OrderStatus status,
    
    @Schema(
        description = "Reason for status change (required for cancellation)",
        example = "Customer requested cancellation"
    )
    String reason
) {

    /**
     * Converts this request to an application command.
     */
    public UpdateOrderStatusCommand toCommand(String orderId) {
        return new UpdateOrderStatusCommand(orderId, status, reason);
    }
}
