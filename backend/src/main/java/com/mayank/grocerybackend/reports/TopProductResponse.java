package com.mayank.grocerybackend.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductResponse {
    private String productName;
    private Long totalQuantitySold;
    private Double totalRevenue;
}