package tony.ddd.catalog.application.command;

import tony.ddd.shared.application.Command;

import java.math.BigDecimal;

/**
 * Command to create a new Product in the catalog.
 * Commands are immutable and contain all information needed to perform the action.
 */
public record CreateProductCommand(
    String name,
    String description,
    BigDecimal price,
    String currency,
    String sku
) implements Command {
}
