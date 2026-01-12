package tony.ddd.order.domain.event;

import tony.ddd.shared.domain.DomainEvent;

import java.math.BigDecimal;

/**
 * Domain Event raised when an item is added to an Order.
 */
public class OrderItemAddedEvent extends DomainEvent {

    private static final String EVENT_TYPE = "OrderItemAdded";
    private static final String AGGREGATE_TYPE = "Order";

    private final String productId;
    private final String productName;
    private final int quantity;
    private final BigDecimal unitPrice;
    private final BigDecimal subtotal;

    public OrderItemAddedEvent(String orderId, String productId, String productName, 
                               int quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        super(orderId, AGGREGATE_TYPE);
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
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

    public String getProductName() {
        return productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }
}
