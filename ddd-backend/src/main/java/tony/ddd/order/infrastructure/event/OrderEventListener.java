package tony.ddd.order.infrastructure.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import tony.ddd.order.domain.event.OrderCancelledEvent;
import tony.ddd.order.domain.event.OrderCreatedEvent;
import tony.ddd.order.domain.event.OrderStatusChangedEvent;

/**
 * Event listener for Order domain events.
 * Handles side effects and integrations triggered by domain events.
 */
@Component
public class OrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);

    /**
     * Handles OrderCreatedEvent.
     * Could trigger notifications, inventory checks, etc.
     */
    @EventListener
    @Async
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Order created: orderId={}, customerId={}, totalAmount={}",
            event.getOrderId(), event.getCustomerId(), event.getTotalAmount());
        
        // TODO: Integrate with notification service
        // TODO: Integrate with inventory service
        // TODO: Integrate with payment service
    }

    /**
     * Handles OrderStatusChangedEvent.
     * Could trigger notifications to customers.
     */
    @EventListener
    @Async
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("Order status changed: orderId={}, from={}, to={}",
            event.getOrderId(), event.getPreviousStatus(), event.getNewStatus());
        
        // TODO: Send notification to customer about status change
    }

    /**
     * Handles OrderCancelledEvent.
     * Could trigger refund processing, inventory restoration, etc.
     */
    @EventListener
    @Async
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("Order cancelled: orderId={}, reason={}, refundAmount={}",
            event.getOrderId(), event.getReason(), event.getRefundAmount());
        
        // TODO: Process refund
        // TODO: Restore inventory
        // TODO: Send cancellation notification
    }
}
