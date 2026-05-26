package com.mayank.grocerybackend.product;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private String category;
    private Double price;
    private String unit;
    private Integer stockQuantity;
    private Integer minStockLevel;
}
