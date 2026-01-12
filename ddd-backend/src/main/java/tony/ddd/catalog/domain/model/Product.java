package tony.ddd.catalog.domain.model;

import tony.ddd.catalog.domain.event.ProductActivatedEvent;
import tony.ddd.catalog.domain.event.ProductCreatedEvent;
import tony.ddd.catalog.domain.event.ProductDeactivatedEvent;
import tony.ddd.catalog.domain.event.ProductPriceChangedEvent;
import tony.ddd.order.domain.model.Money;
import tony.ddd.shared.domain.AggregateRoot;
import tony.ddd.shared.domain.DomainException;

import java.util.Objects;

/**
 * Product aggregate root representing an item in the catalog.
 * Products have a lifecycle: DRAFT -> ACTIVE <-> INACTIVE
 */
public class Product extends AggregateRoot<ProductId> {

    private String name;
    private String description;
    private Money price;
    private ProductStatus status;
    private String sku;

    // Required by JPA
    protected Product() {
        super(null);
    }

    private Product(ProductId id, String name, String description, Money price, String sku, ProductStatus status) {
        super(id);
        this.name = name;
        this.description = description;
        this.price = price;
        this.sku = sku;
        this.status = status;
    }

    /**
     * Creates a new product in DRAFT status.
     */
    public static Product create(ProductId id, String name, String description, Money price, String sku) {
        Objects.requireNonNull(id, "Product ID cannot be null");
        validateName(name);
        validatePrice(price);
        validateSku(sku);

        Product product = new Product(id, name, description, price, sku, ProductStatus.DRAFT);
        
        product.registerDomainEvent(new ProductCreatedEvent(
            id.getValue(),
            name,
            sku,
            price.amount()
        ));

        return product;
    }

    /**
     * Reconstitutes a Product from persistence (no events, no validation).
     */
    public static Product reconstitute(ProductId id, String name, String description, 
                                        Money price, String sku, ProductStatus status) {
        return new Product(id, name, description, price, sku, status);
    }

    /**
     * Activates the product, making it available for purchase.
     */
    public void activate() {
        if (!status.canTransitionTo(ProductStatus.ACTIVE)) {
            throw new DomainException("INVALID_STATUS_TRANSITION",
                "Cannot activate product from status: " + status);
        }
        this.status = ProductStatus.ACTIVE;
        
        registerDomainEvent(new ProductActivatedEvent(
            getId().getValue(),
            this.name
        ));
    }

    /**
     * Deactivates the product, making it unavailable for purchase.
     */
    public void deactivate() {
        if (!status.canTransitionTo(ProductStatus.INACTIVE)) {
            throw new DomainException("INVALID_STATUS_TRANSITION",
                "Cannot deactivate product from status: " + status);
        }
        this.status = ProductStatus.INACTIVE;
        
        registerDomainEvent(new ProductDeactivatedEvent(
            getId().getValue(),
            this.name
        ));
    }

    /**
     * Updates the product's basic information.
     * Can only be updated while in DRAFT status.
     */
    public void updateInfo(String name, String description) {
        if (status != ProductStatus.DRAFT) {
            throw new DomainException("PRODUCT_NOT_MODIFIABLE",
                "Product can only be modified in DRAFT status");
        }
        validateName(name);
        this.name = name;
        this.description = description;
    }

    /**
     * Updates the product's price.
     */
    public void updatePrice(Money newPrice) {
        validatePrice(newPrice);
        Money oldPrice = this.price;
        this.price = newPrice;
        
        registerDomainEvent(new ProductPriceChangedEvent(
            getId().getValue(),
            oldPrice.amount(),
            newPrice.amount()
        ));
    }

    /**
     * Checks if this product is available for purchase.
     */
    public boolean isAvailableForPurchase() {
        return status.isAvailableForPurchase();
    }

    // Validation methods
    private static void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new DomainException("INVALID_PRODUCT", "Product name cannot be empty");
        }
        if (name.length() > 255) {
            throw new DomainException("INVALID_PRODUCT", "Product name cannot exceed 255 characters");
        }
    }

    private static void validatePrice(Money price) {
        if (price == null) {
            throw new DomainException("INVALID_PRODUCT", "Product price cannot be null");
        }
        // Money constructor already validates non-negative amounts
    }

    private static void validateSku(String sku) {
        if (sku == null || sku.isBlank()) {
            throw new DomainException("INVALID_PRODUCT", "Product SKU cannot be empty");
        }
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Money getPrice() {
        return price;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public String getSku() {
        return sku;
    }
}
