package com.mayank.grocerybackend.billing;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.mayank.grocerybackend.reports.DailySalesResponse;
import com.mayank.grocerybackend.reports.TopProductResponse;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    @Query("""
        SELECT new com.mayank.grocerybackend.reports.TopProductResponse(
            ii.productName,
            SUM(ii.quantity),
            SUM(ii.lineTotal)
        )
        FROM InvoiceItem ii
        GROUP BY ii.productName
        ORDER BY SUM(ii.quantity) DESC
    """)
    List<TopProductResponse> findTopProducts();

    @Query("""
        SELECT new com.mayank.grocerybackend.reports.DailySalesResponse(
            CAST(i.createdAt AS localdate),
            COUNT(DISTINCT i.id),
            SUM(ii.lineTotal)
        )
        FROM InvoiceItem ii
        JOIN ii.invoice i
        GROUP BY CAST(i.createdAt AS localdate)
        ORDER BY CAST(i.createdAt AS localdate) DESC
    """)
    List<DailySalesResponse> findDailySales();

     @Query("SELECT COUNT(i) FROM Invoice i")
    long countTotalInvoices();

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i")
    double sumTotalRevenue();
}