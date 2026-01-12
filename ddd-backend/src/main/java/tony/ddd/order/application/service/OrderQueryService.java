package tony.ddd.order.application.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tony.ddd.order.application.dto.OrderDto;
import tony.ddd.order.application.port.in.OrderQueryUseCase;
import tony.ddd.order.application.query.GetOrderQuery;
import tony.ddd.order.application.query.GetOrdersByCustomerQuery;
import tony.ddd.order.application.query.GetOrdersByStatusQuery;
import tony.ddd.order.domain.exception.OrderNotFoundException;
import tony.ddd.order.domain.model.CustomerId;
import tony.ddd.order.domain.model.Order;
import tony.ddd.order.domain.model.OrderId;
import tony.ddd.order.domain.repository.OrderRepository;
import tony.ddd.order.domain.service.OrderDomainService;

import java.util.List;

/**
 * Query service for orders following CQRS pattern.
 * Handles all read operations separately from command operations.
 */
@Service
@Transactional(readOnly = true)
public class OrderQueryService implements OrderQueryUseCase {

    private final OrderRepository orderRepository;
    private final OrderDomainService orderDomainService;

    public OrderQueryService(OrderRepository orderRepository, 
                             OrderDomainService orderDomainService) {
        this.orderRepository = orderRepository;
        this.orderDomainService = orderDomainService;
    }

    @Override
    public OrderDto getOrder(GetOrderQuery query) {
        Order order = orderRepository.findById(OrderId.of(query.orderId()))
            .orElseThrow(() -> new OrderNotFoundException(OrderId.of(query.orderId())));
        return toDto(order);
    }

    @Override
    public List<OrderDto> getOrdersByCustomer(GetOrdersByCustomerQuery query) {
        return orderRepository.findByCustomerId(CustomerId.of(query.customerId()))
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Override
    public List<OrderDto> getOrdersByStatus(GetOrdersByStatusQuery query) {
        return orderRepository.findByStatus(query.status())
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Override
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll()
            .stream()
            .map(this::toDto)
            .toList();
    }

    private OrderDto toDto(Order order) {
        return OrderDto.fromDomain(order, 
            orderDomainService.calculateShippingCost(order).amount());
    }
}
