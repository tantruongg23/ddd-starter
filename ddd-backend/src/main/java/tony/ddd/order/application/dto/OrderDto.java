package tony.ddd.order.application.dto;

import tony.ddd.order.domain.model.CustomerInfo;
import tony.ddd.order.domain.model.Order;
import tony.ddd.order.domain.model.OrderNumber;
import tony.ddd.order.domain.model.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Data Transfer Object for Order.
 * Used to transfer order data between layers without exposing domain internals.
 */
public record OrderDto(
    String id,
    String orderNumber,
    String customerId,
    CustomerInfoDto customerInfo,
    AddressDto shippingAddress,
    List<OrderItemDto> items,
    OrderStatus status,
    BigDecimal subtotal,
    BigDecimal shippingCost,
    BigDecimal totalAmount,
    int itemCount,
    int totalQuantity,
    Instant createdAt,
    Instant updatedAt,
    String cancellationReason
) {

    /**
     * Nested DTO for customer information.
     */
    public record CustomerInfoDto(
        String name,
        String email,
        String phone
    ) {
        public static CustomerInfoDto fromDomain(CustomerInfo customerInfo) {
            if (customerInfo == null) {
                return null;
            }
            return new CustomerInfoDto(
                customerInfo.getName(),
                customerInfo.getEmail(),
                customerInfo.getPhone()
            );
        }
    }

    /**
     * Creates an OrderDto from an Order domain object.
     */
    public static OrderDto fromDomain(Order order, BigDecimal shippingCost) {
        BigDecimal subtotal = order.calculateTotalAmount().amount();
        BigDecimal total = subtotal.add(shippingCost);
        
        OrderNumber orderNum = order.getOrderNumber();
        CustomerInfo custInfo = order.getCustomerInfo();

        return new OrderDto(
            order.getId().getValue(),
            orderNum != null ? orderNum.getValue() : null,
            order.getCustomerId().getValue(),
            CustomerInfoDto.fromDomain(custInfo),
            AddressDto.fromDomain(order.getShippingAddress()),
            order.getItems().stream()
                .map(OrderItemDto::fromDomain)
                .toList(),
            order.getStatus(),
            subtotal,
            shippingCost,
            total,
            order.getItemCount(),
            order.getTotalQuantity(),
            order.getCreatedAt(),
            order.getUpdatedAt(),
            order.getCancellationReason()
        );
    }
}
