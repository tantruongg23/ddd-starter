package tony.ddd.order.domain.event;

import tony.ddd.shared.domain.DomainEvent;

import java.math.BigDecimal;

/**
 * Domain Event raised when an Order is submitted for processing.
 * This transitions the order from DRAFT to PENDING status.
 */
public class OrderSubmittedEvent extends DomainEvent {

    private static final String EVENT_TYPE = "OrderSubmitted";
    private static final String AGGREGATE_TYPE = "Order";

    private final String orderNumber;
    private final String customerId;
    private final String customerEmail;
    private final BigDecimal totalAmount;
    private final int itemCount;

    public OrderSubmittedEvent(String orderId, String orderNumber, String customerId, 
                               String customerEmail, BigDecimal totalAmount, int itemCount) {
        super(orderId, AGGREGATE_TYPE);
        this.orderNumber = orderNumber;
        this.customerId = customerId;
        this.customerEmail = customerEmail;
        this.totalAmount = totalAmount;
        this.itemCount = itemCount;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    public String getOrderId() {
        return getAggregateId();
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public int getItemCount() {
        return itemCount;
    }
}
