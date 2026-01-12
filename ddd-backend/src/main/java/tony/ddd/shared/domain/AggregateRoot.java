package tony.ddd.shared.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Base class for Aggregate Roots in DDD.
 * An Aggregate Root is the entry point to an aggregate and guarantees
 * the consistency of changes being made within the aggregate.
 *
 * @param <ID> The type of the aggregate identifier
 */
public abstract class AggregateRoot<ID> extends Entity<ID> {

    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected AggregateRoot() {
        super();
    }

    protected AggregateRoot(ID id) {
        super(id);
    }

    /**
     * Registers a domain event to be published when the aggregate is persisted.
     */
    protected void registerDomainEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    /**
     * Returns all domain events registered by this aggregate.
     */
    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    /**
     * Clears all domain events. Should be called after events are published.
     */
    public void clearDomainEvents() {
        domainEvents.clear();
    }
}
