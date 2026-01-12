package tony.ddd.order.application.port.in;

import tony.ddd.order.application.dto.OrderDto;
import tony.ddd.order.application.query.GetOrderQuery;
import tony.ddd.order.application.query.GetOrdersByCustomerQuery;
import tony.ddd.order.application.query.GetOrdersByStatusQuery;
import tony.ddd.shared.application.UseCase;

import java.util.List;

/**
 * Input port for querying orders.
 * Follows CQRS pattern - queries are separate from commands.
 */
public interface OrderQueryUseCase extends UseCase {

    /**
     * Gets a single order by ID.
     */
    OrderDto getOrder(GetOrderQuery query);

    /**
     * Gets all orders for a customer.
     */
    List<OrderDto> getOrdersByCustomer(GetOrdersByCustomerQuery query);

    /**
     * Gets all orders with a specific status.
     */
    List<OrderDto> getOrdersByStatus(GetOrdersByStatusQuery query);

    /**
     * Gets all orders.
     */
    List<OrderDto> getAllOrders();
}
