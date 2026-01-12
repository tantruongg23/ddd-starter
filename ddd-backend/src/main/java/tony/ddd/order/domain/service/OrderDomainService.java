package tony.ddd.order.domain.service;

import org.springframework.stereotype.Service;
import tony.ddd.order.domain.model.Money;
import tony.ddd.order.domain.model.Order;
import tony.ddd.order.domain.model.OrderItem;
import tony.ddd.order.domain.model.ProductId;
import tony.ddd.shared.domain.DomainException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Domain Service for Order-related business logic that doesn't belong to a
 * single aggregate.
 * Domain services contain domain logic that spans multiple aggregates or
 * doesn't naturally fit within a single entity.
 */
@Service
public class OrderDomainService {

    private static final Money MINIMUM_ORDER_AMOUNT = Money.of(BigDecimal.valueOf(10.00));
    private static final Money FREE_SHIPPING_THRESHOLD = Money.of(BigDecimal.valueOf(100.00));
    private static final Money STANDARD_SHIPPING_COST = Money.of(BigDecimal.valueOf(9.99));

    /**
     * Validates that an order meets the minimum amount requirement.
     */
    public void validateMinimumOrderAmount(Order order) {
        Money totalAmount = order.calculateTotalAmount();
        if (totalAmount.isLessThan(MINIMUM_ORDER_AMOUNT)) {
            throw new DomainException("ORDER_BELOW_MINIMUM",
                    String.format("Order total %s is below minimum required amount %s",
                            totalAmount, MINIMUM_ORDER_AMOUNT));
        }
    }

    /**
     * Validates that an order is ready for submission.
     * Checks minimum amount and other business rules.
     */
    public void validateOrderForSubmission(Order order) {
        validateMinimumOrderAmount(order);

        if (order.getItems().isEmpty()) {
            throw new DomainException("ORDER_EMPTY", "Order must have at least one item");
        }

        if (order.getCustomerInfo() == null) {
            throw new DomainException("MISSING_CUSTOMER_INFO",
                    "Customer information is required before submission");
        }
    }

    /**
     * Validates that all products in the order are available for purchase.
     * This method should be called with the set of available product IDs
     * retrieved from the Catalog bounded context.
     * 
     * @param order               the order to validate
     * @param availableProductIds set of product IDs that are currently
     *                            active/available
     * @throws DomainException if any product is not available
     */
    public void validateProductAvailability(Order order, Set<String> availableProductIds) {
        List<OrderItem> unavailableItems = order.getItems().stream()
                .filter(item -> !availableProductIds.contains(item.getProductId().getValue()))
                .collect(Collectors.toList());

        if (!unavailableItems.isEmpty()) {
            String unavailableProducts = unavailableItems.stream()
                    .map(item -> item.getProductName() + " (" + item.getProductId().getValue() + ")")
                    .collect(Collectors.joining(", "));

            throw new DomainException("PRODUCT_UNAVAILABLE",
                    "The following products are not available: " + unavailableProducts);
        }
    }

    /**
     * Validates that a specific product is available for purchase.
     * 
     * @param productId   the product ID to validate
     * @param isAvailable whether the product is available
     * @param productName the product name for error messaging
     * @throws DomainException if the product is not available
     */
    public void validateProductAvailability(ProductId productId, boolean isAvailable, String productName) {
        if (!isAvailable) {
            throw new DomainException("PRODUCT_UNAVAILABLE",
                    String.format("Product '%s' (%s) is not available for purchase",
                            productName, productId.getValue()));
        }
    }

    /**
     * Calculates the shipping cost for an order.
     * Free shipping for orders above the threshold.
     */
    public Money calculateShippingCost(Order order) {
        Money totalAmount = order.calculateTotalAmount();
        if (totalAmount.isGreaterThan(FREE_SHIPPING_THRESHOLD) ||
                totalAmount.equals(FREE_SHIPPING_THRESHOLD)) {
            return Money.zero();
        }
        return STANDARD_SHIPPING_COST;
    }

    /**
     * Calculates the final order total including shipping.
     */
    public Money calculateOrderTotal(Order order) {
        Money subtotal = order.calculateTotalAmount();
        Money shipping = calculateShippingCost(order);
        return subtotal.add(shipping);
    }

    /**
     * Calculates statistics for a list of orders.
     */
    public OrderStatistics calculateStatistics(List<Order> orders) {
        if (orders.isEmpty()) {
            return new OrderStatistics(0, Money.zero(), Money.zero());
        }

        Money total = orders.stream()
                .map(Order::calculateTotalAmount)
                .reduce(Money.zero(), Money::add);

        Money average = Money.of(
                total.amount().divide(BigDecimal.valueOf(orders.size()),
                        total.amount().scale(), java.math.RoundingMode.HALF_UP));

        return new OrderStatistics(orders.size(), total, average);
    }

    /**
     * Statistics record for order analytics.
     */
    public record OrderStatistics(int orderCount, Money totalRevenue, Money averageOrderValue) {
    }
}
