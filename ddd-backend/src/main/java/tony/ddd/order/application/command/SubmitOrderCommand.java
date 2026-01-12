package tony.ddd.order.application.command;

import tony.ddd.shared.application.Command;

/**
 * Command to submit an order for processing.
 * Transitions order from DRAFT to PENDING status.
 * Generates an OrderNumber upon submission.
 */
public record SubmitOrderCommand(
    String orderId
) implements Command {

    /**
     * Creates a submit order command.
     */
    public static SubmitOrderCommand of(String orderId) {
        return new SubmitOrderCommand(orderId);
    }
}
