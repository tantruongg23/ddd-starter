package tony.ddd.order.application.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tony.ddd.order.application.command.AddOrderItemCommand;
import tony.ddd.order.application.command.CreateOrderCommand;
import tony.ddd.order.application.command.RemoveOrderItemCommand;
import tony.ddd.order.application.command.SetCustomerInfoCommand;
import tony.ddd.order.application.command.SubmitOrderCommand;
import tony.ddd.order.application.command.UpdateItemQuantityCommand;
import tony.ddd.order.application.command.UpdateOrderStatusCommand;
import tony.ddd.order.application.dto.OrderDto;
import tony.ddd.order.application.port.in.CreateOrderUseCase;
import tony.ddd.order.application.port.in.ManageOrderUseCase;
import tony.ddd.order.application.port.out.ProductPort;
import tony.ddd.order.application.port.out.ProductPort.ProductInfo;
import tony.ddd.order.domain.exception.OrderNotFoundException;
import tony.ddd.order.domain.model.*;
import tony.ddd.order.domain.repository.OrderRepository;
import tony.ddd.order.domain.service.OrderDomainService;
import tony.ddd.shared.domain.DomainException;
import tony.ddd.shared.infrastructure.DomainEventPublisher;

import java.util.List;

/**
 * Application Service implementing order-related use cases.
 * Orchestrates domain objects and services to fulfill business use cases.
 * This is the transaction boundary.
 */
@Service
@Transactional
public class OrderApplicationService implements CreateOrderUseCase, ManageOrderUseCase {

    private final OrderRepository orderRepository;
    private final OrderDomainService orderDomainService;
    private final DomainEventPublisher eventPublisher;
    private final ProductPort productPort;

    public OrderApplicationService(OrderRepository orderRepository,
                                    OrderDomainService orderDomainService,
                                    DomainEventPublisher eventPublisher,
                                    ProductPort productPort) {
        this.orderRepository = orderRepository;
        this.orderDomainService = orderDomainService;
        this.eventPublisher = eventPublisher;
        this.productPort = productPort;
    }

    @Override
    public OrderDto createOrder(CreateOrderCommand command) {
        // Map command to domain objects
        CustomerId customerId = CustomerId.of(command.customerId());
        Address shippingAddress = mapToAddress(command.shippingAddress());
        
        // Validate products and create snapshots from catalog
        List<OrderItem> items = mapToOrderItemsWithValidation(command.items());

        // Create order aggregate
        Order order = Order.create(customerId, shippingAddress, items);

        // Apply domain service validations
        orderDomainService.validateMinimumOrderAmount(order);

        // Persist order
        Order savedOrder = orderRepository.save(order);

        // Publish domain events
        eventPublisher.publishEventsFrom(savedOrder);

        // Return DTO
        return toDto(savedOrder);
    }

    @Override
    public OrderDto updateOrderStatus(UpdateOrderStatusCommand command) {
        Order order = findOrderOrThrow(command.orderId());

        // Apply status transition based on command
        switch (command.newStatus()) {
            case CONFIRMED -> order.confirm();
            case PROCESSING -> order.startProcessing();
            case SHIPPED -> order.ship();
            case DELIVERED -> order.deliver();
            case CANCELLED -> order.cancel(command.reason());
            default -> throw new IllegalArgumentException("Unsupported status: " + command.newStatus());
        }

        Order savedOrder = orderRepository.save(order);
        eventPublisher.publishEventsFrom(savedOrder);

        return toDto(savedOrder);
    }

    @Override
    public OrderDto addOrderItem(AddOrderItemCommand command) {
        Order order = findOrderOrThrow(command.orderId());

        // Validate product availability through catalog integration
        ProductInfo productInfo = validateAndGetProductInfo(command.productId());

        // Create product snapshot using current catalog data
        OrderItem newItem = OrderItem.create(
            ProductId.of(productInfo.productId()),
            productInfo.name(),
            Money.of(productInfo.price()),
            Quantity.of(command.quantity())
        );

        order.addItem(newItem);

        // Re-validate minimum order amount after modification
        orderDomainService.validateMinimumOrderAmount(order);

        Order savedOrder = orderRepository.save(order);
        eventPublisher.publishEventsFrom(savedOrder);
        return toDto(savedOrder);
    }

    @Override
    public OrderDto removeOrderItem(RemoveOrderItemCommand command) {
        Order order = findOrderOrThrow(command.orderId());

        order.removeItem(ProductId.of(command.productId()));

        // Re-validate minimum order amount after modification
        orderDomainService.validateMinimumOrderAmount(order);

        Order savedOrder = orderRepository.save(order);
        eventPublisher.publishEventsFrom(savedOrder);
        return toDto(savedOrder);
    }

    @Override
    public OrderDto setCustomerInfo(SetCustomerInfoCommand command) {
        Order order = findOrderOrThrow(command.orderId());

        CustomerInfo customerInfo = CustomerInfo.of(
            command.name(),
            command.email(),
            command.phone()
        );

        order.setCustomerInfo(customerInfo);

        Order savedOrder = orderRepository.save(order);
        return toDto(savedOrder);
    }

    @Override
    public OrderDto submitOrder(SubmitOrderCommand command) {
        Order order = findOrderOrThrow(command.orderId());

        // Validate all products are still available before submission
        for (OrderItem item : order.getItems()) {
            if (!productPort.isProductAvailable(item.getProductId().getValue())) {
                throw new DomainException("PRODUCT_NOT_AVAILABLE",
                    "Product is no longer available: " + item.getProductName());
            }
        }

        // Submit the order (generates order number and transitions to PENDING)
        order.submit();

        Order savedOrder = orderRepository.save(order);
        eventPublisher.publishEventsFrom(savedOrder);

        return toDto(savedOrder);
    }

    @Override
    public OrderDto updateItemQuantity(UpdateItemQuantityCommand command) {
        Order order = findOrderOrThrow(command.orderId());

        order.updateItemQuantity(
            ProductId.of(command.productId()),
            Quantity.of(command.quantity())
        );

        // Re-validate minimum order amount after modification
        orderDomainService.validateMinimumOrderAmount(order);

        Order savedOrder = orderRepository.save(order);
        return toDto(savedOrder);
    }

    private Order findOrderOrThrow(String orderId) {
        return orderRepository.findById(OrderId.of(orderId))
            .orElseThrow(() -> new OrderNotFoundException(OrderId.of(orderId)));
    }

    /**
     * Validates that a product exists and is available for purchase.
     * Returns the product info to create a snapshot in the order.
     */
    private ProductInfo validateAndGetProductInfo(String productId) {
        ProductInfo productInfo = productPort.findProduct(productId)
            .orElseThrow(() -> new DomainException("PRODUCT_NOT_FOUND",
                "Product not found: " + productId));

        if (!productInfo.availableForPurchase()) {
            throw new DomainException("PRODUCT_NOT_AVAILABLE",
                "Product is not available for purchase: " + productInfo.name());
        }

        return productInfo;
    }

    private Address mapToAddress(CreateOrderCommand.AddressData data) {
        return Address.of(
            data.street(),
            data.city(),
            data.state(),
            data.zipCode(),
            data.country()
        );
    }

    /**
     * Maps order item data to domain objects with product validation.
     * Creates product snapshots using current catalog data.
     */
    private List<OrderItem> mapToOrderItemsWithValidation(List<CreateOrderCommand.OrderItemData> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        
        return items.stream()
            .map(item -> {
                // Validate product and get current snapshot from catalog
                ProductInfo productInfo = validateAndGetProductInfo(item.productId());
                
                return OrderItem.create(
                    ProductId.of(productInfo.productId()),
                    productInfo.name(),
                    Money.of(productInfo.price()),
                    Quantity.of(item.quantity())
                );
            })
            .toList();
    }

    private OrderDto toDto(Order order) {
        Money shippingCost = orderDomainService.calculateShippingCost(order);
        return OrderDto.fromDomain(order, shippingCost.amount());
    }
}
