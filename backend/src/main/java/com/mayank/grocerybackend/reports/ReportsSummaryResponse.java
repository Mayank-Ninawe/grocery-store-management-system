 
package com.mayank.grocerybackend.reports;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReportsSummaryResponse {
    private long totalProducts;
    private long totalSuppliers;
    private long totalInvoices;
    private double totalRevenue;
    private long lowStockItems;
    private long outOfStockItems;
}