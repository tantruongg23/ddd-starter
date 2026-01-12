package tony.ddd.order.domain.event;

import tony.ddd.order.domain.model.OrderStatus;
import tony.ddd.shared.domain.DomainEvent;

/**
 * Domain Event raised when an Order's status changes.
 */
public class OrderStatusChangedEvent extends DomainEvent {

    private static final String EVENT_TYPE = "OrderStatusChanged";
    private static final String AGGREGATE_TYPE = "Order";

    private final OrderStatus previousStatus;
    private final OrderStatus newStatus;

    public OrderStatusChangedEvent(String orderId, OrderStatus previousStatus, OrderStatus newStatus) {
        super(orderId, AGGREGATE_TYPE);
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    public String getOrderId() {
        return getAggregateId();
    }

    public OrderStatus getPreviousStatus() {
        return previousStatus;
    }

    public OrderStatus getNewStatus() {
        return newStatus;
    }
}
