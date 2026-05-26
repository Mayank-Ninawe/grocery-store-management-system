package com.mayank.grocerybackend.billing;

import java.util.List;

public interface BillingService {
    BillingResponse checkout(BillingRequest request);
    List<BillingResponse> getAllInvoices();
    BillingResponse getInvoiceById(Long id);
}
