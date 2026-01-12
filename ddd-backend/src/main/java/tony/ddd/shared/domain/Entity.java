package tony.ddd.shared.domain;

import java.util.Objects;

/**
 * Base class for all Domain Entities.
 * Entities have identity and are compared by their ID, not by attributes.
 *
 * @param <ID> The type of the entity identifier
 */
public abstract class Entity<ID> {

    protected ID id;

    protected Entity() {
    }

    protected Entity(ID id) {
        this.id = id;
    }

    public ID getId() {
        return id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Entity<?> entity = (Entity<?>) o;
        return Objects.equals(id, entity.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
