package tony.ddd.shared.application;

/**
 * Interface for query handlers following CQRS pattern.
 * Queries represent a request for information.
 *
 * @param <Q> The query type
 * @param <R> The result type
 */
public interface QueryHandler<Q extends Query, R> {

    /**
     * Handles the given query and returns the result.
     *
     * @param query The query to handle
     * @return The result of handling the query
     */
    R handle(Q query);
}
