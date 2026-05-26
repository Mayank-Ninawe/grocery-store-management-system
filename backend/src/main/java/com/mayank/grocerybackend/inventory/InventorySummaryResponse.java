package com.mayank.grocerybackend.inventory;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventorySummaryResponse {
    private long totalProducts;
    private long lowStockItems;
    private long outOfStockItems;
    private double totalStockValue;
}
