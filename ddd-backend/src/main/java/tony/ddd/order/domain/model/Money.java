package tony.ddd.order.domain.model;

import tony.ddd.shared.domain.DomainException;
import tony.ddd.shared.domain.ValueObject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;

/**
 * Value Object representing monetary values.
 * Immutable and ensures proper handling of currency and precision.
 */
public record Money(BigDecimal amount, Currency currency) implements ValueObject {

    public static final Currency DEFAULT_CURRENCY = Currency.getInstance("USD");
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    public Money {
        if (amount == null) {
            throw new DomainException("INVALID_MONEY", "Amount cannot be null");
        }
        if (currency == null) {
            throw new DomainException("INVALID_MONEY", "Currency cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new DomainException("INVALID_MONEY", "Amount cannot be negative");
        }
        amount = amount.setScale(SCALE, ROUNDING_MODE);
    }

    /**
     * Creates a Money instance with the default currency (USD).
     */
    public static Money of(BigDecimal amount) {
        return new Money(amount, DEFAULT_CURRENCY);
    }

    /**
     * Creates a Money instance with the specified currency.
     */
    public static Money of(BigDecimal amount, Currency currency) {
        return new Money(amount, currency);
    }

    /**
     * Creates a Money instance from a double value with default currency.
     */
    public static Money of(double amount) {
        return new Money(BigDecimal.valueOf(amount), DEFAULT_CURRENCY);
    }

    /**
     * Creates a zero Money instance with default currency.
     */
    public static Money zero() {
        return new Money(BigDecimal.ZERO, DEFAULT_CURRENCY);
    }

    /**
     * Adds this money to another money value.
     */
    public Money add(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    /**
     * Subtracts another money value from this money.
     */
    public Money subtract(Money other) {
        validateSameCurrency(other);
        BigDecimal result = this.amount.subtract(other.amount);
        if (result.compareTo(BigDecimal.ZERO) < 0) {
            throw new DomainException("INVALID_MONEY", "Subtraction would result in negative amount");
        }
        return new Money(result, this.currency);
    }

    /**
     * Multiplies this money by a quantity.
     */
    public Money multiply(int quantity) {
        if (quantity < 0) {
            throw new DomainException("INVALID_MONEY", "Quantity cannot be negative");
        }
        return new Money(this.amount.multiply(BigDecimal.valueOf(quantity)), this.currency);
    }

    /**
     * Checks if this money is greater than another.
     */
    public boolean isGreaterThan(Money other) {
        validateSameCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }

    /**
     * Checks if this money is less than another.
     */
    public boolean isLessThan(Money other) {
        validateSameCurrency(other);
        return this.amount.compareTo(other.amount) < 0;
    }

    /**
     * Checks if this money is zero.
     */
    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO) == 0;
    }

    private void validateSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new DomainException("CURRENCY_MISMATCH", 
                "Cannot operate on different currencies: " + this.currency + " and " + other.currency);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return amount.compareTo(money.amount) == 0 && Objects.equals(currency, money.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount.stripTrailingZeros(), currency);
    }

    @Override
    public String toString() {
        return currency.getSymbol() + amount.toPlainString();
    }
}
