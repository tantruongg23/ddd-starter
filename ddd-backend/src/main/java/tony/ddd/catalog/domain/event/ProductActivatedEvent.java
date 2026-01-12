package tony.ddd.catalog.domain.event;

import tony.ddd.shared.domain.DomainEvent;

/**
 * Domain Event raised when a Product is activated.
 */
public class ProductActivatedEvent extends DomainEvent {

    private static final String EVENT_TYPE = "ProductActivated";
    private static final String AGGREGATE_TYPE = "Product";

    private final String name;

    public ProductActivatedEvent(String productId, String name) {
        super(productId, AGGREGATE_TYPE);
        this.name = name;
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
}
