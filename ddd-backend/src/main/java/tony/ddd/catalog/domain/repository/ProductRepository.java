package tony.ddd.catalog.domain.repository;

import tony.ddd.catalog.domain.model.Product;
import tony.ddd.catalog.domain.model.ProductId;
import tony.ddd.catalog.domain.model.ProductStatus;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Product aggregate.
 * This is a port in the hexagonal architecture.
 */
public interface ProductRepository {

    /**
     * Saves a product.
     */
    Product save(Product product);

    /**
     * Finds a product by its ID.
     */
    Optional<Product> findById(ProductId id);

    /**
     * Finds all products.
     */
    List<Product> findAll();

    /**
     * Finds all products with a specific status.
     */
    List<Product> findByStatus(ProductStatus status);

    /**
     * Checks if a product exists with the given ID.
     */
    boolean existsById(ProductId id);

    /**
     * Checks if a product exists with the given SKU.
     */
    boolean existsBySku(String sku);

    /**
     * Deletes a product by its ID.
     */
    void deleteById(ProductId id);
}
