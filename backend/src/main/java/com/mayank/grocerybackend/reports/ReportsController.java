package com.mayank.grocerybackend.reports;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/summary")
    public ReportsSummaryResponse getSummary() {
        return reportsService.getSummary();
    }

    @GetMapping("/top-products")
    public List<TopProductResponse> getTopProducts() {
        return reportsService.getTopProducts();
    }

    @GetMapping("/daily-sales")
    public List<DailySalesResponse> getDailySales() {
        return reportsService.getDailySales();
    }
}