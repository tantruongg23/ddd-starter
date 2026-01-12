package tony.ddd.order.web.response;

import io.swagger.v3.oas.annotations.media.Schema;
import tony.ddd.order.application.dto.OrderItemDto;

import java.math.BigDecimal;

/**
 * Response model for OrderItem.
 */
@Schema(description = "Order item details")
public record OrderItemResponse(
    @Schema(description = "Unique item identifier", example = "item-abc123")
    String id,

    @Schema(description = "Product identifier", example = "prod-xyz789")
    String productId,

    @Schema(description = "Product name at time of order", example = "Wireless Headphones")
    String productName,

    @Schema(description = "Unit price at time of order", example = "149.99")
    BigDecimal unitPrice,

    @Schema(description = "Quantity ordered", example = "2")
    int quantity,

    @Schema(description = "Item subtotal (unitPrice × quantity)", example = "299.98")
    BigDecimal subtotal
) {

    /**
     * Creates an OrderItemResponse from an OrderItemDto.
     */
    public static OrderItemResponse fromDto(OrderItemDto dto) {
        return new OrderItemResponse(
            dto.id(),
            dto.productId(),
            dto.productName(),
            dto.unitPrice(),
            dto.quantity(),
            dto.subtotal()
        );
    }
}
