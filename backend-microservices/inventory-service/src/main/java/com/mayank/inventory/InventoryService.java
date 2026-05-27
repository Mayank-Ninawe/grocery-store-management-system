package com.mayank.inventory;

import java.util.List;



public interface InventoryService {
    List<ProductResponse> getAllInventory();
    List<ProductResponse> getLowStockItems();
    InventorySummaryResponse getSummary();
    ProductResponse stockIn(Long productId, Integer qty);
    ProductResponse stockOut(Long productId, Integer qty);
}
