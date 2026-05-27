package com.mayank.client;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
@Data
public class InvoiceDto {
    private Long id;
    private String invoiceNumber;
    private String customerName;
    private Double subtotal;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private List<InvoiceItemDto> items;
}
