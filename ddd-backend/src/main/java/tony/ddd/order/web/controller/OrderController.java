package tony.ddd.order.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tony.ddd.order.application.command.RemoveOrderItemCommand;
import tony.ddd.order.application.command.SubmitOrderCommand;
import tony.ddd.order.application.dto.OrderDto;
import tony.ddd.order.application.port.in.CreateOrderUseCase;
import tony.ddd.order.application.port.in.ManageOrderUseCase;
import tony.ddd.order.application.port.in.OrderQueryUseCase;
import tony.ddd.order.application.query.GetOrderQuery;
import tony.ddd.order.application.query.GetOrdersByCustomerQuery;
import tony.ddd.order.application.query.GetOrdersByStatusQuery;
import tony.ddd.order.domain.model.OrderStatus;
import tony.ddd.order.web.assembler.OrderModelAssembler;
import tony.ddd.order.web.request.AddOrderItemRequest;
import tony.ddd.order.web.request.CreateOrderRequest;
import tony.ddd.order.web.request.SetCustomerInfoRequest;
import tony.ddd.order.web.request.UpdateItemQuantityRequest;
import tony.ddd.order.web.request.UpdateOrderStatusRequest;
import tony.ddd.order.web.response.OrderResponse;

import java.util.List;

/**
 * REST Controller for Order operations.
 * Follows RESTful conventions with HATEOAS support.
 * This is the entry point to the application layer from the web.
 */
@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Order Management", description = "Order lifecycle management operations")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final ManageOrderUseCase manageOrderUseCase;
    private final OrderQueryUseCase orderQueryUseCase;
    private final OrderModelAssembler assembler;

    public OrderController(CreateOrderUseCase createOrderUseCase,
                           ManageOrderUseCase manageOrderUseCase,
                           OrderQueryUseCase orderQueryUseCase,
                           OrderModelAssembler assembler) {
        this.createOrderUseCase = createOrderUseCase;
        this.manageOrderUseCase = manageOrderUseCase;
        this.orderQueryUseCase = orderQueryUseCase;
        this.assembler = assembler;
    }

    /**
     * Creates a new order.
     * POST /api/v1/orders
     */
    @Operation(
        summary = "Create a new order",
        description = "Creates a new order in DRAFT status with shipping address and initial items. " +
                      "Items can be added/removed while in DRAFT status before submitting."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Order created successfully",
            headers = @Header(name = "Location", description = "URL of the created order"),
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "422",
            description = "Business rule violation (e.g., order below minimum amount)",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto orderDto = createOrderUseCase.createOrder(request.toCommand());
        OrderResponse response = assembler.toModel(orderDto);
        
        return ResponseEntity
            .created(response.getRequiredLink(IanaLinkRelations.SELF).toUri())
            .body(response);
    }

    /**
     * Gets an order by ID.
     * GET /api/v1/orders/{orderId}
     */
    @Operation(
        summary = "Get order by ID",
        description = "Retrieves a single order with all its details, items, and available actions"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Order found",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Order not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @Parameter(description = "Unique order identifier", example = "ord-123e4567-e89b")
            @PathVariable String orderId) {
        OrderDto orderDto = orderQueryUseCase.getOrder(new GetOrderQuery(orderId));
        return ResponseEntity.ok(assembler.toModel(orderDto));
    }

    /**
     * Gets all orders.
     * GET /api/v1/orders
     */
    @Operation(
        summary = "List all orders",
        description = "Retrieves all orders in the system"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Orders retrieved successfully",
        content = @Content(schema = @Schema(implementation = OrderResponse.class))
    )
    @GetMapping
    public ResponseEntity<CollectionModel<OrderResponse>> getAllOrders() {
        List<OrderDto> orders = orderQueryUseCase.getAllOrders();
        return ResponseEntity.ok(assembler.toCollectionModel(orders));
    }

    /**
     * Gets orders by customer ID.
     * GET /api/v1/orders?customerId={customerId}
     */
    @Operation(
        summary = "List orders by customer",
        description = "Retrieves all orders for a specific customer"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Orders retrieved successfully",
        content = @Content(schema = @Schema(implementation = OrderResponse.class))
    )
    @GetMapping(params = "customerId")
    public ResponseEntity<CollectionModel<OrderResponse>> getOrdersByCustomer(
            @Parameter(description = "Customer identifier", example = "cust-123")
            @RequestParam String customerId) {
        List<OrderDto> orders = orderQueryUseCase.getOrdersByCustomer(
            new GetOrdersByCustomerQuery(customerId));
        return ResponseEntity.ok(assembler.toCollectionModel(orders));
    }

    /**
     * Gets orders by status.
     * GET /api/v1/orders?status={status}
     */
    @Operation(
        summary = "List orders by status",
        description = "Retrieves orders filtered by their current status"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Orders retrieved successfully",
        content = @Content(schema = @Schema(implementation = OrderResponse.class))
    )
    @GetMapping(params = "status")
    public ResponseEntity<CollectionModel<OrderResponse>> getOrdersByStatus(
            @Parameter(description = "Order status filter", example = "CONFIRMED")
            @RequestParam OrderStatus status) {
        List<OrderDto> orders = orderQueryUseCase.getOrdersByStatus(
            new GetOrdersByStatusQuery(status));
        return ResponseEntity.ok(assembler.toCollectionModel(orders));
    }

    /**
     * Updates an order's status.
     * PATCH /api/v1/orders/{orderId}/status
     */
    @Operation(
        summary = "Update order status",
        description = "Transitions the order to a new status. Valid transitions depend on current status. " +
                      "Cancellation requires a reason."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Status updated successfully",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Order not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Invalid status transition",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @Parameter(description = "Unique order identifier", example = "ord-123e4567-e89b")
            @PathVariable String orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDto orderDto = manageOrderUseCase.updateOrderStatus(request.toCommand(orderId));
        return ResponseEntity.ok(assembler.toModel(orderDto));
    }

    /**
     * Adds an item to an order.
     * POST /api/v1/orders/{orderId}/items
     */
    @Operation(
        summary = "Add item to order",
        description = "Adds a new item to the order. Only allowed when order is in DRAFT status."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Item added successfully",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Order not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Order not modifiable (not in DRAFT status)",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PostMapping("/{orderId}/items")
    public ResponseEntity<OrderResponse> addOrderItem(
            @Parameter(description = "Unique order identifier", example = "ord-123e4567-e89b")
            @PathVariable String orderId,
            @Valid @RequestBody AddOrderItemRequest request) {
        OrderDto orderDto = manageOrderUseCase.addOrderItem(request.toCommand(orderId));
        return ResponseEntity.ok(assembler.toModel(orderDto));
    }

    /**
     * Removes an item from an order.
     * DELETE /api/v1/orders/{orderId}/items/{productId}
     */
    @Operation(
        summary = "Remove item from order",
        description = "Removes an item from the order. Only allowed when order is in DRAFT status."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Item removed successfully",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Order or item not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Order not modifiable (not in DRAFT status)",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @DeleteMapping("/{orderId}/items/{productId}")
    public ResponseEntity<OrderResponse> removeOrderItem(
            @Parameter(description = "Unique order identifier", example = "ord-123e4567-e89b")
            @PathVariable String orderId,
            @Parameter(description = "Product identifier of the item to remove", example = "prod-abc123")
            @PathVariable String productId) {
        OrderDto orderDto = manageOrderUseCase.removeOrderItem(
            new RemoveOrderItemCommand(orderId, productId));
        return ResponseEntity.ok(assembler.toModel(orderDto));
    }

    /**
     * Updates the quantity of an item in an order.
     * PATCH /api/v1/orders/{orderId}/items/{productId}
     */
    @Operation(
        summary = "Update item quantity",
        description = "Updates the quantity of an existing item in the order. Only allowed when order is in DRAFT status."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Quantity updated successfully",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid quantity",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Order or item not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Order not modifiable (not in DRAFT status)",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PatchMapping("/{orderId}/items/{productId}")
    public ResponseEntity<OrderResponse> updateItemQuantity(
            @Parameter(description = "Unique order identifier", example = "ord-123e4567-e89b")
            @PathVariable String orderId,
            @Parameter(description = "Product identifier of the item to update", example = "prod-abc123")
            @PathVariable String productId,
            @Valid @RequestBody UpdateItemQuantityRequest request) {
        OrderDto orderDto = manageOrderUseCase.updateItemQuantity(
            request.toCommand(orderId, productId));
        return ResponseEntity.ok(assembler.toModel(orderDto));
    }

    /**
     * Sets customer information on an order.
     * PUT /api/v1/orders/{orderId}/customer-info
     */
    @Operation(
        summary = "Set customer information",
        description = "Sets or updates customer contact information on the order. Only allowed when order is in DRAFT status."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Customer info updated successfully",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid customer info",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Order not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Order not modifiable (not in DRAFT status)",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PutMapping("/{orderId}/customer-info")
    public ResponseEntity<OrderResponse> setCustomerInfo(
            @Parameter(description = "Unique order identifier", example = "ord-123e4567-e89b")
            @PathVariable String orderId,
            @Valid @RequestBody SetCustomerInfoRequest request) {
        OrderDto orderDto = manageOrderUseCase.setCustomerInfo(request.toCommand(orderId));
        return ResponseEntity.ok(assembler.toModel(orderDto));
    }

    /**
     * Submits an order for processing.
     * POST /api/v1/orders/{orderId}/submit
     */
    @Operation(
        summary = "Submit order",
        description = "Submits a DRAFT order for processing, transitioning it to PENDING status. " +
                      "Generates an order number and validates the order meets minimum requirements."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Order submitted successfully",
            content = @Content(schema = @Schema(implementation = OrderResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Order not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Order cannot be submitted (not in DRAFT status)",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "422",
            description = "Order does not meet submission requirements",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PostMapping("/{orderId}/submit")
    public ResponseEntity<OrderResponse> submitOrder(
            @Parameter(description = "Unique order identifier", example = "ord-123e4567-e89b")
            @PathVariable String orderId) {
        OrderDto orderDto = manageOrderUseCase.submitOrder(new SubmitOrderCommand(orderId));
        return ResponseEntity.ok(assembler.toModel(orderDto));
    }
}
