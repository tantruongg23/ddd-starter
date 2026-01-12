package tony.ddd.order.application.command;

import tony.ddd.shared.application.Command;

/**
 * Command to add an item to an existing Order.
 */
public record AddOrderItemCommand(
    String orderId,
    String productId,
    String productName,
    double unitPrice,
    int quantity
) implements Command {
}
