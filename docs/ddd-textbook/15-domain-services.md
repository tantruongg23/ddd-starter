# Chapter 15: Domain Services

> *"When a significant process or transformation in the domain is not a natural responsibility of an Entity or Value Object, add an operation to the model as a standalone interface declared as a Service."*
> — Eric Evans

---

## What is a Domain Service?

A **Domain Service** is a stateless operation that performs domain logic that doesn't naturally belong to any Entity or Value Object. It represents a significant business concept or process in your domain.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOMAIN SERVICE CONCEPT                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Use a Domain Service when:                                        │
│                                                                      │
│   1. Operation involves MULTIPLE aggregates                         │
│      • Transfer money between accounts                              │
│      • Calculate shipping for order + inventory                     │
│                                                                      │
│   2. Operation is a significant DOMAIN CONCEPT                      │
│      • PricingService (pricing is a concept, not an entity)        │
│      • TaxCalculator (tax calculation is a domain concern)          │
│                                                                      │
│   3. Operation doesn't fit naturally in an Entity                   │
│      • "Which account should withdraw?" (neither account)           │
│      • "Who calculates if order fits policy?" (neither)            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## When to Use Domain Services

### Decision Framework

```
┌─────────────────────────────────────────────────────────────────────┐
│           SHOULD THIS BE A DOMAIN SERVICE?                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Does this operation:                                              │
│                                                                      │
│   1. Involve multiple aggregates?                                   │
│      │                                                               │
│      ├─ YES → Consider Domain Service                               │
│      │                                                               │
│      └─ NO → Could still be Domain Service (check #2)              │
│                                                                      │
│   2. Represent a domain concept that's not a "thing"?              │
│      │                                                               │
│      ├─ YES → Domain Service (PricingPolicy, ShippingCalculator)   │
│      │                                                               │
│      └─ NO → Probably belongs in an Entity                         │
│                                                                      │
│   3. Feel awkward when placed in an Entity?                        │
│      │                                                               │
│      ├─ YES → Domain Service                                        │
│      │                                                               │
│      └─ NO → Keep in Entity                                        │
│                                                                      │
│   WARNING: Don't overuse Domain Services!                           │
│   If everything is a service, you have an anemic model.            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Examples: Service vs Entity

```java
// ❌ WRONG: Operation belongs in Entity
public class AccountService {
    public void deposit(Account account, Money amount) {
        // This belongs IN the Account entity!
        account.setBalance(account.getBalance().add(amount));
    }
}

// ✅ RIGHT: Operation in Entity
public class Account {
    public void deposit(Money amount) {
        ensureActive();
        this.balance = this.balance.add(amount);
        raise(new FundsDepositedEvent(this.id, amount));
    }
}

// ✅ RIGHT: Operation involves multiple aggregates → Service
public class TransferService {
    public void transfer(Account source, Account destination, Money amount) {
        // Neither account should "own" this operation
        source.withdraw(amount);
        destination.deposit(amount);
    }
}

// ✅ RIGHT: Operation is a domain concept → Service
public class PricingService {
    public Money calculatePrice(Product product, Customer customer, Quantity qty) {
        // Pricing is a CONCEPT, not an entity
        // Involves product, customer, promotions, market conditions
    }
}
```

---

## Implementing Domain Services

### Basic Domain Service

```java
// Domain Service interface (in domain layer)
public interface PricingService {
    
    /**
     * Calculate the price for a product considering customer context.
     */
    Money calculatePrice(Product product, Customer customer, Quantity quantity);
    
    /**
     * Calculate discounted price with a promotion.
     */
    Money calculatePriceWithPromotion(Product product, Customer customer, 
                                      Quantity quantity, Promotion promotion);
}

// Implementation (in domain layer)
public class DefaultPricingService implements PricingService {
    
    private final PricingRules pricingRules;
    private final DiscountCalculator discountCalculator;
    
    @Override
    public Money calculatePrice(Product product, Customer customer, Quantity quantity) {
        Money basePrice = product.getBasePrice();
        Money volumePrice = applyVolumeDiscount(basePrice, quantity);
        Money customerPrice = applyCustomerDiscount(volumePrice, customer);
        
        return customerPrice.multiply(quantity.getValue());
    }
    
    @Override
    public Money calculatePriceWithPromotion(Product product, Customer customer,
                                            Quantity quantity, Promotion promotion) {
        Money price = calculatePrice(product, customer, quantity);
        
        if (promotion.isApplicableTo(product, customer)) {
            return discountCalculator.apply(price, promotion);
        }
        
        return price;
    }
    
    private Money applyVolumeDiscount(Money basePrice, Quantity quantity) {
        Percentage discount = pricingRules.getVolumeDiscount(quantity);
        return basePrice.subtract(basePrice.percentage(discount));
    }
    
    private Money applyCustomerDiscount(Money price, Customer customer) {
        Percentage discount = pricingRules.getCustomerTierDiscount(customer.getTier());
        return price.subtract(price.percentage(discount));
    }
}
```

### Cross-Aggregate Service

```java
// Transfer between accounts (involves two aggregates)
public interface MoneyTransferService {
    TransferResult transfer(AccountId sourceId, AccountId destinationId, Money amount);
}

public class DefaultMoneyTransferService implements MoneyTransferService {
    
    private final AccountRepository accountRepository;
    private final TransferPolicy transferPolicy;
    
    @Override
    public TransferResult transfer(AccountId sourceId, AccountId destinationId, Money amount) {
        Account source = accountRepository.findById(sourceId)
            .orElseThrow(() -> new AccountNotFoundException(sourceId));
        
        Account destination = accountRepository.findById(destinationId)
            .orElseThrow(() -> new AccountNotFoundException(destinationId));
        
        // Validate transfer according to domain rules
        transferPolicy.validate(source, destination, amount);
        
        // Execute transfer (domain logic)
        source.withdraw(amount);
        destination.deposit(amount);
        
        // Note: Saving should happen in application service/transaction
        // Domain service focuses on the domain logic
        
        return TransferResult.successful(source.getId(), destination.getId(), amount);
    }
}

// Transfer policy encapsulates business rules
public class TransferPolicy {
    
    public void validate(Account source, Account destination, Money amount) {
        // Same currency required
        if (!source.getCurrency().equals(destination.getCurrency())) {
            throw new CurrencyMismatchException(source.getCurrency(), destination.getCurrency());
        }
        
        // Cannot transfer to same account
        if (source.getId().equals(destination.getId())) {
            throw new SameAccountTransferException(source.getId());
        }
        
        // Source must have sufficient funds
        if (source.getBalance().isLessThan(amount)) {
            throw new InsufficientFundsException(source.getId(), source.getBalance(), amount);
        }
        
        // Check transfer limits
        if (amount.isGreaterThan(source.getTransferLimit())) {
            throw new TransferLimitExceededException(source.getId(), source.getTransferLimit());
        }
    }
}
```

### Domain Service with External Dependencies

```java
// Shipping cost calculation requires external data
public interface ShippingCostCalculator {
    ShippingQuote calculateShipping(Order order, ShippingMethod method);
}

public class DefaultShippingCostCalculator implements ShippingCostCalculator {
    
    private final ShippingRateProvider rateProvider;  // External rates
    private final DistanceCalculator distanceCalculator;
    
    @Override
    public ShippingQuote calculateShipping(Order order, ShippingMethod method) {
        // Get weight from order items
        Weight totalWeight = order.calculateTotalWeight();
        
        // Get shipping zone based on address
        ShippingZone zone = determineZone(order.getShippingAddress());
        
        // Get rate from provider
        ShippingRate rate = rateProvider.getRate(method, zone, totalWeight);
        
        // Apply any order-based adjustments
        Money baseCost = rate.calculateCost(totalWeight);
        Money adjustedCost = applyOrderAdjustments(baseCost, order);
        
        // Estimate delivery
        DateRange deliveryEstimate = estimateDelivery(zone, method);
        
        return new ShippingQuote(method, adjustedCost, deliveryEstimate);
    }
    
    private ShippingZone determineZone(ShippingAddress address) {
        // Domain logic for zone determination
        return ShippingZone.fromCountryAndRegion(
            address.getCountry(), 
            address.getRegion()
        );
    }
    
    private Money applyOrderAdjustments(Money baseCost, Order order) {
        // Free shipping for orders over threshold
        if (order.getSubtotal().isGreaterThan(Money.of(100, "USD"))) {
            return Money.ZERO;
        }
        return baseCost;
    }
}
```

---

## Domain Service vs Application Service

```
┌─────────────────────────────────────────────────────────────────────┐
│           DOMAIN SERVICE vs APPLICATION SERVICE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   DOMAIN SERVICE                     APPLICATION SERVICE            │
│   ──────────────                     ───────────────────            │
│                                                                      │
│   • Contains domain logic            • Orchestrates workflow        │
│   • Uses domain language             • Handles transactions         │
│   • Part of the domain model         • Coordinates services         │
│   • No infrastructure concerns       • Calls repositories           │
│   • Stateless domain operations      • Publishes events             │
│                                                                      │
│   EXAMPLES:                          EXAMPLES:                      │
│   • PricingService                   • OrderApplicationService      │
│   • TransferService                  • UserRegistrationService      │
│   • ShippingCalculator               • PaymentProcessingService     │
│   • TaxCalculator                    • ReportGenerationService      │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                              │   │
│   │  Application Service:                                        │   │
│   │  ┌────────────────────────────────────────────────────────┐ │   │
│   │  │  @Transactional                                        │ │   │
│   │  │  public void placeOrder(PlaceOrderCommand cmd) {       │ │   │
│   │  │      Order order = orderRepository.findById(cmd.id()); │ │   │
│   │  │                                                        │ │   │
│   │  │      // CALLS domain service                           │ │   │
│   │  │      Money price = pricingService.calculate(...);      │ │   │
│   │  │                                                        │ │   │
│   │  │      order.place(price);                               │ │   │
│   │  │      orderRepository.save(order);                      │ │   │
│   │  │      eventPublisher.publish(order.getEvents());        │ │   │
│   │  │  }                                                     │ │   │
│   │  └────────────────────────────────────────────────────────┘ │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Characteristics of Good Domain Services

```
┌─────────────────────────────────────────────────────────────────────┐
│           DOMAIN SERVICE CHARACTERISTICS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ✓ STATELESS                                                       │
│     • No instance variables that change                             │
│     • All state comes from parameters                               │
│     • Can be safely shared/reused                                   │
│                                                                      │
│   ✓ NAMED AS VERBS OR DOMAIN CONCEPTS                              │
│     • PricingService, TransferService, ShippingCalculator          │
│     • Not: PricingHelper, TransferUtility, ShippingManager         │
│                                                                      │
│   ✓ DEFINED IN TERMS OF DOMAIN MODEL                               │
│     • Uses Entities, Value Objects as parameters                    │
│     • Returns domain objects                                        │
│     • No DTOs, no infrastructure types                              │
│                                                                      │
│   ✓ INTERFACE IN DOMAIN LAYER                                      │
│     • May have implementation in domain layer too                   │
│     • Or implementation in infrastructure if external deps          │
│                                                                      │
│   ✗ NOT A DUMPING GROUND                                           │
│     • If it belongs in an Entity, put it there!                    │
│     • Domain Services should be relatively rare                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Domain Services are stateless** - All state comes from parameters

2. **Use for operations spanning multiple aggregates** - Or significant domain concepts

3. **Named in domain language** - Part of Ubiquitous Language

4. **Not a replacement for rich entities** - Avoid anemic model

5. **Interface in domain layer** - Implementation may vary

6. **Different from Application Services** - Domain logic vs orchestration

---

## What's Next?

In [Chapter 16: Application Services](./16-application-services.md), we'll explore the outer layer that orchestrates domain operations and handles infrastructure concerns.

---

**[← Previous: Repositories](./14-repositories.md)** | **[Back to Table of Contents](./README.md)** | **[Next: Application Services →](./16-application-services.md)**
