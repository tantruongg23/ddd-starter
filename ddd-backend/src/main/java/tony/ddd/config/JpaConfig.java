package tony.ddd.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * JPA configuration.
 * Enables JPA repositories scanning for all bounded contexts.
 */
@Configuration
@EnableJpaRepositories(basePackages = {
    "tony.ddd.order.infrastructure.persistence.repository",
    "tony.ddd.catalog.infrastructure.persistence.repository"
})
public class JpaConfig {
    // Additional JPA configurations can be added here
}
