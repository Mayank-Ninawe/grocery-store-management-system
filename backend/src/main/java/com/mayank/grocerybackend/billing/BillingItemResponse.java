package com.mayank.grocerybackend.billing;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BillingItemResponse {
    private Long productId;
    private String productName;
    private Double unitPrice;
    private Integer quantity;
    private Double lineTotal;
}
