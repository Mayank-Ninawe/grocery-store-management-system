package com.mayank.inventory;
import java.util.List;
import org.springframework.stereotype.Service;
import com.mayank.client.ProductClient;
import com.mayank.client.ProductDto;
import lombok.RequiredArgsConstructor;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductClient productClient;

    private ProductResponse map(ProductDto p) {
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
        return productClient.getAllProducts().stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getLowStockItems() {
        return productClient.getAllProducts()
                .stream()
                .filter(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0)
                        <= (p.getMinStockLevel() != null ? p.getMinStockLevel() : 0))
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Override
    public InventorySummaryResponse getSummary() {
        List<ProductDto> products = productClient.getAllProducts();

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
        ProductDto product = productClient.getProductById(productId);
        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(current + qty);
        return map(productClient.updateProduct(productId, product));
    }

    @Override
    public ProductResponse stockOut(Long productId, Integer qty) {
        ProductDto product = productClient.getProductById(productId);
        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(Math.max(current - qty, 0));
        return map(productClient.updateProduct(productId, product));
    }
}
