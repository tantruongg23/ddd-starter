package tony.ddd.catalog.infrastructure.persistence.mapper;

import org.springframework.stereotype.Component;
import tony.ddd.catalog.domain.model.Product;
import tony.ddd.catalog.domain.model.ProductId;
import tony.ddd.catalog.infrastructure.persistence.entity.ProductJpaEntity;
import tony.ddd.order.domain.model.Money;

import java.util.Currency;

/**
 * Mapper between Product domain model and JPA entity.
 */
@Component
public class ProductPersistenceMapper {

    /**
     * Converts a Product domain entity to JPA entity.
     */
    public ProductJpaEntity toJpaEntity(Product product) {
        ProductJpaEntity entity = new ProductJpaEntity();
        entity.setId(product.getId().getValue());
        entity.setName(product.getName());
        entity.setDescription(product.getDescription());
        entity.setPrice(product.getPrice().amount());
        entity.setCurrency(product.getPrice().currency().getCurrencyCode());
        entity.setSku(product.getSku());
        entity.setStatus(product.getStatus());
        return entity;
    }

    /**
     * Converts a JPA entity to Product domain entity.
     * Uses reconstitute to avoid triggering domain events.
     */
    public Product toDomainEntity(ProductJpaEntity entity) {
        Money price = Money.of(entity.getPrice(), Currency.getInstance(entity.getCurrency()));
        return Product.reconstitute(
            ProductId.of(entity.getId()),
            entity.getName(),
            entity.getDescription(),
            price,
            entity.getSku(),
            entity.getStatus()
        );
    }
}
