package tony.ddd.order.web.assembler;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;
import tony.ddd.order.application.dto.OrderDto;
import tony.ddd.order.domain.model.OrderStatus;
import tony.ddd.order.web.controller.OrderController;
import tony.ddd.order.web.response.OrderResponse;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

/**
 * HATEOAS Model Assembler for Order.
 * Converts OrderDto to OrderResponse with hypermedia links.
 * Implements RESTful HATEOAS patterns.
 */
@Component
public class OrderModelAssembler implements RepresentationModelAssembler<OrderDto, OrderResponse> {

    @Override
    public OrderResponse toModel(OrderDto dto) {
        OrderResponse response = OrderResponse.fromDto(dto);

        // Self link
        response.add(linkTo(methodOn(OrderController.class).getOrder(dto.id())).withSelfRel());

        // Collection link
        response.add(linkTo(methodOn(OrderController.class).getAllOrders()).withRel("orders"));

        // Customer's orders link
        response.add(linkTo(methodOn(OrderController.class)
            .getOrdersByCustomer(dto.customerId())).withRel("customer-orders"));

        // Add action links based on current status (HATEOAS - available transitions)
        addStatusTransitionLinks(response, dto);

        // Add item management links if order is modifiable (DRAFT status)
        if (dto.status().isModifiable()) {
            response.add(linkTo(methodOn(OrderController.class)
                .addOrderItem(dto.id(), null)).withRel("add-item"));
            
            // Add update-item links for each item in the order
            dto.items().forEach(item -> 
                response.add(linkTo(methodOn(OrderController.class)
                    .updateItemQuantity(dto.id(), item.productId(), null))
                    .withRel("update-item-" + item.productId())));
            
            // Add remove-item links for each item in the order
            dto.items().forEach(item -> 
                response.add(linkTo(methodOn(OrderController.class)
                    .removeOrderItem(dto.id(), item.productId()))
                    .withRel("remove-item-" + item.productId())));
        }

        // Add customer-info link if customer info can be updated (DRAFT status)
        if (dto.status().canUpdateCustomerInfo()) {
            response.add(linkTo(methodOn(OrderController.class)
                .setCustomerInfo(dto.id(), null)).withRel("set-customer-info"));
        }

        // Add submit link if order can be submitted (DRAFT status with items)
        if (dto.status().canSubmit() && !dto.items().isEmpty()) {
            response.add(linkTo(methodOn(OrderController.class)
                .submitOrder(dto.id())).withRel("submit"));
        }

        return response;
    }

    @Override
    public CollectionModel<OrderResponse> toCollectionModel(Iterable<? extends OrderDto> entities) {
        CollectionModel<OrderResponse> collection = RepresentationModelAssembler.super.toCollectionModel(entities);
        
        // Add collection self link
        collection.add(linkTo(methodOn(OrderController.class).getAllOrders()).withSelfRel());
        
        // Add links to filter by status
        for (OrderStatus status : OrderStatus.values()) {
            collection.add(linkTo(methodOn(OrderController.class)
                .getOrdersByStatus(status)).withRel("orders-" + status.name().toLowerCase()));
        }
        
        // Add create order link
        collection.add(linkTo(methodOn(OrderController.class).createOrder(null)).withRel("create"));

        return collection;
    }

    /**
     * Adds HATEOAS links for available status transitions.
     * Note: DRAFT -> PENDING transition is handled by the submit endpoint, not updateOrderStatus.
     */
    private void addStatusTransitionLinks(OrderResponse response, OrderDto dto) {
        OrderStatus currentStatus = dto.status();

        // Add links for all possible transitions from current status
        for (OrderStatus targetStatus : OrderStatus.values()) {
            if (currentStatus.canTransitionTo(targetStatus)) {
                // Skip PENDING transition - it's handled by the dedicated submit endpoint
                if (targetStatus == OrderStatus.PENDING) {
                    continue;
                }
                
                String rel = switch (targetStatus) {
                    case CONFIRMED -> "confirm";
                    case PROCESSING -> "process";
                    case SHIPPED -> "ship";
                    case DELIVERED -> "deliver";
                    case CANCELLED -> "cancel";
                    default -> targetStatus.name().toLowerCase();
                };

                response.add(linkTo(methodOn(OrderController.class)
                    .updateOrderStatus(dto.id(), null)).withRel(rel));
            }
        }
    }
}
