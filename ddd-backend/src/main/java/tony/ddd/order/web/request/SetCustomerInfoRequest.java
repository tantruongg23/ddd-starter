package tony.ddd.order.web.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import tony.ddd.order.application.command.SetCustomerInfoCommand;

/**
 * Request object for setting customer information on an Order.
 */
@Schema(description = "Request to set customer contact information on an order")
public record SetCustomerInfoRequest(
    @Schema(
        description = "Customer full name",
        example = "John Doe",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Customer name is required")
    String name,

    @Schema(
        description = "Customer email address",
        example = "john.doe@example.com",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    String email,

    @Schema(
        description = "Customer phone number",
        example = "+1-555-123-4567"
    )
    String phone
) {

    /**
     * Converts this request to an application command.
     */
    public SetCustomerInfoCommand toCommand(String orderId) {
        return new SetCustomerInfoCommand(orderId, name, email, phone);
    }
}
