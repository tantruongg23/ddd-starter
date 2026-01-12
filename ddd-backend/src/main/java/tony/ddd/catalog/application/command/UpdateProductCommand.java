package tony.ddd.catalog.application.command;

import tony.ddd.shared.application.Command;

/**
 * Command to update a Product's basic information.
 * Only allowed when product is in DRAFT status.
 */
public record UpdateProductCommand(
    String productId,
    String name,
    String description
) implements Command {
}
