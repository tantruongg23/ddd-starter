package tony.ddd.order.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tony.ddd.order.infrastructure.persistence.entity.OrderJpaEntity;
import tony.ddd.order.infrastructure.persistence.entity.OrderStatusJpa;

import java.util.List;

/**
 * Spring Data JPA Repository for OrderJpaEntity.
 * This is an infrastructure detail - not exposed to the domain.
 */
@Repository
public interface SpringDataOrderRepository extends JpaRepository<OrderJpaEntity, String> {

    /**
     * Finds all orders for a customer.
     */
    List<OrderJpaEntity> findByCustomerId(String customerId);

    /**
     * Finds all orders with a specific status.
     */
    List<OrderJpaEntity> findByStatus(OrderStatusJpa status);

    /**
     * Finds orders by customer and status.
     */
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customerId = :customerId AND o.status = :status")
    List<OrderJpaEntity> findByCustomerIdAndStatus(
        @Param("customerId") String customerId,
        @Param("status") OrderStatusJpa status
    );
}
