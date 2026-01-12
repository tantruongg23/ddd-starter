package tony.ddd.order.domain.exception;

import tony.ddd.order.domain.model.OrderId;
import tony.ddd.shared.domain.DomainException;

/**
 * Exception thrown when an Order is not found.
 */
public class OrderNotFoundException extends DomainException {

    public OrderNotFoundException(OrderId orderId) {
        super("ORDER_NOT_FOUND", "Order not found with ID: " + orderId.getValue());
    }

    public OrderNotFoundException(String message) {
        super("ORDER_NOT_FOUND", message);
    }
}
