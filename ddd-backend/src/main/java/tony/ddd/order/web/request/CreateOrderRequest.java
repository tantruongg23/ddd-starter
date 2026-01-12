package tony.ddd.order.web.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import tony.ddd.order.application.command.CreateOrderCommand;

import java.util.List;

/**
 * Request object for creating a new Order.
 * Contains validation annotations for input validation.
 */
@Schema(description = "Request to create a new order")
public record CreateOrderRequest(
    @Schema(
        description = "Customer identifier",
        example = "cust-123",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Customer ID is required")
    String customerId,

    @Schema(
        description = "Shipping address for the order",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "Shipping address is required")
    @Valid
    AddressRequest shippingAddress,

    @Schema(
        description = "Order items (at least one required)",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotEmpty(message = "At least one order item is required")
    @Valid
    List<OrderItemRequest> items
) {

    /**
     * Converts this request to an application command.
     */
    public CreateOrderCommand toCommand() {
        return new CreateOrderCommand(
            customerId,
            new CreateOrderCommand.AddressData(
                shippingAddress.street(),
                shippingAddress.city(),
                shippingAddress.state(),
                shippingAddress.zipCode(),
                shippingAddress.country()
            ),
            items.stream()
                .map(item -> new CreateOrderCommand.OrderItemData(
                    item.productId(),
                    item.productName(),
                    item.unitPrice(),
                    item.quantity()
                ))
                .toList()
        );
    }

    /**
     * Nested record for address in the request.
     */
    @Schema(description = "Shipping address details")
    public record AddressRequest(
        @Schema(description = "Street address", example = "123 Main Street", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Street is required")
        String street,

        @Schema(description = "City name", example = "San Francisco", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "City is required")
        String city,

        @Schema(description = "State or province", example = "CA", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "State is required")
        String state,

        @Schema(description = "ZIP or postal code", example = "94105", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Zip code is required")
        String zipCode,

        @Schema(description = "Country name", example = "USA", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Country is required")
        String country
    ) {}

    /**
     * Nested record for order items in the request.
     */
    @Schema(description = "Order item details")
    public record OrderItemRequest(
        @Schema(description = "Product identifier", example = "prod-abc123", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Product ID is required")
        String productId,

        @Schema(description = "Product name at time of order", example = "Wireless Headphones", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Product name is required")
        String productName,

        @Schema(description = "Unit price (must be positive)", example = "149.99", requiredMode = Schema.RequiredMode.REQUIRED)
        @Positive(message = "Unit price must be positive")
        double unitPrice,

        @Schema(description = "Quantity (must be positive)", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
        @Positive(message = "Quantity must be positive")
        int quantity
    ) {}
}
