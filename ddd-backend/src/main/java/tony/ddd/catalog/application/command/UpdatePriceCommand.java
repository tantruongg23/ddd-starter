package tony.ddd.catalog.application.command;

import tony.ddd.shared.application.Command;

import java.math.BigDecimal;

/**
 * Command to update a Product's price.
 * Price can be updated at any time.
 */
public record UpdatePriceCommand(
    String productId,
    BigDecimal price,
    String currency
) implements Command {
}
