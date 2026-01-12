package tony.ddd.order.application.command;

import tony.ddd.order.domain.model.OrderStatus;
import tony.ddd.shared.application.Command;

/**
 * Command to update an Order's status.
 */
public record UpdateOrderStatusCommand(
    String orderId,
    OrderStatus newStatus,
    String reason  // Optional, required for cancellation
) implements Command {

    /**
     * Creates a command to update status (without reason).
     */
    public static UpdateOrderStatusCommand of(String orderId, OrderStatus newStatus) {
        return new UpdateOrderStatusCommand(orderId, newStatus, null);
    }

    /**
     * Creates a cancellation command with reason.
     */
    public static UpdateOrderStatusCommand cancel(String orderId, String reason) {
        return new UpdateOrderStatusCommand(orderId, OrderStatus.CANCELLED, reason);
    }
}
