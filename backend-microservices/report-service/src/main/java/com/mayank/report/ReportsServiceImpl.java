package com.mayank.report;
import com.mayank.client.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportsServiceImpl implements ReportsService {
    
    private final ProductClient productClient;
    private final InvoiceClient invoiceClient;

    @Override
    public ReportsSummaryResponse getSummary() {
        List<InvoiceDto> invoices = invoiceClient.getAllInvoices();
        double totalRevenue = invoices.stream().mapToDouble(i -> i.getTotalAmount() != null ? i.getTotalAmount() : 0.0).sum();
        long totalInvoices = invoices.size();
        
        List<ProductDto> products = productClient.getAllProducts();
        long lowStockItems = products.stream().filter(p -> (p.getStockQuantity()!=null?p.getStockQuantity():0) <= (p.getMinStockLevel()!=null?p.getMinStockLevel():0)).count();
        long outOfStockItems = products.stream().filter(p -> (p.getStockQuantity()!=null?p.getStockQuantity():0) == 0).count();

        return ReportsSummaryResponse.builder()
                .totalRevenue(totalRevenue)
                .totalInvoices(totalInvoices)
                .lowStockItems(lowStockItems)
                .outOfStockItems(outOfStockItems)
                .build();
    }

    @Override
    public List<TopProductResponse> getTopProducts(int limit) {
        List<InvoiceDto> invoices = invoiceClient.getAllInvoices();
        Map<Long, Integer> qtySoldMap = new HashMap<>();
        Map<Long, Double> revenueMap = new HashMap<>();

        for (InvoiceDto invoice : invoices) {
            for (InvoiceItemDto item : invoice.getItems()) {
                qtySoldMap.merge(item.getProductId(), item.getQuantity(), Integer::sum);
                revenueMap.merge(item.getProductId(), item.getLineTotal(), Double::sum);
            }
        }

        return qtySoldMap.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(limit)
                .map(e -> {
                    Long productId = e.getKey();
                    ProductDto product = null;
                    try { product = productClient.getProductById(productId); } catch(Exception ex) {}
                    return TopProductResponse.builder()
                            .productId(productId)
                            .productName(product != null ? product.getName() : "Unknown Product")
                            .quantitySold(e.getValue())
                            .revenue(revenueMap.getOrDefault(productId, 0.0))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<DailySalesResponse> getDailySales(int days) {
        List<InvoiceDto> invoices = invoiceClient.getAllInvoices();
        LocalDate startDate = LocalDate.now().minusDays(days);
        
        Map<LocalDate, DailySalesResponse> dailyMap = new HashMap<>();
        for (InvoiceDto invoice : invoices) {
            LocalDate date = invoice.getCreatedAt().toLocalDate();
            if (!date.isBefore(startDate)) {
                DailySalesResponse current = dailyMap.getOrDefault(date, DailySalesResponse.builder()
                        .date(date).invoicesCount(0).revenue(0.0).build());
                current.setInvoicesCount(current.getInvoicesCount() + 1);
                current.setRevenue(current.getRevenue() + (invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0.0));
                dailyMap.put(date, current);
            }
        }
        return dailyMap.values().stream().sorted(Comparator.comparing(DailySalesResponse::getDate)).collect(Collectors.toList());
    }
}
