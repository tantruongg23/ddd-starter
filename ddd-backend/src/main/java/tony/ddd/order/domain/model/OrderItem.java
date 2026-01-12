package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.DomainException;
import tony.ddd.shared.domain.Entity;

/**
 * Entity representing an item within an Order aggregate.
 * OrderItem is not an aggregate root - it can only be accessed through Order.
 */
public class OrderItem extends Entity<OrderItemId> {

    private final ProductId productId;
    private final String productName;
    private final Money unitPrice;
    private Quantity quantity;

    private OrderItem(OrderItemId id, ProductId productId, String productName, 
                      Money unitPrice, Quantity quantity) {
        super(id);
        this.productId = productId;
        this.productName = productName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }

    /**
     * Factory method to create a new OrderItem.
     */
    public static OrderItem create(ProductId productId, String productName, 
                                    Money unitPrice, Quantity quantity) {
        if (productId == null) {
            throw new DomainException("INVALID_ORDER_ITEM", "Product ID is required");
        }
        if (productName == null || productName.isBlank()) {
            throw new DomainException("INVALID_ORDER_ITEM", "Product name is required");
        }
        if (unitPrice == null) {
            throw new DomainException("INVALID_ORDER_ITEM", "Unit price is required");
        }
        if (quantity == null) {
            throw new DomainException("INVALID_ORDER_ITEM", "Quantity is required");
        }

        return new OrderItem(OrderItemId.generate(), productId, productName, unitPrice, quantity);
    }

    /**
     * Reconstitutes an OrderItem from persistence.
     */
    public static OrderItem reconstitute(OrderItemId id, ProductId productId, String productName,
                                          Money unitPrice, Quantity quantity) {
        return new OrderItem(id, productId, productName, unitPrice, quantity);
    }

    /**
     * Updates the quantity of this item.
     */
    public void updateQuantity(Quantity newQuantity) {
        if (newQuantity == null) {
            throw new DomainException("INVALID_ORDER_ITEM", "Quantity cannot be null");
        }
        this.quantity = newQuantity;
    }

    /**
     * Calculates the subtotal for this item (unit price × quantity).
     */
    public Money calculateSubtotal() {
        return unitPrice.multiply(quantity.value());
    }

    // Getters
    public ProductId getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Money getUnitPrice() {
        return unitPrice;
    }

    public Quantity getQuantity() {
        return quantity;
    }
}
