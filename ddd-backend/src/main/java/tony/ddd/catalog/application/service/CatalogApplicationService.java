package tony.ddd.catalog.application.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tony.ddd.catalog.application.command.ActivateProductCommand;
import tony.ddd.catalog.application.command.CreateProductCommand;
import tony.ddd.catalog.application.command.DeactivateProductCommand;
import tony.ddd.catalog.application.command.UpdatePriceCommand;
import tony.ddd.catalog.application.command.UpdateProductCommand;
import tony.ddd.catalog.application.dto.ProductDto;
import tony.ddd.catalog.application.port.in.ProductUseCase;
import tony.ddd.catalog.application.query.GetProductQuery;
import tony.ddd.catalog.application.query.ListProductsQuery;
import tony.ddd.catalog.domain.exception.ProductNotFoundException;
import tony.ddd.catalog.domain.model.Product;
import tony.ddd.catalog.domain.model.ProductId;
import tony.ddd.catalog.domain.repository.ProductRepository;
import tony.ddd.order.domain.model.Money;
import tony.ddd.shared.infrastructure.DomainEventPublisher;

import java.util.Currency;
import java.util.List;
import java.util.Optional;

/**
 * Application service implementing Product use cases.
 * Orchestrates domain operations and handles transactions.
 * This is the transaction boundary.
 */
@Service
@Transactional
public class CatalogApplicationService implements ProductUseCase {

    private final ProductRepository productRepository;
    private final DomainEventPublisher eventPublisher;

    public CatalogApplicationService(ProductRepository productRepository,
                                     DomainEventPublisher eventPublisher) {
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
    }

    // Command operations

    @Override
    public ProductDto createProduct(CreateProductCommand command) {
        ProductId productId = ProductId.generate();
        Money productPrice = Money.of(command.price(), Currency.getInstance(command.currency()));
        
        Product product = Product.create(
            productId, 
            command.name(), 
            command.description(), 
            productPrice, 
            command.sku()
        );
        
        Product savedProduct = productRepository.save(product);
        eventPublisher.publishEventsFrom(savedProduct);
        
        return ProductDto.fromDomain(savedProduct);
    }

    @Override
    public ProductDto updateProduct(UpdateProductCommand command) {
        Product product = findProductOrThrow(command.productId());
        
        product.updateInfo(command.name(), command.description());
        
        Product savedProduct = productRepository.save(product);
        eventPublisher.publishEventsFrom(savedProduct);
        
        return ProductDto.fromDomain(savedProduct);
    }

    @Override
    public ProductDto updatePrice(UpdatePriceCommand command) {
        Product product = findProductOrThrow(command.productId());
        Money newPrice = Money.of(command.price(), Currency.getInstance(command.currency()));
        
        product.updatePrice(newPrice);
        
        Product savedProduct = productRepository.save(product);
        eventPublisher.publishEventsFrom(savedProduct);
        
        return ProductDto.fromDomain(savedProduct);
    }

    @Override
    public ProductDto activateProduct(ActivateProductCommand command) {
        Product product = findProductOrThrow(command.productId());
        
        product.activate();
        
        Product savedProduct = productRepository.save(product);
        eventPublisher.publishEventsFrom(savedProduct);
        
        return ProductDto.fromDomain(savedProduct);
    }

    @Override
    public ProductDto deactivateProduct(DeactivateProductCommand command) {
        Product product = findProductOrThrow(command.productId());
        
        product.deactivate();
        
        Product savedProduct = productRepository.save(product);
        eventPublisher.publishEventsFrom(savedProduct);
        
        return ProductDto.fromDomain(savedProduct);
    }

    // Query operations

    @Override
    @Transactional(readOnly = true)
    public ProductDto getProduct(GetProductQuery query) {
        Product product = findProductOrThrow(query.productId());
        return ProductDto.fromDomain(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductDto> findProduct(GetProductQuery query) {
        return productRepository.findById(ProductId.of(query.productId()))
            .map(ProductDto::fromDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> listProducts(ListProductsQuery query) {
        if (query.hasStatusFilter()) {
            return productRepository.findByStatus(query.status()).stream()
                .map(ProductDto::fromDomain)
                .toList();
        }
        return getAllProducts();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
            .map(ProductDto::fromDomain)
            .toList();
    }

    // Helper methods

    private Product findProductOrThrow(String productId) {
        return productRepository.findById(ProductId.of(productId))
            .orElseThrow(() -> new ProductNotFoundException(productId));
    }
}
