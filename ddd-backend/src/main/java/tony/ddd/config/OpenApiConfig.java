package tony.ddd.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

/**
 * OpenAPI/Swagger documentation configuration.
 * Configures API documentation with metadata, groupings, and common schemas.
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.name:DDD E-Commerce API}")
    private String applicationName;

    @Value("${server.port:8080}")
    private int serverPort;

    /**
     * Main OpenAPI specification configuration.
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local Development Server")))
                .tags(List.of(
                        new Tag()
                                .name("API Root")
                                .description("API entry point with HATEOAS navigation links"),
                        new Tag()
                                .name("Product Catalog")
                                .description(
                                        "Product management operations - create, update, activate/deactivate products"),
                        new Tag()
                                .name("Order Management")
                                .description(
                                        "Order lifecycle management - create orders, manage items, update status")))
                .components(new Components()
                        .schemas(Map.of(
                                "ProblemDetail", problemDetailSchema())));
    }

    /**
     * API metadata information.
     */
    private Info apiInfo() {
        return new Info()
                .title("DDD E-Commerce API")
                .description(
                        """
                                RESTful API for E-Commerce platform built with Domain-Driven Design principles.

                                ## Architecture
                                This API follows DDD patterns with two bounded contexts:
                                - **Catalog Context**: Product management with status lifecycle (DRAFT → ACTIVE ↔ INACTIVE)
                                - **Order Context**: Order management with full lifecycle (DRAFT → PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED)

                                ## HATEOAS
                                All responses include hypermedia links for discoverability. Start at the root endpoint (`/api/v1`)
                                to discover available resources and actions.

                                ## Error Handling
                                Errors follow RFC 7807 Problem Details format with consistent structure.
                                """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("DDD Starter Team")
                        .email("api@example.com")
                        .url("https://github.com/example/ddd-starter"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    /**
     * RFC 7807 Problem Detail schema for error responses.
     */
    @SuppressWarnings("rawtypes")
    private Schema problemDetailSchema() {
        return new Schema<>()
                .type("object")
                .description("RFC 7807 Problem Details for HTTP APIs")
                .addProperty("type", new Schema<>().type("string").format("uri")
                        .description("URI reference identifying the problem type")
                        .example("https://api.example.com/errors/validation"))
                .addProperty("title", new Schema<>().type("string")
                        .description("Short, human-readable summary of the problem")
                        .example("Validation Failed"))
                .addProperty("status", new Schema<>().type("integer")
                        .description("HTTP status code")
                        .example(400))
                .addProperty("detail", new Schema<>().type("string")
                        .description("Human-readable explanation specific to this occurrence")
                        .example("Request validation failed with 2 error(s)"))
                .addProperty("instance", new Schema<>().type("string").format("uri")
                        .description("URI reference identifying the specific occurrence"))
                .addProperty("timestamp", new Schema<>().type("string").format("date-time")
                        .description("When the error occurred"))
                .addProperty("errorCode", new Schema<>().type("string")
                        .description("Application-specific error code")
                        .example("INVALID_ORDER"))
                .addProperty("errors", new Schema<>().type("array")
                        .description("List of validation errors (for validation failures)")
                        .items(new Schema<>().type("string")));
    }

    /**
     * Grouped API for Catalog context.
     */
    @Bean
    public GroupedOpenApi catalogApi() {
        return GroupedOpenApi.builder()
                .group("catalog")
                .displayName("Product Catalog API")
                .pathsToMatch("/api/v1/products/**")
                .build();
    }

    /**
     * Grouped API for Order context.
     */
    @Bean
    public GroupedOpenApi orderApi() {
        return GroupedOpenApi.builder()
                .group("orders")
                .displayName("Order Management API")
                .pathsToMatch("/api/v1/orders/**")
                .build();
    }

    /**
     * Full API including all endpoints.
     */
    @Bean
    public GroupedOpenApi fullApi() {
        return GroupedOpenApi.builder()
                .group("all")
                .displayName("Full API")
                .pathsToMatch("/api/v1/**")
                .build();
    }
}
