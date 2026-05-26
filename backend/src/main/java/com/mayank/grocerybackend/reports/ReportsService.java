package com.mayank.grocerybackend.reports;

import java.util.List;

public interface ReportsService {
    ReportsSummaryResponse getSummary();
    List<TopProductResponse> getTopProducts();
    List<DailySalesResponse> getDailySales();
}