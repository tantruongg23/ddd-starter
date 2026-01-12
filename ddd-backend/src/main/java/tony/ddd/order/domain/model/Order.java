package tony.ddd.order.domain.model;

import tony.ddd.order.domain.event.OrderCancelledEvent;
import tony.ddd.order.domain.event.OrderCreatedEvent;
import tony.ddd.order.domain.event.OrderItemAddedEvent;
import tony.ddd.order.domain.event.OrderItemRemovedEvent;
import tony.ddd.order.domain.event.OrderStatusChangedEvent;
import tony.ddd.order.domain.event.OrderSubmittedEvent;
import tony.ddd.shared.domain.AggregateRoot;
import tony.ddd.shared.domain.DomainException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Aggregate Root for the Order bounded context.
 * Encapsulates all order-related business logic and maintains invariants.
 * 
 * Order Lifecycle:
 * 1. DRAFT - Order is being prepared, items can be modified
 * 2. PENDING - Order has been submitted, awaiting confirmation
 * 3. CONFIRMED - Order has been confirmed
 * 4. PROCESSING - Order is being processed
 * 5. SHIPPED - Order has been shipped
 * 6. DELIVERED - Order has been delivered (terminal)
 * 7. CANCELLED - Order has been cancelled (terminal)
 */
public class Order extends AggregateRoot<OrderId> {

    private final CustomerId customerId;
    private final List<OrderItem> items;
    private final Address shippingAddress;
    private final Instant createdAt;
    private OrderStatus status;
    private Instant updatedAt;
    private String cancellationReason;
    private OrderNumber orderNumber;
    private CustomerInfo customerInfo;

    private Order(OrderId id, CustomerId customerId, Address shippingAddress, 
                  List<OrderItem> items, OrderStatus status, 
                  Instant createdAt, Instant updatedAt, String cancellationReason,
                  OrderNumber orderNumber, CustomerInfo customerInfo) {
        super(id);
        this.customerId = customerId;
        this.shippingAddress = shippingAddress;
        this.items = new ArrayList<>(items);
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.cancellationReason = cancellationReason;
        this.orderNumber = orderNumber;
        this.customerInfo = customerInfo;
    }

    /**
     * Factory method to create a new Order in DRAFT status.
     * Items can be added after creation. Customer info must be set before submitting.
     */
    public static Order create(CustomerId customerId, Address shippingAddress) {
        if (customerId == null) {
            throw new DomainException("INVALID_ORDER", "Customer ID is required");
        }
        if (shippingAddress == null) {
            throw new DomainException("INVALID_ORDER", "Shipping address is required");
        }

        OrderId orderId = OrderId.generate();
        Instant now = Instant.now();
        
        Order order = new Order(
            orderId,
            customerId,
            shippingAddress,
            new ArrayList<>(),
            OrderStatus.DRAFT,
            now,
            now,
            null,
            null,
            null
        );

        order.registerDomainEvent(new OrderCreatedEvent(
            orderId.getValue(),
            customerId.getValue(),
            order.calculateTotalAmount().amount()
        ));

        return order;
    }

    /**
     * Factory method to create a new Order in DRAFT status with initial items.
     * Validates business rules and registers domain events.
     */
    public static Order create(CustomerId customerId, Address shippingAddress, List<OrderItem> items) {
        Order order = create(customerId, shippingAddress);
        
        if (items != null) {
            for (OrderItem item : items) {
                order.items.add(item);
            }
        }
        
        return order;
    }

    /**
     * Reconstitutes an Order from persistence (no events, no validation).
     */
    public static Order reconstitute(OrderId id, CustomerId customerId, Address shippingAddress,
                                      List<OrderItem> items, OrderStatus status,
                                      Instant createdAt, Instant updatedAt, String cancellationReason,
                                      OrderNumber orderNumber, CustomerInfo customerInfo) {
        return new Order(id, customerId, shippingAddress, items, status, 
                         createdAt, updatedAt, cancellationReason, orderNumber, customerInfo);
    }

    /**
     * Sets or updates the customer information for this order.
     * Only allowed when order is in DRAFT status.
     */
    public void setCustomerInfo(CustomerInfo customerInfo) {
        if (!status.canUpdateCustomerInfo()) {
            throw new DomainException("ORDER_NOT_MODIFIABLE", 
                "Customer info cannot be modified in status: " + status);
        }
        if (customerInfo == null) {
            throw new DomainException("INVALID_CUSTOMER_INFO", "Customer info cannot be null");
        }
        
        this.customerInfo = customerInfo;
        this.updatedAt = Instant.now();
    }

    /**
     * Submits the order for processing.
     * Transitions from DRAFT to PENDING status.
     * Requires customer info to be set and at least one item.
     */
    public void submit() {
        if (!status.canSubmit()) {
            throw new DomainException("CANNOT_SUBMIT_ORDER", 
                "Order cannot be submitted in status: " + status);
        }
        if (items.isEmpty()) {
            throw new DomainException("CANNOT_SUBMIT_ORDER", 
                "Order must have at least one item to submit");
        }
        if (customerInfo == null) {
            throw new DomainException("CANNOT_SUBMIT_ORDER", 
                "Customer info must be set before submitting order");
        }

        // Generate order number on submit
        this.orderNumber = OrderNumber.generate();
        
        this.status = this.status.transitionTo(OrderStatus.PENDING);
        this.updatedAt = Instant.now();

        registerDomainEvent(new OrderSubmittedEvent(
            id.getValue(),
            orderNumber.getValue(),
            customerId.getValue(),
            customerInfo.getEmail(),
            calculateTotalAmount().amount(),
            items.size()
        ));
    }

    /**
     * Adds an item to the order.
     * Only allowed when order is in DRAFT status.
     */
    public void addItem(OrderItem item) {
        validateModifiable();
        if (item == null) {
            throw new DomainException("INVALID_ORDER_ITEM", "Order item cannot be null");
        }

        // Check if product already exists, if so, update quantity
        Optional<OrderItem> existingItem = findItemByProductId(item.getProductId());
        if (existingItem.isPresent()) {
            Quantity newQuantity = existingItem.get().getQuantity().add(item.getQuantity());
            existingItem.get().updateQuantity(newQuantity);
        } else {
            items.add(item);
        }
        
        this.updatedAt = Instant.now();

        registerDomainEvent(new OrderItemAddedEvent(
            id.getValue(),
            item.getProductId().getValue(),
            item.getProductName(),
            item.getQuantity().value(),
            item.getUnitPrice().amount(),
            item.calculateSubtotal().amount()
        ));
    }

    /**
     * Removes an item from the order by product ID.
     * Only allowed when order is in DRAFT status.
     */
    public void removeItem(ProductId productId) {
        validateModifiable();
        if (productId == null) {
            throw new DomainException("INVALID_ORDER_ITEM", "Product ID cannot be null");
        }

        OrderItem itemToRemove = findItemByProductId(productId)
            .orElseThrow(() -> new DomainException("ITEM_NOT_FOUND", 
                "Order item not found for product: " + productId));

        int quantityRemoved = itemToRemove.getQuantity().value();
        var amountRemoved = itemToRemove.calculateSubtotal().amount();

        boolean removed = items.removeIf(item -> item.getProductId().equals(productId));
        if (!removed) {
            throw new DomainException("ITEM_NOT_FOUND", "Order item not found for product: " + productId);
        }
        
        this.updatedAt = Instant.now();

        registerDomainEvent(new OrderItemRemovedEvent(
            id.getValue(),
            productId.getValue(),
            quantityRemoved,
            amountRemoved
        ));
    }

    /**
     * Updates the quantity of an item.
     * Only allowed when order is in DRAFT status.
     */
    public void updateItemQuantity(ProductId productId, Quantity newQuantity) {
        validateModifiable();
        
        OrderItem item = findItemByProductId(productId)
            .orElseThrow(() -> new DomainException("ITEM_NOT_FOUND", 
                "Order item not found for product: " + productId));
        
        item.updateQuantity(newQuantity);
        this.updatedAt = Instant.now();
    }

    /**
     * Confirms the order.
     */
    public void confirm() {
        OrderStatus previousStatus = this.status;
        this.status = this.status.transitionTo(OrderStatus.CONFIRMED);
        this.updatedAt = Instant.now();
        
        registerDomainEvent(new OrderStatusChangedEvent(
            id.getValue(), previousStatus, this.status));
    }

    /**
     * Starts processing the order.
     */
    public void startProcessing() {
        OrderStatus previousStatus = this.status;
        this.status = this.status.transitionTo(OrderStatus.PROCESSING);
        this.updatedAt = Instant.now();
        
        registerDomainEvent(new OrderStatusChangedEvent(
            id.getValue(), previousStatus, this.status));
    }

    /**
     * Marks the order as shipped.
     */
    public void ship() {
        OrderStatus previousStatus = this.status;
        this.status = this.status.transitionTo(OrderStatus.SHIPPED);
        this.updatedAt = Instant.now();
        
        registerDomainEvent(new OrderStatusChangedEvent(
            id.getValue(), previousStatus, this.status));
    }

    /**
     * Marks the order as delivered.
     */
    public void deliver() {
        OrderStatus previousStatus = this.status;
        this.status = this.status.transitionTo(OrderStatus.DELIVERED);
        this.updatedAt = Instant.now();
        
        registerDomainEvent(new OrderStatusChangedEvent(
            id.getValue(), previousStatus, this.status));
    }

    /**
     * Cancels the order with a reason.
     */
    public void cancel(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new DomainException("INVALID_CANCELLATION", "Cancellation reason is required");
        }
        
        this.status = this.status.transitionTo(OrderStatus.CANCELLED);
        this.cancellationReason = reason;
        this.updatedAt = Instant.now();
        
        registerDomainEvent(new OrderCancelledEvent(
            id.getValue(), reason, calculateTotalAmount().amount()));
    }

    /**
     * Calculates the total amount of the order.
     */
    public Money calculateTotalAmount() {
        return items.stream()
            .map(OrderItem::calculateSubtotal)
            .reduce(Money.zero(), Money::add);
    }

    /**
     * Returns the number of items in the order.
     */
    public int getItemCount() {
        return items.size();
    }

    /**
     * Returns the total quantity of all items.
     */
    public int getTotalQuantity() {
        return items.stream()
            .mapToInt(item -> item.getQuantity().value())
            .sum();
    }

    /**
     * Checks if the order has been submitted (has an order number).
     */
    public boolean isSubmitted() {
        return orderNumber != null;
    }

    private Optional<OrderItem> findItemByProductId(ProductId productId) {
        return items.stream()
            .filter(item -> item.getProductId().equals(productId))
            .findFirst();
    }

    private void validateModifiable() {
        if (!status.isModifiable()) {
            throw new DomainException("ORDER_NOT_MODIFIABLE", 
                "Order cannot be modified in status: " + status);
        }
    }

    // Getters
    public CustomerId getCustomerId() {
        return customerId;
    }

    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public Address getShippingAddress() {
        return shippingAddress;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public OrderNumber getOrderNumber() {
        return orderNumber;
    }

    public CustomerInfo getCustomerInfo() {
        return customerInfo;
    }
}
