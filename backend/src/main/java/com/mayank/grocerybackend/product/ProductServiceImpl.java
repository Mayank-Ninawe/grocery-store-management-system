package com.mayank.grocerybackend.product;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repository;

    private ProductResponse map(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .price(p.getPrice())
                .unit(p.getUnit())
                .stockQuantity(p.getStockQuantity())
                .minStockLevel(p.getMinStockLevel())
                .build();
    }

    @Override
    public ProductResponse create(ProductRequest request) {
        Product p = Product.builder()
                .name(request.getName())
                .category(request.getCategory())
                .price(request.getPrice())
                .unit(request.getUnit())
                .stockQuantity(request.getStockQuantity())
                .minStockLevel(request.getMinStockLevel())
                .build();
        return map(repository.save(p));
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        Product p = repository.findById(id).orElseThrow();
        p.setName(request.getName());
        p.setCategory(request.getCategory());
        p.setPrice(request.getPrice());
        p.setUnit(request.getUnit());
        p.setStockQuantity(request.getStockQuantity());
        p.setMinStockLevel(request.getMinStockLevel());
        return map(repository.save(p));
    }

    @Override
    public ProductResponse getById(Long id) {
        return map(repository.findById(id).orElseThrow());
    }

    @Override
    public List<ProductResponse> getAll() {
        return repository.findAll().stream().map(this::map).toList();
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
