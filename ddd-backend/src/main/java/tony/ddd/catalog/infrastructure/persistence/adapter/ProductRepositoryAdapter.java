package tony.ddd.catalog.infrastructure.persistence.adapter;

import org.springframework.stereotype.Component;
import tony.ddd.catalog.domain.model.Product;
import tony.ddd.catalog.domain.model.ProductId;
import tony.ddd.catalog.domain.model.ProductStatus;
import tony.ddd.catalog.domain.repository.ProductRepository;
import tony.ddd.catalog.infrastructure.persistence.entity.ProductJpaEntity;
import tony.ddd.catalog.infrastructure.persistence.mapper.ProductPersistenceMapper;
import tony.ddd.catalog.infrastructure.persistence.repository.SpringDataProductRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter implementing ProductRepository using Spring Data JPA.
 */
@Component
public class ProductRepositoryAdapter implements ProductRepository {

    private final SpringDataProductRepository jpaRepository;
    private final ProductPersistenceMapper mapper;

    public ProductRepositoryAdapter(SpringDataProductRepository jpaRepository,
                                    ProductPersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Product save(Product product) {
        ProductJpaEntity entity = mapper.toJpaEntity(product);
        ProductJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomainEntity(savedEntity);
    }

    @Override
    public Optional<Product> findById(ProductId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomainEntity);
    }

    @Override
    public List<Product> findAll() {
        return jpaRepository.findAll().stream()
            .map(mapper::toDomainEntity)
            .collect(Collectors.toList());
    }

    @Override
    public List<Product> findByStatus(ProductStatus status) {
        return jpaRepository.findByStatus(status).stream()
            .map(mapper::toDomainEntity)
            .collect(Collectors.toList());
    }

    @Override
    public boolean existsById(ProductId id) {
        return jpaRepository.existsById(id.getValue());
    }

    @Override
    public boolean existsBySku(String sku) {
        return jpaRepository.existsBySku(sku);
    }

    @Override
    public void deleteById(ProductId id) {
        jpaRepository.deleteById(id.getValue());
    }
}
