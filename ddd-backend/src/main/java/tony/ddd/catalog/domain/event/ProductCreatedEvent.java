package tony.ddd.catalog.domain.event;

import tony.ddd.shared.domain.DomainEvent;

import java.math.BigDecimal;

/**
 * Domain Event raised when a new Product is created.
 */
public class ProductCreatedEvent extends DomainEvent {

    private static final String EVENT_TYPE = "ProductCreated";
    private static final String AGGREGATE_TYPE = "Product";

    private final String name;
    private final String sku;
    private final BigDecimal price;

    public ProductCreatedEvent(String productId, String name, String sku, BigDecimal price) {
        super(productId, AGGREGATE_TYPE);
        this.name = name;
        this.sku = sku;
        this.price = price;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    public String getProductId() {
        return getAggregateId();
    }

    public String getName() {
        return name;
    }

    public String getSku() {
        return sku;
    }

    public BigDecimal getPrice() {
        return price;
    }
}
