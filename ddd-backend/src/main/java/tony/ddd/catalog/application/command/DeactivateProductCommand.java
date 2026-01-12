package tony.ddd.catalog.application.command;

import tony.ddd.shared.application.Command;

/**
 * Command to deactivate a Product, making it unavailable for purchase.
 * Can only be executed from ACTIVE status.
 */
public record DeactivateProductCommand(
    String productId
) implements Command {
}
