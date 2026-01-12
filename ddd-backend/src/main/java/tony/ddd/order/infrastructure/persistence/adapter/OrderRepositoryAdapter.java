package tony.ddd.order.infrastructure.persistence.adapter;

import org.springframework.stereotype.Component;
import tony.ddd.order.domain.model.CustomerId;
import tony.ddd.order.domain.model.Order;
import tony.ddd.order.domain.model.OrderId;
import tony.ddd.order.domain.model.OrderStatus;
import tony.ddd.order.domain.repository.OrderRepository;
import tony.ddd.order.infrastructure.persistence.entity.OrderJpaEntity;
import tony.ddd.order.infrastructure.persistence.entity.OrderStatusJpa;
import tony.ddd.order.infrastructure.persistence.mapper.OrderPersistenceMapper;
import tony.ddd.order.infrastructure.persistence.repository.SpringDataOrderRepository;

import java.util.List;
import java.util.Optional;

/**
 * Adapter implementing the domain OrderRepository interface.
 * This is the infrastructure implementation of the domain's port.
 * Follows the Adapter pattern from hexagonal architecture.
 */
@Component
public class OrderRepositoryAdapter implements OrderRepository {

    private final SpringDataOrderRepository springDataRepository;
    private final OrderPersistenceMapper mapper;

    public OrderRepositoryAdapter(SpringDataOrderRepository springDataRepository,
                                   OrderPersistenceMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    public Order save(Order order) {
        OrderJpaEntity entity = mapper.toJpaEntity(order);
        OrderJpaEntity savedEntity = springDataRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return springDataRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }

    @Override
    public List<Order> findByCustomerId(CustomerId customerId) {
        return springDataRepository.findByCustomerId(customerId.getValue())
            .stream()
            .map(mapper::toDomain)
            .toList();
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        return springDataRepository.findByStatus(OrderStatusJpa.fromDomain(status))
            .stream()
            .map(mapper::toDomain)
            .toList();
    }

    @Override
    public List<Order> findAll() {
        return springDataRepository.findAll()
            .stream()
            .map(mapper::toDomain)
            .toList();
    }

    @Override
    public void deleteById(OrderId id) {
        springDataRepository.deleteById(id.getValue());
    }

    @Override
    public boolean existsById(OrderId id) {
        return springDataRepository.existsById(id.getValue());
    }
}
