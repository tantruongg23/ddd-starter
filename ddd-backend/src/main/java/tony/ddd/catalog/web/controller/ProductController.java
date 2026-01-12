package tony.ddd.catalog.web.controller;

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
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tony.ddd.catalog.application.command.ActivateProductCommand;
import tony.ddd.catalog.application.command.CreateProductCommand;
import tony.ddd.catalog.application.command.DeactivateProductCommand;
import tony.ddd.catalog.application.command.UpdatePriceCommand;
import tony.ddd.catalog.application.command.UpdateProductCommand;
import tony.ddd.catalog.application.dto.ProductDto;
import tony.ddd.catalog.application.port.in.ProductUseCase;
import tony.ddd.catalog.application.query.GetProductQuery;
import tony.ddd.catalog.application.query.ListProductsQuery;
import tony.ddd.catalog.domain.model.ProductStatus;
import tony.ddd.catalog.web.assembler.ProductModelAssembler;
import tony.ddd.catalog.web.request.CreateProductRequest;
import tony.ddd.catalog.web.request.UpdatePriceRequest;
import tony.ddd.catalog.web.request.UpdateProductRequest;
import tony.ddd.catalog.web.response.ProductResponse;

import java.util.List;

/**
 * REST Controller for Product operations.
 * Follows RESTful conventions with HATEOAS support.
 */
@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Product Catalog", description = "Product management operations")
public class ProductController {

    private final ProductUseCase productUseCase;
    private final ProductModelAssembler assembler;

    public ProductController(ProductUseCase productUseCase, ProductModelAssembler assembler) {
        this.productUseCase = productUseCase;
        this.assembler = assembler;
    }

    /**
     * Creates a new product.
     * POST /api/v1/products
     */
    @Operation(
        summary = "Create a new product",
        description = "Creates a new product in DRAFT status. The product must be activated before it can be purchased."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Product created successfully",
            headers = @Header(name = "Location", description = "URL of the created product"),
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        CreateProductCommand command = new CreateProductCommand(
            request.name(),
            request.description(),
            request.price(),
            request.currency(),
            request.sku()
        );
        ProductDto productDto = productUseCase.createProduct(command);
        ProductResponse response = assembler.toModel(productDto);

        return ResponseEntity
            .created(response.getRequiredLink(IanaLinkRelations.SELF).toUri())
            .body(response);
    }

    /**
     * Gets a product by ID.
     * GET /api/v1/products/{productId}
     */
    @Operation(
        summary = "Get product by ID",
        description = "Retrieves a single product by its unique identifier"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Product found",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProduct(
            @Parameter(description = "Unique product identifier", example = "prod-123e4567-e89b")
            @PathVariable String productId) {
        GetProductQuery query = new GetProductQuery(productId);
        ProductDto productDto = productUseCase.getProduct(query);
        return ResponseEntity.ok(assembler.toModel(productDto));
    }

    /**
     * Gets all products.
     * GET /api/v1/products
     */
    @Operation(
        summary = "List all products",
        description = "Retrieves all products in the catalog regardless of status"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Products retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProductResponse.class))
    )
    @GetMapping
    public ResponseEntity<CollectionModel<ProductResponse>> getAllProducts() {
        List<ProductDto> products = productUseCase.getAllProducts();
        return ResponseEntity.ok(assembler.toCollectionModel(products));
    }

    /**
     * Gets products by status.
     * GET /api/v1/products?status={status}
     */
    @Operation(
        summary = "List products by status",
        description = "Retrieves products filtered by their current status (DRAFT, ACTIVE, or INACTIVE)"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Products retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProductResponse.class))
    )
    @GetMapping(params = "status")
    public ResponseEntity<CollectionModel<ProductResponse>> getProductsByStatus(
            @Parameter(description = "Product status filter", example = "ACTIVE")
            @RequestParam ProductStatus status) {
        ListProductsQuery query = ListProductsQuery.byStatus(status);
        List<ProductDto> products = productUseCase.listProducts(query);
        return ResponseEntity.ok(assembler.toCollectionModel(products));
    }

    /**
     * Updates a product's information.
     * PUT /api/v1/products/{productId}
     */
    @Operation(
        summary = "Update product information",
        description = "Updates the name and description of an existing product"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Product updated successfully",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @Parameter(description = "Unique product identifier", example = "prod-123e4567-e89b")
            @PathVariable String productId,
            @Valid @RequestBody UpdateProductRequest request) {
        UpdateProductCommand command = new UpdateProductCommand(
            productId,
            request.name(),
            request.description()
        );
        ProductDto productDto = productUseCase.updateProduct(command);
        return ResponseEntity.ok(assembler.toModel(productDto));
    }

    /**
     * Updates a product's price.
     * PATCH /api/v1/products/{productId}/price
     */
    @Operation(
        summary = "Update product price",
        description = "Updates the price and currency of an existing product. Generates a price change event."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Price updated successfully",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid price data",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PatchMapping("/{productId}/price")
    public ResponseEntity<ProductResponse> updatePrice(
            @Parameter(description = "Unique product identifier", example = "prod-123e4567-e89b")
            @PathVariable String productId,
            @Valid @RequestBody UpdatePriceRequest request) {
        UpdatePriceCommand command = new UpdatePriceCommand(
            productId,
            request.price(),
            request.currency()
        );
        ProductDto productDto = productUseCase.updatePrice(command);
        return ResponseEntity.ok(assembler.toModel(productDto));
    }

    /**
     * Activates a product.
     * POST /api/v1/products/{productId}/activate
     */
    @Operation(
        summary = "Activate a product",
        description = "Transitions a product from DRAFT or INACTIVE to ACTIVE status, making it available for purchase"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Product activated successfully",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Invalid status transition",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PostMapping("/{productId}/activate")
    public ResponseEntity<ProductResponse> activateProduct(
            @Parameter(description = "Unique product identifier", example = "prod-123e4567-e89b")
            @PathVariable String productId) {
        ActivateProductCommand command = new ActivateProductCommand(productId);
        ProductDto productDto = productUseCase.activateProduct(command);
        return ResponseEntity.ok(assembler.toModel(productDto));
    }

    /**
     * Deactivates a product.
     * POST /api/v1/products/{productId}/deactivate
     */
    @Operation(
        summary = "Deactivate a product",
        description = "Transitions a product from ACTIVE to INACTIVE status, removing it from sale"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Product deactivated successfully",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Invalid status transition",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ProblemDetail"))
        )
    })
    @PostMapping("/{productId}/deactivate")
    public ResponseEntity<ProductResponse> deactivateProduct(
            @Parameter(description = "Unique product identifier", example = "prod-123e4567-e89b")
            @PathVariable String productId) {
        DeactivateProductCommand command = new DeactivateProductCommand(productId);
        ProductDto productDto = productUseCase.deactivateProduct(command);
        return ResponseEntity.ok(assembler.toModel(productDto));
    }
}
