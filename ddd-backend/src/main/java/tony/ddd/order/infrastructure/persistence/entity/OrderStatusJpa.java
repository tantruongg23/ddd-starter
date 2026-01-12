package tony.ddd.order.infrastructure.persistence.entity;

import tony.ddd.order.domain.model.OrderStatus;

/**
 * JPA enum for Order status.
 * Separate from domain enum to allow independent evolution of persistence model.
 */
public enum OrderStatusJpa {
    DRAFT,
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    /**
     * Converts from domain OrderStatus to JPA status.
     */
    public static OrderStatusJpa fromDomain(OrderStatus status) {
        return switch (status) {
            case DRAFT -> DRAFT;
            case PENDING -> PENDING;
            case CONFIRMED -> CONFIRMED;
            case PROCESSING -> PROCESSING;
            case SHIPPED -> SHIPPED;
            case DELIVERED -> DELIVERED;
            case CANCELLED -> CANCELLED;
        };
    }

    /**
     * Converts to domain OrderStatus.
     */
    public OrderStatus toDomain() {
        return switch (this) {
            case DRAFT -> OrderStatus.DRAFT;
            case PENDING -> OrderStatus.PENDING;
            case CONFIRMED -> OrderStatus.CONFIRMED;
            case PROCESSING -> OrderStatus.PROCESSING;
            case SHIPPED -> OrderStatus.SHIPPED;
            case DELIVERED -> OrderStatus.DELIVERED;
            case CANCELLED -> OrderStatus.CANCELLED;
        };
    }
}
