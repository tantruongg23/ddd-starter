package tony.ddd.order.application.command;

import tony.ddd.shared.application.Command;

/**
 * Command to update the quantity of an item in an order.
 * Only allowed when the order is in DRAFT status.
 */
public record UpdateItemQuantityCommand(
    String orderId,
    String productId,
    int quantity
) implements Command {

    /**
     * Creates an update item quantity command.
     */
    public static UpdateItemQuantityCommand of(String orderId, String productId, int quantity) {
        return new UpdateItemQuantityCommand(orderId, productId, quantity);
    }
}
