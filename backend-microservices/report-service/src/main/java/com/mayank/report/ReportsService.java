package com.mayank.report;
import java.util.List;
public interface ReportsService {
    ReportsSummaryResponse getSummary();
    List<TopProductResponse> getTopProducts(int limit);
    List<DailySalesResponse> getDailySales(int days);
}
