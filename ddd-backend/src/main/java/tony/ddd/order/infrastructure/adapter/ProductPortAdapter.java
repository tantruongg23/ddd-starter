package tony.ddd.order.infrastructure.adapter;

import org.springframework.stereotype.Component;
import tony.ddd.catalog.application.dto.ProductDto;
import tony.ddd.catalog.application.port.in.ProductUseCase;
import tony.ddd.catalog.application.query.GetProductQuery;
import tony.ddd.order.application.port.out.ProductPort;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Adapter implementing ProductPort by calling Catalog's ProductUseCase.
 * This bridges the Order context with the Catalog context.
 */
@Component
public class ProductPortAdapter implements ProductPort {

    private final ProductUseCase productUseCase;

    public ProductPortAdapter(ProductUseCase productUseCase) {
        this.productUseCase = productUseCase;
    }

    @Override
    public Optional<ProductInfo> findProduct(String productId) {
        GetProductQuery query = new GetProductQuery(productId);
        return productUseCase.findProduct(query)
            .map(this::toProductInfo);
    }

    @Override
    public boolean isProductAvailable(String productId) {
        GetProductQuery query = new GetProductQuery(productId);
        return productUseCase.findProduct(query)
            .map(dto -> dto.status().isAvailableForPurchase())
            .orElse(false);
    }

    @Override
    public Optional<BigDecimal> getProductPrice(String productId) {
        GetProductQuery query = new GetProductQuery(productId);
        return productUseCase.findProduct(query)
            .map(ProductDto::price);
    }

    private ProductInfo toProductInfo(ProductDto dto) {
        return new ProductInfo(
            dto.id(),
            dto.name(),
            dto.price(),
            dto.currency(),
            dto.status().isAvailableForPurchase()
        );
    }
}
