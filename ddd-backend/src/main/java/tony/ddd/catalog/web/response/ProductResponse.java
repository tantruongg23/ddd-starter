package tony.ddd.catalog.web.response;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;
import tony.ddd.catalog.application.dto.ProductDto;
import tony.ddd.catalog.domain.model.ProductStatus;

import java.math.BigDecimal;

/**
 * HATEOAS response model for Product.
 */
@Relation(collectionRelation = "products", itemRelation = "product")
@Schema(description = "Product representation with HATEOAS links")
public class ProductResponse extends RepresentationModel<ProductResponse> {

    @Schema(description = "Unique product identifier", example = "prod-123e4567-e89b")
    private final String id;

    @Schema(description = "Product name", example = "Wireless Bluetooth Headphones")
    private final String name;

    @Schema(description = "Product description", example = "High-quality wireless headphones with noise cancellation")
    private final String description;

    @Schema(description = "Product price", example = "149.99")
    private final BigDecimal price;

    @Schema(description = "Currency code (ISO 4217)", example = "USD")
    private final String currency;

    @Schema(description = "Stock Keeping Unit", example = "WBH-2024-BLK")
    private final String sku;

    @Schema(description = "Current product status", example = "ACTIVE")
    private final ProductStatus status;

    public ProductResponse(String id, String name, String description, 
                           BigDecimal price, String currency, String sku, 
                           ProductStatus status) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.currency = currency;
        this.sku = sku;
        this.status = status;
    }

    public static ProductResponse fromDto(ProductDto dto) {
        return new ProductResponse(
            dto.id(),
            dto.name(),
            dto.description(),
            dto.price(),
            dto.currency(),
            dto.sku(),
            dto.status()
        );
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }

    public String getSku() {
        return sku;
    }

    public ProductStatus getStatus() {
        return status;
    }
}
