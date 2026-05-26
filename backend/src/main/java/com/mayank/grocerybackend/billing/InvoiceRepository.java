package com.mayank.grocerybackend.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT COUNT(i) FROM Invoice i")
    long countTotalInvoices();

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i")
    double sumTotalRevenue();
}
