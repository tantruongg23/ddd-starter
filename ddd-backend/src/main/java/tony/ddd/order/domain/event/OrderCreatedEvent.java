package tony.ddd.order.domain.event;

import tony.ddd.shared.domain.DomainEvent;

import java.math.BigDecimal;

/**
 * Domain Event raised when a new Order is created.
 */
public class OrderCreatedEvent extends DomainEvent {

    private static final String EVENT_TYPE = "OrderCreated";
    private static final String AGGREGATE_TYPE = "Order";

    private final String customerId;
    private final BigDecimal totalAmount;

    public OrderCreatedEvent(String orderId, String customerId, BigDecimal totalAmount) {
        super(orderId, AGGREGATE_TYPE);
        this.customerId = customerId;
        this.totalAmount = totalAmount;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    public String getOrderId() {
        return getAggregateId();
    }

    public String getCustomerId() {
        return customerId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
}
