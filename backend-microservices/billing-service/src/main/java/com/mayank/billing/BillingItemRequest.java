package com.mayank.billing;

import lombok.Data;

@Data
public class BillingItemRequest {
    private Long productId;
    private Integer quantity;
}
