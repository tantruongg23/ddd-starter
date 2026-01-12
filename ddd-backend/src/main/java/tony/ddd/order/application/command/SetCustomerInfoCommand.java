package tony.ddd.order.application.command;

import tony.ddd.shared.application.Command;

/**
 * Command to set or update customer information on an order.
 * Customer info must be set before an order can be submitted.
 */
public record SetCustomerInfoCommand(
    String orderId,
    String name,
    String email,
    String phone
) implements Command {

    /**
     * Creates a command with all customer info fields.
     */
    public static SetCustomerInfoCommand of(String orderId, String name, String email, String phone) {
        return new SetCustomerInfoCommand(orderId, name, email, phone);
    }

    /**
     * Creates a command with required fields only (no phone).
     */
    public static SetCustomerInfoCommand of(String orderId, String name, String email) {
        return new SetCustomerInfoCommand(orderId, name, email, null);
    }
}
