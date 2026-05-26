package com.mayank.grocerybackend.reports;

import com.mayank.grocerybackend.billing.InvoiceItemRepository;
import com.mayank.grocerybackend.billing.InvoiceRepository;
import com.mayank.grocerybackend.product.ProductRepository;
import com.mayank.grocerybackend.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportsServiceImpl implements ReportsService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    @Override
    public ReportsSummaryResponse getSummary() {
        List<com.mayank.grocerybackend.product.Product> products = productRepository.findAll();

        long totalProducts = products.size();
        long totalSuppliers = supplierRepository.count();
        long totalInvoices = invoiceRepository.countTotalInvoices();
        double totalRevenue = invoiceRepository.sumTotalRevenue();

        long lowStockItems = products.stream()
                .filter(p -> {
                    int stock = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
                    int min = p.getMinStockLevel() != null ? p.getMinStockLevel() : 0;
                    return stock <= min;
                })
                .count();

        long outOfStockItems = products.stream()
                .filter(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0) == 0)
                .count();

        return ReportsSummaryResponse.builder()
                .totalProducts(totalProducts)
                .totalSuppliers(totalSuppliers)
                .totalInvoices(totalInvoices)
                .totalRevenue(totalRevenue)
                .lowStockItems(lowStockItems)
                .outOfStockItems(outOfStockItems)
                .build();
    }

    @Override
    public List<TopProductResponse> getTopProducts() {
        return invoiceItemRepository.findTopProducts();
    }

    @Override
    public List<DailySalesResponse> getDailySales() {
        return invoiceItemRepository.findDailySales();
    }
}
