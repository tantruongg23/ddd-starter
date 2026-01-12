package tony.ddd.order.application.dto;

import tony.ddd.order.domain.model.OrderItem;

import java.math.BigDecimal;

/**
 * Data Transfer Object for OrderItem.
 */
public record OrderItemDto(
    String id,
    String productId,
    String productName,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal subtotal
) {

    /**
     * Creates an OrderItemDto from an OrderItem domain object.
     */
    public static OrderItemDto fromDomain(OrderItem item) {
        return new OrderItemDto(
            item.getId().getValue(),
            item.getProductId().getValue(),
            item.getProductName(),
            item.getUnitPrice().amount(),
            item.getQuantity().value(),
            item.calculateSubtotal().amount()
        );
    }
}
