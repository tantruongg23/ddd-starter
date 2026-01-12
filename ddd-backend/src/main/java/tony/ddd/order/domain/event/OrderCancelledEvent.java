package tony.ddd.order.domain.event;

import tony.ddd.shared.domain.DomainEvent;

import java.math.BigDecimal;

/**
 * Domain Event raised when an Order is cancelled.
 */
public class OrderCancelledEvent extends DomainEvent {

    private static final String EVENT_TYPE = "OrderCancelled";
    private static final String AGGREGATE_TYPE = "Order";

    private final String reason;
    private final BigDecimal refundAmount;

    public OrderCancelledEvent(String orderId, String reason, BigDecimal refundAmount) {
        super(orderId, AGGREGATE_TYPE);
        this.reason = reason;
        this.refundAmount = refundAmount;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    public String getOrderId() {
        return getAggregateId();
    }

    public String getReason() {
        return reason;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
}
