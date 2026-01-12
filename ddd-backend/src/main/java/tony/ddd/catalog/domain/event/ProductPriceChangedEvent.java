package tony.ddd.catalog.domain.event;

import tony.ddd.shared.domain.DomainEvent;

import java.math.BigDecimal;

/**
 * Domain Event raised when a Product's price is changed.
 */
public class ProductPriceChangedEvent extends DomainEvent {

    private static final String EVENT_TYPE = "ProductPriceChanged";
    private static final String AGGREGATE_TYPE = "Product";

    private final BigDecimal oldPrice;
    private final BigDecimal newPrice;

    public ProductPriceChangedEvent(String productId, BigDecimal oldPrice, BigDecimal newPrice) {
        super(productId, AGGREGATE_TYPE);
        this.oldPrice = oldPrice;
        this.newPrice = newPrice;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    public String getProductId() {
        return getAggregateId();
    }

    public BigDecimal getOldPrice() {
        return oldPrice;
    }

    public BigDecimal getNewPrice() {
        return newPrice;
    }
}
