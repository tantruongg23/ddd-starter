package tony.ddd.order.web.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;
import tony.ddd.order.application.dto.OrderDto;
import tony.ddd.order.domain.model.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * HATEOAS response model for Order.
 * Extends RepresentationModel to support hypermedia links.
 */
@Getter
@Relation(collectionRelation = "orders", itemRelation = "order")
@Schema(description = "Order representation with HATEOAS links")
public class OrderResponse extends RepresentationModel<OrderResponse> {

    // Getters
    @Schema(description = "Unique order identifier", example = "ord-123e4567-e89b")
    private final String id;

    @Schema(description = "Customer identifier", example = "cust-123")
    private final String customerId;

    @Schema(description = "Shipping address for the order")
    private final AddressResponse shippingAddress;

    @Schema(description = "List of order items")
    private final List<OrderItemResponse> items;

    @Schema(description = "Current order status", example = "CONFIRMED")
    private final OrderStatus status;

    @Schema(description = "Human-readable status description", example = "Order has been confirmed")
    private final String statusDescription;

    @Schema(description = "Order subtotal (sum of item prices)", example = "299.98")
    private final BigDecimal subtotal;

    @Schema(description = "Shipping cost", example = "9.99")
    private final BigDecimal shippingCost;

    @Schema(description = "Total order amount including shipping", example = "309.97")
    private final BigDecimal totalAmount;

    @Schema(description = "Number of distinct items in the order", example = "2")
    private final int itemCount;

    @Schema(description = "Total quantity of all items", example = "5")
    private final int totalQuantity;

    @Schema(description = "Timestamp when order was created", example = "2024-01-15T10:30:00Z")
    private final Instant createdAt;

    @Schema(description = "Timestamp when order was last updated", example = "2024-01-15T14:22:00Z")
    private final Instant updatedAt;

    @Schema(description = "Reason for cancellation (if cancelled)", example = "Customer requested cancellation")
    private final String cancellationReason;

    private OrderResponse(String id, String customerId, AddressResponse shippingAddress,
                          List<OrderItemResponse> items, OrderStatus status, String statusDescription,
                          BigDecimal subtotal, BigDecimal shippingCost, BigDecimal totalAmount,
                          int itemCount, int totalQuantity, Instant createdAt, Instant updatedAt,
                          String cancellationReason) {
        this.id = id;
        this.customerId = customerId;
        this.shippingAddress = shippingAddress;
        this.items = items;
        this.status = status;
        this.statusDescription = statusDescription;
        this.subtotal = subtotal;
        this.shippingCost = shippingCost;
        this.totalAmount = totalAmount;
        this.itemCount = itemCount;
        this.totalQuantity = totalQuantity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.cancellationReason = cancellationReason;
    }

    /**
     * Creates an OrderResponse from an OrderDto.
     */
    public static OrderResponse fromDto(OrderDto dto) {
        return new OrderResponse(
            dto.id(),
            dto.customerId(),
            AddressResponse.fromDto(dto.shippingAddress()),
            dto.items().stream()
                .map(OrderItemResponse::fromDto)
                .toList(),
            dto.status(),
            dto.status().getDescription(),
            dto.subtotal(),
            dto.shippingCost(),
            dto.totalAmount(),
            dto.itemCount(),
            dto.totalQuantity(),
            dto.createdAt(),
            dto.updatedAt(),
            dto.cancellationReason()
        );
    }

}
