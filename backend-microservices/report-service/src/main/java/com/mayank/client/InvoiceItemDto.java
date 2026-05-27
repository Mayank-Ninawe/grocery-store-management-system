package com.mayank.client;
import lombok.Data;
@Data
public class InvoiceItemDto {
    private Long productId;
    private String productName;
    private Double unitPrice;
    private Integer quantity;
    private Double lineTotal;
}