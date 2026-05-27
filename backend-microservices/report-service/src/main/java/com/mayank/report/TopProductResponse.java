package com.mayank.report;
import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class TopProductResponse {
    private Long productId;
    private String productName;
    private Integer quantitySold;
    private Double revenue;
}
