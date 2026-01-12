package tony.ddd.order.application.command;

import tony.ddd.shared.application.Command;

/**
 * Command to remove an item from an existing Order.
 */
public record RemoveOrderItemCommand(
    String orderId,
    String productId
) implements Command {
}
