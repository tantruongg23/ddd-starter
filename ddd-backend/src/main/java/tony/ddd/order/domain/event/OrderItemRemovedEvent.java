package tony.ddd.order.domain.event;

import tony.ddd.shared.domain.DomainEvent;

import java.math.BigDecimal;

/**
 * Domain Event raised when an item is removed from an Order.
 */
public class OrderItemRemovedEvent extends DomainEvent {

    private static final String EVENT_TYPE = "OrderItemRemoved";
    private static final String AGGREGATE_TYPE = "Order";

    private final String productId;
    private final int quantityRemoved;
    private final BigDecimal amountRemoved;

    public OrderItemRemovedEvent(String orderId, String productId, 
                                 int quantityRemoved, BigDecimal amountRemoved) {
        super(orderId, AGGREGATE_TYPE);
        this.productId = productId;
        this.quantityRemoved = quantityRemoved;
        this.amountRemoved = amountRemoved;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    public String getOrderId() {
        return getAggregateId();
    }

    public String getProductId() {
        return productId;
    }

    public int getQuantityRemoved() {
        return quantityRemoved;
    }

    public BigDecimal getAmountRemoved() {
        return amountRemoved;
    }
}
