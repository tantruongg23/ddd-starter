package tony.ddd.shared.infrastructure;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import tony.ddd.shared.domain.AggregateRoot;
import tony.ddd.shared.domain.DomainEvent;

import java.util.List;

/**
 * Infrastructure component for publishing domain events.
 * Uses Spring's ApplicationEventPublisher to publish events after aggregate persistence.
 */
@Component
public class DomainEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    public DomainEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    /**
     * Publishes all domain events from the given aggregate and clears them.
     */
    public void publishEventsFrom(AggregateRoot<?> aggregate) {
        List<DomainEvent> events = aggregate.getDomainEvents();
        events.forEach(applicationEventPublisher::publishEvent);
        aggregate.clearDomainEvents();
    }

    /**
     * Publishes a single domain event.
     */
    public void publish(DomainEvent event) {
        applicationEventPublisher.publishEvent(event);
    }
}
