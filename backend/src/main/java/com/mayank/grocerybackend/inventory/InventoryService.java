package com.mayank.grocerybackend.inventory;

import java.util.List;

import com.mayank.grocerybackend.product.ProductResponse;

public interface InventoryService {
    List<ProductResponse> getAllInventory();
    List<ProductResponse> getLowStockItems();
    InventorySummaryResponse getSummary();
    ProductResponse stockIn(Long productId, Integer qty);
    ProductResponse stockOut(Long productId, Integer qty);
}
