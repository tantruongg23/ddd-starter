package tony.ddd.shared.domain;

/**
 * Marker interface for Value Objects in DDD.
 * Value Objects are immutable and compared by their attributes, not identity.
 * 
 * Implementing classes should:
 * - Be immutable (all fields final)
 * - Override equals() and hashCode() based on all attributes
 * - Have no identity
 * - Validate invariants in the constructor
 */
public interface ValueObject {
    
    /**
     * Validates the value object's invariants.
     * Should throw DomainException if validation fails.
     */
    default void validate() {
        // Override in subclasses if validation is needed
    }
}
