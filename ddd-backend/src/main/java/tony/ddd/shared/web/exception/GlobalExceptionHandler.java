package tony.ddd.shared.web.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tony.ddd.catalog.domain.exception.ProductNotFoundException;
import tony.ddd.order.domain.exception.OrderNotFoundException;
import tony.ddd.shared.domain.DomainException;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Global exception handler for REST API.
 * Converts exceptions to RFC 7807 Problem Details format.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles validation errors from request body validation.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationException(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());

        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problemDetail.setTitle("Validation Failed");
        problemDetail.setDetail("Request validation failed with " + errors.size() + " error(s)");
        problemDetail.setType(URI.create("https://api.example.com/errors/validation"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("errors", errors);

        return problemDetail;
    }

    /**
     * Handles order not found exceptions.
     */
    @ExceptionHandler(OrderNotFoundException.class)
    public ProblemDetail handleOrderNotFoundException(OrderNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problemDetail.setTitle("Order Not Found");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setType(URI.create("https://api.example.com/errors/order-not-found"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("errorCode", ex.getErrorCode());

        return problemDetail;
    }

    /**
     * Handles product not found exceptions.
     */
    @ExceptionHandler(ProductNotFoundException.class)
    public ProblemDetail handleProductNotFoundException(ProductNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problemDetail.setTitle("Product Not Found");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setType(URI.create("https://api.example.com/errors/product-not-found"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("errorCode", ex.getErrorCode());

        return problemDetail;
    }

    /**
     * Handles domain exceptions (business rule violations).
     */
    @ExceptionHandler(DomainException.class)
    public ProblemDetail handleDomainException(DomainException ex) {
        log.warn("Domain exception: {} - {}", ex.getErrorCode(), ex.getMessage());

        HttpStatus status = determineHttpStatus(ex.getErrorCode());
        
        ProblemDetail problemDetail = ProblemDetail.forStatus(status);
        problemDetail.setTitle("Business Rule Violation");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setType(URI.create("https://api.example.com/errors/domain/" + 
            ex.getErrorCode().toLowerCase().replace("_", "-")));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("errorCode", ex.getErrorCode());

        return problemDetail;
    }

    /**
     * Handles unexpected exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);

        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setDetail("An unexpected error occurred. Please try again later.");
        problemDetail.setType(URI.create("https://api.example.com/errors/internal"));
        problemDetail.setProperty("timestamp", Instant.now());

        return problemDetail;
    }

    /**
     * Determines HTTP status based on error code.
     */
    private HttpStatus determineHttpStatus(String errorCode) {
        return switch (errorCode) {
            case "INVALID_ORDER", "INVALID_ORDER_ITEM", "INVALID_ADDRESS", 
                 "INVALID_MONEY", "INVALID_QUANTITY", "ORDER_BELOW_MINIMUM",
                 "INVALID_CANCELLATION", "INVALID_STATUS_TRANSITION",
                 "INVALID_PRODUCT" -> HttpStatus.BAD_REQUEST;
            case "ORDER_NOT_FOUND", "ITEM_NOT_FOUND", "PRODUCT_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "ORDER_NOT_MODIFIABLE", "PRODUCT_NOT_MODIFIABLE" -> HttpStatus.CONFLICT;
            case "PRODUCT_NOT_AVAILABLE" -> HttpStatus.UNPROCESSABLE_ENTITY;
            default -> HttpStatus.UNPROCESSABLE_ENTITY;
        };
    }
}
