package tony.ddd.shared.domain;

import java.time.Instant;
import java.util.UUID;

/**
 * Base class for all Domain Events.
 * Domain Events represent something that happened in the domain that domain experts care about.
 */
public abstract class DomainEvent {

    private final String eventId;
    private final Instant occurredOn;
    private final String aggregateId;
    private final String aggregateType;

    protected DomainEvent(String aggregateId, String aggregateType) {
        this.eventId = UUID.randomUUID().toString();
        this.occurredOn = Instant.now();
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
    }

    public String getEventId() {
        return eventId;
    }

    public Instant getOccurredOn() {
        return occurredOn;
    }

    public String getAggregateId() {
        return aggregateId;
    }

    public String getAggregateType() {
        return aggregateType;
    }

    /**
     * Returns the name of this event type.
     */
    public abstract String getEventType();
}
