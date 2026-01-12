package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.DomainException;
import tony.ddd.shared.domain.ValueObject;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Value Object representing customer contact information for an order.
 * Contains name, email, and phone.
 */
public final class CustomerInfo implements ValueObject {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
    );
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^\\+?[0-9\\-\\s()]{7,20}$"
    );

    private final String name;
    private final String email;
    private final String phone;

    private CustomerInfo(String name, String email, String phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        validate();
    }

    /**
     * Creates a new CustomerInfo with the provided details.
     */
    public static CustomerInfo of(String name, String email, String phone) {
        return new CustomerInfo(name, email, phone);
    }

    @Override
    public void validate() {
        if (name == null || name.isBlank()) {
            throw new DomainException("INVALID_CUSTOMER_INFO", "Customer name is required");
        }
        if (name.length() < 2 || name.length() > 100) {
            throw new DomainException("INVALID_CUSTOMER_INFO", 
                "Customer name must be between 2 and 100 characters");
        }
        if (email == null || email.isBlank()) {
            throw new DomainException("INVALID_CUSTOMER_INFO", "Customer email is required");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new DomainException("INVALID_CUSTOMER_INFO", "Invalid email format: " + email);
        }
        if (phone != null && !phone.isBlank() && !PHONE_PATTERN.matcher(phone).matches()) {
            throw new DomainException("INVALID_CUSTOMER_INFO", "Invalid phone format: " + phone);
        }
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    /**
     * Returns a new CustomerInfo with the updated name.
     */
    public CustomerInfo withName(String newName) {
        return new CustomerInfo(newName, this.email, this.phone);
    }

    /**
     * Returns a new CustomerInfo with the updated email.
     */
    public CustomerInfo withEmail(String newEmail) {
        return new CustomerInfo(this.name, newEmail, this.phone);
    }

    /**
     * Returns a new CustomerInfo with the updated phone.
     */
    public CustomerInfo withPhone(String newPhone) {
        return new CustomerInfo(this.name, this.email, newPhone);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomerInfo that = (CustomerInfo) o;
        return Objects.equals(name, that.name) && 
               Objects.equals(email, that.email) && 
               Objects.equals(phone, that.phone);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, email, phone);
    }

    @Override
    public String toString() {
        return String.format("CustomerInfo{name='%s', email='%s', phone='%s'}", name, email, phone);
    }
}
