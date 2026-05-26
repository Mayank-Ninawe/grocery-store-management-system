package com.mayank.grocerybackend.product;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String category;
    private Double price;
    private String unit;
    private Integer stockQuantity;
    private Integer minStockLevel;
}