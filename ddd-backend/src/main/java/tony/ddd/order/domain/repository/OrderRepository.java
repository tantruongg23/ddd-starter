package tony.ddd.order.domain.repository;

import tony.ddd.order.domain.model.CustomerId;
import tony.ddd.order.domain.model.Order;
import tony.ddd.order.domain.model.OrderId;
import tony.ddd.order.domain.model.OrderStatus;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Order aggregate.
 * This is a port in the hexagonal architecture - the domain defines what it needs,
 * and the infrastructure provides the implementation.
 */
public interface OrderRepository {

    /**
     * Saves an order (create or update).
     */
    Order save(Order order);

    /**
     * Finds an order by its ID.
     */
    Optional<Order> findById(OrderId id);

    /**
     * Finds all orders for a customer.
     */
    List<Order> findByCustomerId(CustomerId customerId);

    /**
     * Finds all orders with a specific status.
     */
    List<Order> findByStatus(OrderStatus status);

    /**
     * Finds all orders.
     */
    List<Order> findAll();

    /**
     * Deletes an order by its ID.
     */
    void deleteById(OrderId id);

    /**
     * Checks if an order exists by its ID.
     */
    boolean existsById(OrderId id);
}
