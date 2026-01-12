package tony.ddd.order.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import tony.ddd.order.application.port.in.CreateOrderUseCase;

/**
 * Initializes additional sample data for development and testing.
 * Only runs in 'dev' profile.
 * 
 * NOTE: Primary test data is now managed via Flyway migrations:
 * - V1__create_schema.sql - Database schema
 * - V2__seed_products.sql - Product catalog data
 * - V3__seed_orders.sql - Order test data
 * 
 * This initializer can be used for additional runtime data creation if needed.
 */
@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CreateOrderUseCase createOrderUseCase;

    public DataInitializer(CreateOrderUseCase createOrderUseCase) {
        this.createOrderUseCase = createOrderUseCase;
    }

    @Override
    public void run(String... args) {
        log.info("DataInitializer: Test data is managed via Flyway migrations.");
        log.info("DataInitializer: See db/migration/ for V1 (schema), V2 (products), V3 (orders)");
        // Additional runtime data creation can be added here if needed
    }
}
