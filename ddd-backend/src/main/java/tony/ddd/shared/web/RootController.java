package tony.ddd.shared.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tony.ddd.catalog.domain.model.ProductStatus;
import tony.ddd.catalog.web.controller.ProductController;
import tony.ddd.order.domain.model.OrderStatus;
import tony.ddd.order.web.controller.OrderController;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

/**
 * Root API controller providing entry point to the API.
 * Returns links to available resources following HATEOAS principles.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "API Root", description = "API entry point with discovery links")
public class RootController {

    /**
     * API entry point - returns links to all available resources.
     * GET /api/v1
     */
    @Operation(
        summary = "API entry point",
        description = "Returns HATEOAS links to all available resources and actions. " +
                      "Use this endpoint to discover the API capabilities."
    )
    @ApiResponse(
        responseCode = "200",
        description = "API root with navigation links",
        content = @Content(schema = @Schema(implementation = ApiRootResponse.class))
    )
    @GetMapping
    public ResponseEntity<RepresentationModel<?>> root() {
        RepresentationModel<?> rootModel = new RepresentationModel<>();

        // Self link
        rootModel.add(linkTo(methodOn(RootController.class).root()).withSelfRel());

        // ========== Catalog Context ==========
        
        // Products resource
        rootModel.add(linkTo(methodOn(ProductController.class).getAllProducts()).withRel("products"));

        // Create product
        rootModel.add(linkTo(methodOn(ProductController.class).createProduct(null)).withRel("create-product"));

        // Products by status
        for (ProductStatus status : ProductStatus.values()) {
            rootModel.add(linkTo(methodOn(ProductController.class)
                .getProductsByStatus(status)).withRel("products-" + status.name().toLowerCase()));
        }

        // ========== Order Context ==========
        
        // Orders resource
        rootModel.add(linkTo(methodOn(OrderController.class).getAllOrders()).withRel("orders"));

        // Create order
        rootModel.add(linkTo(methodOn(OrderController.class).createOrder(null)).withRel("create-order"));

        // Orders by status
        for (OrderStatus status : OrderStatus.values()) {
            rootModel.add(linkTo(methodOn(OrderController.class)
                .getOrdersByStatus(status)).withRel("orders-" + status.name().toLowerCase()));
        }

        return ResponseEntity.ok(rootModel);
    }

    /**
     * Schema class for OpenAPI documentation of API root response.
     */
    @Schema(description = "API root response with HATEOAS navigation links")
    private static class ApiRootResponse {
        @Schema(description = "HATEOAS links to available resources and actions")
        public Links _links;

        @Schema(description = "Navigation links")
        private static class Links {
            @Schema(description = "Self reference", example = "/api/v1")
            public Link self;

            @Schema(description = "All products", example = "/api/v1/products")
            public Link products;

            @Schema(description = "Create new product", example = "/api/v1/products")
            public Link create_product;

            @Schema(description = "Draft products", example = "/api/v1/products?status=DRAFT")
            public Link products_draft;

            @Schema(description = "Active products", example = "/api/v1/products?status=ACTIVE")
            public Link products_active;

            @Schema(description = "Inactive products", example = "/api/v1/products?status=INACTIVE")
            public Link products_inactive;

            @Schema(description = "All orders", example = "/api/v1/orders")
            public Link orders;

            @Schema(description = "Create new order", example = "/api/v1/orders")
            public Link create_order;

            @Schema(description = "Draft orders", example = "/api/v1/orders?status=DRAFT")
            public Link orders_draft;

            @Schema(description = "Pending orders", example = "/api/v1/orders?status=PENDING")
            public Link orders_pending;

            @Schema(description = "Confirmed orders", example = "/api/v1/orders?status=CONFIRMED")
            public Link orders_confirmed;

            @Schema(description = "Processing orders", example = "/api/v1/orders?status=PROCESSING")
            public Link orders_processing;

            @Schema(description = "Shipped orders", example = "/api/v1/orders?status=SHIPPED")
            public Link orders_shipped;

            @Schema(description = "Delivered orders", example = "/api/v1/orders?status=DELIVERED")
            public Link orders_delivered;

            @Schema(description = "Cancelled orders", example = "/api/v1/orders?status=CANCELLED")
            public Link orders_cancelled;
        }

        @Schema(description = "Single HATEOAS link")
        private static class Link {
            @Schema(description = "URL of the link", example = "/api/v1/products")
            public String href;
        }
    }
}
