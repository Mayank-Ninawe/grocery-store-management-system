package com.mayank.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@FeignClient(name = "billing-service")
public interface InvoiceClient {
    @GetMapping("/api/billing")
    List<InvoiceDto> getAllInvoices();
}
