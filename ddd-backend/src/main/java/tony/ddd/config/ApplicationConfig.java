package tony.ddd.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main application configuration.
 * Enables async processing for domain event handlers.
 */
@Configuration
@EnableAsync
public class ApplicationConfig {
    // Additional bean configurations can be added here
}
