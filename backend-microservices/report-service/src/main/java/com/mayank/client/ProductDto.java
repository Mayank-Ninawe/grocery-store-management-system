package com.mayank.client;
import lombok.Data;
@Data
public class ProductDto {
    private Long id;
    private String name;
    private String category;
    private Double price;
    private String unit;
    private Integer stockQuantity;
    private Integer minStockLevel;
}