package tony.ddd.order.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;
import tony.ddd.shared.domain.DomainException;

/**
 * Value Object representing the status of an Order.
 * Defines the valid states and transitions for an order lifecycle.
 * 
 * State machine:
 * DRAFT -> PENDING (submit)
 * PENDING -> CONFIRMED | CANCELLED
 * CONFIRMED -> PROCESSING | CANCELLED
 * PROCESSING -> SHIPPED | CANCELLED
 * SHIPPED -> DELIVERED
 * DELIVERED, CANCELLED -> (terminal states)
 */
@Schema(description = "Order lifecycle status", enumAsRef = true)
public enum OrderStatus {

    @Schema(description = "Order is being prepared (items can be modified)")
    DRAFT("Order is being prepared"),

    @Schema(description = "Order has been submitted and is pending confirmation")
    PENDING("Order is pending confirmation"),

    @Schema(description = "Order has been confirmed and is awaiting processing")
    CONFIRMED("Order has been confirmed"),

    @Schema(description = "Order is being processed for shipment")
    PROCESSING("Order is being processed"),

    @Schema(description = "Order has been shipped and is in transit")
    SHIPPED("Order has been shipped"),

    @Schema(description = "Order has been delivered to the customer")
    DELIVERED("Order has been delivered"),

    @Schema(description = "Order has been cancelled")
    CANCELLED("Order has been cancelled");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Checks if transition to the target status is allowed.
     */
    public boolean canTransitionTo(OrderStatus target) {
        return switch (this) {
            case DRAFT -> target == PENDING || target == CANCELLED;
            case PENDING -> target == CONFIRMED || target == CANCELLED;
            case CONFIRMED -> target == PROCESSING || target == CANCELLED;
            case PROCESSING -> target == SHIPPED || target == CANCELLED;
            case SHIPPED -> target == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    /**
     * Validates and returns the target status if transition is allowed.
     * @throws DomainException if transition is not allowed
     */
    public OrderStatus transitionTo(OrderStatus target) {
        if (!canTransitionTo(target)) {
            throw new DomainException("INVALID_STATUS_TRANSITION",
                String.format("Cannot transition from %s to %s", this, target));
        }
        return target;
    }

    /**
     * Checks if the order can be modified (items added/removed).
     * Only DRAFT orders can have items modified.
     */
    public boolean isModifiable() {
        return this == DRAFT;
    }

    /**
     * Checks if the order can be submitted.
     * Only DRAFT orders can be submitted.
     */
    public boolean canSubmit() {
        return this == DRAFT;
    }

    /**
     * Checks if the order is in a terminal state.
     */
    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }

    /**
     * Checks if customer info can be updated.
     * Only DRAFT orders can have customer info updated.
     */
    public boolean canUpdateCustomerInfo() {
        return this == DRAFT;
    }
}
