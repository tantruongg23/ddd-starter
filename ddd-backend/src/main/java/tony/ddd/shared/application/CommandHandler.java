package tony.ddd.shared.application;

/**
 * Interface for command handlers following CQRS pattern.
 * Commands represent an intent to change the system state.
 *
 * @param <C> The command type
 * @param <R> The result type
 */
public interface CommandHandler<C extends Command, R> {

    /**
     * Handles the given command and returns the result.
     *
     * @param command The command to handle
     * @return The result of handling the command
     */
    R handle(C command);
}
