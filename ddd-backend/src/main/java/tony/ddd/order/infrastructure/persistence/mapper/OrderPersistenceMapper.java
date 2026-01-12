package tony.ddd.order.infrastructure.persistence.mapper;

import org.springframework.stereotype.Component;
import tony.ddd.order.domain.model.*;
import tony.ddd.order.infrastructure.persistence.entity.OrderItemJpaEntity;
import tony.ddd.order.infrastructure.persistence.entity.OrderJpaEntity;
import tony.ddd.order.infrastructure.persistence.entity.OrderStatusJpa;

import java.util.Currency;
import java.util.List;

/**
 * Mapper between domain Order aggregate and JPA entities.
 * Handles the translation between domain model and persistence model.
 */
@Component
public class OrderPersistenceMapper {

    /**
     * Maps a domain Order to a JPA entity.
     */
    public OrderJpaEntity toJpaEntity(Order order) {
        Money totalAmount = order.calculateTotalAmount();
        
        // Extract customer info fields if available
        String customerName = null;
        String customerEmail = null;
        String customerPhone = null;
        if (order.getCustomerInfo() != null) {
            customerName = order.getCustomerInfo().getName();
            customerEmail = order.getCustomerInfo().getEmail();
            customerPhone = order.getCustomerInfo().getPhone();
        }
        
        // Extract order number if available
        String orderNumber = order.getOrderNumber() != null 
            ? order.getOrderNumber().getValue() 
            : null;
        
        OrderJpaEntity entity = new OrderJpaEntity(
            order.getId().getValue(),
            order.getCustomerId().getValue(),
            OrderStatusJpa.fromDomain(order.getStatus()),
            order.getShippingAddress().street(),
            order.getShippingAddress().city(),
            order.getShippingAddress().state(),
            order.getShippingAddress().zipCode(),
            order.getShippingAddress().country(),
            totalAmount.amount(),
            totalAmount.currency().getCurrencyCode(),
            order.getCreatedAt(),
            order.getUpdatedAt(),
            order.getCancellationReason(),
            orderNumber,
            customerName,
            customerEmail,
            customerPhone
        );

        // Map order items
        for (OrderItem item : order.getItems()) {
            OrderItemJpaEntity itemEntity = toJpaEntity(item);
            entity.addItem(itemEntity);
        }

        return entity;
    }

    /**
     * Maps a JPA entity to a domain Order.
     */
    public Order toDomain(OrderJpaEntity entity) {
        List<OrderItem> items = entity.getItems().stream()
            .map(this::toDomain)
            .toList();

        Address address = Address.of(
            entity.getShippingStreet(),
            entity.getShippingCity(),
            entity.getShippingState(),
            entity.getShippingZipCode(),
            entity.getShippingCountry()
        );

        // Reconstitute OrderNumber if present
        OrderNumber orderNumber = entity.getOrderNumber() != null 
            ? OrderNumber.of(entity.getOrderNumber()) 
            : null;
        
        // Reconstitute CustomerInfo if all required fields are present
        CustomerInfo customerInfo = null;
        if (entity.getCustomerName() != null && entity.getCustomerEmail() != null) {
            customerInfo = CustomerInfo.of(
                entity.getCustomerName(),
                entity.getCustomerEmail(),
                entity.getCustomerPhone()
            );
        }

        return Order.reconstitute(
            OrderId.of(entity.getId()),
            CustomerId.of(entity.getCustomerId()),
            address,
            items,
            entity.getStatus().toDomain(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            entity.getCancellationReason(),
            orderNumber,
            customerInfo
        );
    }

    /**
     * Maps a domain OrderItem to a JPA entity.
     */
    public OrderItemJpaEntity toJpaEntity(OrderItem item) {
        return new OrderItemJpaEntity(
            item.getId().getValue(),
            item.getProductId().getValue(),
            item.getProductName(),
            item.getUnitPrice().amount(),
            item.getUnitPrice().currency().getCurrencyCode(),
            item.getQuantity().value()
        );
    }

    /**
     * Maps a JPA entity to a domain OrderItem.
     */
    public OrderItem toDomain(OrderItemJpaEntity entity) {
        return OrderItem.reconstitute(
            OrderItemId.of(entity.getId()),
            ProductId.of(entity.getProductId()),
            entity.getProductName(),
            Money.of(entity.getUnitPrice(), Currency.getInstance(entity.getCurrency())),
            Quantity.of(entity.getQuantity())
        );
    }
}
