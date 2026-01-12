package tony.ddd.catalog.application.port.in;

import tony.ddd.catalog.application.command.ActivateProductCommand;
import tony.ddd.catalog.application.command.CreateProductCommand;
import tony.ddd.catalog.application.command.DeactivateProductCommand;
import tony.ddd.catalog.application.command.UpdatePriceCommand;
import tony.ddd.catalog.application.command.UpdateProductCommand;
import tony.ddd.catalog.application.dto.ProductDto;
import tony.ddd.catalog.application.query.GetProductQuery;
import tony.ddd.catalog.application.query.ListProductsQuery;
import tony.ddd.shared.application.UseCase;

import java.util.List;
import java.util.Optional;

/**
 * Input port for Product operations.
 * Defines the use case boundary that the web layer uses to interact with the application.
 * Follows CQRS pattern - commands for mutations, queries for reads.
 */
public interface ProductUseCase extends UseCase {

    // Command operations

    /**
     * Creates a new product.
     *
     * @param command The command containing product details
     * @return The created product as DTO
     */
    ProductDto createProduct(CreateProductCommand command);

    /**
     * Updates a product's information.
     *
     * @param command The command containing product ID and updated info
     * @return The updated product as DTO
     */
    ProductDto updateProduct(UpdateProductCommand command);

    /**
     * Updates a product's price.
     *
     * @param command The command containing product ID and new price
     * @return The updated product as DTO
     */
    ProductDto updatePrice(UpdatePriceCommand command);

    /**
     * Activates a product, making it available for purchase.
     *
     * @param command The command containing product ID
     * @return The activated product as DTO
     */
    ProductDto activateProduct(ActivateProductCommand command);

    /**
     * Deactivates a product, making it unavailable for purchase.
     *
     * @param command The command containing product ID
     * @return The deactivated product as DTO
     */
    ProductDto deactivateProduct(DeactivateProductCommand command);

    // Query operations

    /**
     * Gets a product by ID.
     *
     * @param query The query containing product ID
     * @return The product as DTO
     * @throws tony.ddd.catalog.domain.exception.ProductNotFoundException if not found
     */
    ProductDto getProduct(GetProductQuery query);

    /**
     * Finds a product by ID, returning Optional.
     *
     * @param query The query containing product ID
     * @return Optional containing the product DTO, or empty if not found
     */
    Optional<ProductDto> findProduct(GetProductQuery query);

    /**
     * Lists products with optional filtering.
     *
     * @param query The query containing optional status filter
     * @return List of products matching the criteria
     */
    List<ProductDto> listProducts(ListProductsQuery query);

    /**
     * Gets all products.
     *
     * @return List of all products
     */
    List<ProductDto> getAllProducts();
}
