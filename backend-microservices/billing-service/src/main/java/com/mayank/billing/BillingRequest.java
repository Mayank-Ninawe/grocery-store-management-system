package com.mayank.billing;

import java.util.List;

import lombok.Data;

@Data
public class BillingRequest {
    private String customerName;
    private List<BillingItemRequest> items;
}
