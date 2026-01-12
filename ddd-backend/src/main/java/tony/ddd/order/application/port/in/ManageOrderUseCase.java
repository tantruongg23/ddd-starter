package tony.ddd.order.application.port.in;

import tony.ddd.order.application.command.AddOrderItemCommand;
import tony.ddd.order.application.command.RemoveOrderItemCommand;
import tony.ddd.order.application.command.SetCustomerInfoCommand;
import tony.ddd.order.application.command.SubmitOrderCommand;
import tony.ddd.order.application.command.UpdateItemQuantityCommand;
import tony.ddd.order.application.command.UpdateOrderStatusCommand;
import tony.ddd.order.application.dto.OrderDto;
import tony.ddd.shared.application.UseCase;

/**
 * Input port for managing existing orders.
 * Defines use case boundaries for order modifications.
 */
public interface ManageOrderUseCase extends UseCase {

    /**
     * Updates the status of an order.
     *
     * @param command The command containing order ID and new status
     * @return The updated order as DTO
     */
    OrderDto updateOrderStatus(UpdateOrderStatusCommand command);

    /**
     * Adds an item to an existing order.
     * Validates product availability through catalog integration.
     *
     * @param command The command containing item details
     * @return The updated order as DTO
     */
    OrderDto addOrderItem(AddOrderItemCommand command);

    /**
     * Removes an item from an existing order.
     *
     * @param command The command containing order and product IDs
     * @return The updated order as DTO
     */
    OrderDto removeOrderItem(RemoveOrderItemCommand command);

    /**
     * Sets or updates customer information on an order.
     * Customer info must be set before submitting the order.
     *
     * @param command The command containing customer details
     * @return The updated order as DTO
     */
    OrderDto setCustomerInfo(SetCustomerInfoCommand command);

    /**
     * Submits an order for processing.
     * Transitions the order from DRAFT to PENDING status.
     * Generates an OrderNumber upon submission.
     *
     * @param command The command containing the order ID
     * @return The submitted order as DTO
     */
    OrderDto submitOrder(SubmitOrderCommand command);

    /**
     * Updates the quantity of an item in an order.
     * Only allowed when the order is in DRAFT status.
     *
     * @param command The command containing order ID, product ID, and new quantity
     * @return The updated order as DTO
     */
    OrderDto updateItemQuantity(UpdateItemQuantityCommand command);
}
