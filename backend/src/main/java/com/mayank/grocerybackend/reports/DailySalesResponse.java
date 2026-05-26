package com.mayank.grocerybackend.reports;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailySalesResponse {
    private LocalDate saleDate;
    private Long totalInvoices;
    private Double totalRevenue;
}
