package tony.ddd.catalog.application.command;

import tony.ddd.shared.application.Command;

/**
 * Command to activate a Product, making it available for purchase.
 * Can only be executed from DRAFT or INACTIVE status.
 */
public record ActivateProductCommand(
    String productId
) implements Command {
}
