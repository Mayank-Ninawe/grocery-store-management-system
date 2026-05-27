package com.mayank.client;
import lombok.Data;
@Data
public class InventorySummaryDto {
    private Long totalProducts;
    private Long lowStockItems;
    private Long outOfStockItems;
    private Double totalStockValue;
}