package com.mayank.billing;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BillingResponse {
    private Long id;
    private String invoiceNumber;
    private String customerName;
    private Double subtotal;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private List<BillingItemResponse> items;
}
