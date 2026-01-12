package tony.ddd.catalog.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tony.ddd.catalog.domain.model.ProductStatus;
import tony.ddd.catalog.infrastructure.persistence.entity.ProductJpaEntity;

import java.util.List;

/**
 * Spring Data JPA repository for Product entities.
 */
@Repository
public interface SpringDataProductRepository extends JpaRepository<ProductJpaEntity, String> {

    List<ProductJpaEntity> findByStatus(ProductStatus status);

    boolean existsBySku(String sku);
}
