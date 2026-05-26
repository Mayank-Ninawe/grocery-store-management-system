package com.mayank.grocerybackend.billing;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor

public class BillingController {

    private final BillingService billingService;

    @PostMapping("/checkout")
    public BillingResponse checkout(@RequestBody BillingRequest request) {
        return billingService.checkout(request);
    }

    @GetMapping("/invoices")
    public List<BillingResponse> getAllInvoices() {
        return billingService.getAllInvoices();
    }

    @GetMapping("/invoices/{id}")
    public BillingResponse getInvoiceById(@PathVariable Long id) {
        return billingService.getInvoiceById(id);
    }
}
