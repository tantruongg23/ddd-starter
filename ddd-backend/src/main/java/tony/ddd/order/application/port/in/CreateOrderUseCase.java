package tony.ddd.order.application.port.in;

import tony.ddd.order.application.command.CreateOrderCommand;
import tony.ddd.order.application.dto.OrderDto;
import tony.ddd.shared.application.UseCase;

/**
 * Input port for creating orders.
 * Defines the use case boundary that the web layer uses to interact with the application.
 */
public interface CreateOrderUseCase extends UseCase {

    /**
     * Creates a new order based on the given command.
     *
     * @param command The command containing order details
     * @return The created order as DTO
     */
    OrderDto createOrder(CreateOrderCommand command);
}
