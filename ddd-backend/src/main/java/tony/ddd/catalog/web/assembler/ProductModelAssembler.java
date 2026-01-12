package tony.ddd.catalog.web.assembler;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;
import tony.ddd.catalog.application.dto.ProductDto;
import tony.ddd.catalog.domain.model.ProductStatus;
import tony.ddd.catalog.web.controller.ProductController;
import tony.ddd.catalog.web.response.ProductResponse;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

/**
 * Assembler that converts ProductDto to ProductResponse with HATEOAS links.
 */
@Component
public class ProductModelAssembler implements RepresentationModelAssembler<ProductDto, ProductResponse> {

    @Override
    public ProductResponse toModel(ProductDto dto) {
        ProductResponse response = ProductResponse.fromDto(dto);

        // Self link
        response.add(linkTo(methodOn(ProductController.class).getProduct(dto.id())).withSelfRel());

        // Collection link
        response.add(linkTo(methodOn(ProductController.class).getAllProducts()).withRel("products"));

        // Status-based action links
        addStatusBasedLinks(response, dto);

        return response;
    }

    @Override
    public CollectionModel<ProductResponse> toCollectionModel(Iterable<? extends ProductDto> entities) {
        List<ProductResponse> responses = StreamSupport.stream(entities.spliterator(), false)
            .map(this::toModel)
            .collect(Collectors.toList());

        return CollectionModel.of(responses,
            linkTo(methodOn(ProductController.class).getAllProducts()).withSelfRel(),
            linkTo(methodOn(ProductController.class).createProduct(null)).withRel("create"));
    }

    private void addStatusBasedLinks(ProductResponse response, ProductDto dto) {
        switch (dto.status()) {
            case DRAFT -> {
                response.add(linkTo(methodOn(ProductController.class)
                    .updateProduct(dto.id(), null)).withRel("update"));
                response.add(linkTo(methodOn(ProductController.class)
                    .updatePrice(dto.id(), null)).withRel("update-price"));
                response.add(linkTo(methodOn(ProductController.class)
                    .activateProduct(dto.id())).withRel("activate"));
            }
            case ACTIVE -> {
                response.add(linkTo(methodOn(ProductController.class)
                    .updatePrice(dto.id(), null)).withRel("update-price"));
                response.add(linkTo(methodOn(ProductController.class)
                    .deactivateProduct(dto.id())).withRel("deactivate"));
            }
            case INACTIVE -> {
                response.add(linkTo(methodOn(ProductController.class)
                    .updatePrice(dto.id(), null)).withRel("update-price"));
                response.add(linkTo(methodOn(ProductController.class)
                    .activateProduct(dto.id())).withRel("activate"));
            }
        }
    }
}
