package com.mayank.grocerybackend.inventory;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mayank.grocerybackend.product.Product;
import com.mayank.grocerybackend.product.ProductRepository;
import com.mayank.grocerybackend.product.ProductResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;

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
    public List<ProductResponse> getAllInventory() {
        return productRepository.findAll().stream().map(this::map).toList();
    }

    @Override
    public List<ProductResponse> getLowStockItems() {
        return productRepository.findAll()
                .stream()
                .filter(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0)
                        <= (p.getMinStockLevel() != null ? p.getMinStockLevel() : 0))
                .map(this::map)
                .toList();
    }

    @Override
    public InventorySummaryResponse getSummary() {
        List<Product> products = productRepository.findAll();

        long totalProducts = products.size();
        long lowStockItems = products.stream()
                .filter(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0)
                        <= (p.getMinStockLevel() != null ? p.getMinStockLevel() : 0))
                .count();

        long outOfStockItems = products.stream()
                .filter(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0) == 0)
                .count();

        double totalStockValue = products.stream()
                .mapToDouble(p -> {
                    double price = p.getPrice() != null ? p.getPrice() : 0;
                    int qty = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
                    return price * qty;
                })
                .sum();

        return InventorySummaryResponse.builder()
                .totalProducts(totalProducts)
                .lowStockItems(lowStockItems)
                .outOfStockItems(outOfStockItems)
                .totalStockValue(totalStockValue)
                .build();
    }

    @Override
    public ProductResponse stockIn(Long productId, Integer qty) {
        Product product = productRepository.findById(productId).orElseThrow();

        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(current + qty);

        return map(productRepository.save(product));
    }

    @Override
    public ProductResponse stockOut(Long productId, Integer qty) {
        Product product = productRepository.findById(productId).orElseThrow();

        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int updated = Math.max(current - qty, 0);
        product.setStockQuantity(updated);

        return map(productRepository.save(product));
    }
}
