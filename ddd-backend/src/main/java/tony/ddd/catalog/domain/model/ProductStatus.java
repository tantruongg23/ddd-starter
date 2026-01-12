package tony.ddd.catalog.domain.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Status of a Product in the catalog.
 * Products follow a lifecycle: DRAFT -> ACTIVE <-> INACTIVE
 */
@Schema(description = "Product lifecycle status", enumAsRef = true)
public enum ProductStatus {
    /**
     * Product is being prepared and not yet available for sale.
     */
    @Schema(description = "Product is being prepared and not yet available for sale")
    DRAFT,

    /**
     * Product is active and available for purchase.
     */
    @Schema(description = "Product is active and available for purchase")
    ACTIVE,

    /**
     * Product has been deactivated and is not available for purchase.
     */
    @Schema(description = "Product has been deactivated and is not available for purchase")
    INACTIVE;

    /**
     * Checks if this status can transition to the target status.
     */
    public boolean canTransitionTo(ProductStatus target) {
        return switch (this) {
            case DRAFT -> target == ACTIVE;
            case ACTIVE -> target == INACTIVE;
            case INACTIVE -> target == ACTIVE;
        };
    }

    /**
     * Checks if this status allows the product to be purchased.
     */
    public boolean isAvailableForPurchase() {
        return this == ACTIVE;
    }
}
