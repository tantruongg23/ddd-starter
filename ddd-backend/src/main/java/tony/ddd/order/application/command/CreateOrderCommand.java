package tony.ddd.order.application.command;

import tony.ddd.shared.application.Command;

import java.util.List;

/**
 * Command to create a new Order.
 * Commands are immutable and contain all information needed to perform the action.
 */
public record CreateOrderCommand(
    String customerId,
    AddressData shippingAddress,
    List<OrderItemData> items
) implements Command {

    /**
     * Nested record for address data in the command.
     */
    public record AddressData(
        String street,
        String city,
        String state,
        String zipCode,
        String country
    ) {}

    /**
     * Nested record for order item data in the command.
     */
    public record OrderItemData(
        String productId,
        String productName,
        double unitPrice,
        int quantity
    ) {}
}
