const fs = require('fs');
const path = require('path');

const root = 'D:/grocery-store-management-system/backend-microservices';

function writeClass(service, pkg, name, content) {
    const dir = path.join(root, service, 'src/main/java/com/mayank', pkg);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name + '.java'), content);
}

// 1. DTOs and Feign Clients

const productDto = `package com.mayank.client;
import lombok.Data;
@Data
public class ProductDto {
    private Long id;
    private String name;
    private String category;
    private Double price;
    private String unit;
    private Integer stockQuantity;
    private Integer minStockLevel;
}`;

const productClient = `package com.mayank.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products")
    List<ProductDto> getAllProducts();

    @GetMapping("/api/products/{id}")
    ProductDto getProductById(@PathVariable("id") Long id);

    @PutMapping("/api/products/{id}")
    ProductDto updateProduct(@PathVariable("id") Long id, @RequestBody ProductDto request);
}`;

const inventorySummaryDto = `package com.mayank.client;
import lombok.Data;
@Data
public class InventorySummaryDto {
    private Long totalProducts;
    private Long lowStockItems;
    private Long outOfStockItems;
    private Double totalStockValue;
}`;

const inventoryClient = `package com.mayank.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "inventory-service")
public interface InventoryClient {
    @PutMapping("/api/inventory/{id}/stock-out")
    ProductDto stockOut(@PathVariable("id") Long id, @RequestParam("qty") Integer qty);
}`;

const invoiceClient = `package com.mayank.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@FeignClient(name = "billing-service")
public interface InvoiceClient {
    @GetMapping("/api/billing")
    List<InvoiceDto> getAllInvoices();
}
`;

const invoiceDto = `package com.mayank.client;
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
`;

const invoiceItemDto = `package com.mayank.client;
import lombok.Data;
@Data
public class InvoiceItemDto {
    private Long productId;
    private String productName;
    private Double unitPrice;
    private Integer quantity;
    private Double lineTotal;
}`;

// Write Clients & DTOs to inventory, billing, report
['inventory-service', 'billing-service', 'report-service'].forEach(svc => {
    writeClass(svc, 'client', 'ProductDto', productDto);
    writeClass(svc, 'client', 'ProductClient', productClient);
});
writeClass('billing-service', 'client', 'InventoryClient', inventoryClient);
writeClass('report-service', 'client', 'InventorySummaryDto', inventorySummaryDto);
writeClass('report-service', 'client', 'InventoryClient', inventoryClient);
writeClass('report-service', 'client', 'InvoiceDto', invoiceDto);
writeClass('report-service', 'client', 'InvoiceItemDto', invoiceItemDto);
writeClass('report-service', 'client', 'InvoiceClient', invoiceClient);

// 2. Refactor InventoryServiceImpl
const inventoryServiceImpl = `package com.mayank.inventory;
import java.util.List;
import org.springframework.stereotype.Service;
import com.mayank.client.ProductClient;
import com.mayank.client.ProductDto;
import lombok.RequiredArgsConstructor;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductClient productClient;

    private ProductResponse map(ProductDto p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .price(p.getPrice())
                .unit(p.getUnit())
                .stockQuantity(p.getStockQuantity())
                .minStockLevel(p.getMinStockLevel())
                .build();
    }

    @Override
    public List<ProductResponse> getAllInventory() {
        return productClient.getAllProducts().stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getLowStockItems() {
        return productClient.getAllProducts()
                .stream()
                .filter(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0)
                        <= (p.getMinStockLevel() != null ? p.getMinStockLevel() : 0))
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Override
    public InventorySummaryResponse getSummary() {
        List<ProductDto> products = productClient.getAllProducts();

        long totalProducts = products.size();
        long lowStockItems = products.stream()
                .filter(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0)
                        <= (p.getMinStockLevel() != null ? p.getMinStockLevel() : 0))
                .count();

        long outOfStockItems = products.stream()
                .filter(p -> (p.getStockQuantity() != null ? p.getStockQuantity() : 0) == 0)
                .count();

        double totalStockValue = products.stream()
                .mapToDouble(p -> {
                    double price = p.getPrice() != null ? p.getPrice() : 0;
                    int qty = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
                    return price * qty;
                })
                .sum();

        return InventorySummaryResponse.builder()
                .totalProducts(totalProducts)
                .lowStockItems(lowStockItems)
                .outOfStockItems(outOfStockItems)
                .totalStockValue(totalStockValue)
                .build();
    }

    @Override
    public ProductResponse stockIn(Long productId, Integer qty) {
        ProductDto product = productClient.getProductById(productId);
        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(current + qty);
        return map(productClient.updateProduct(productId, product));
    }

    @Override
    public ProductResponse stockOut(Long productId, Integer qty) {
        ProductDto product = productClient.getProductById(productId);
        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(Math.max(current - qty, 0));
        return map(productClient.updateProduct(productId, product));
    }
}
`;
writeClass('inventory-service', 'inventory', 'InventoryServiceImpl', inventoryServiceImpl);

// 3. Refactor InvoiceItem Entity & BillingServiceImpl
const invoiceItemContent = `package com.mayank.billing;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "invoice_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    private String productName;
    private Double unitPrice;
    private Integer quantity;
    private Double lineTotal;
}`;
writeClass('billing-service', 'billing', 'InvoiceItem', invoiceItemContent);

const billingServiceImpl = `package com.mayank.billing;
import com.mayank.client.ProductClient;
import com.mayank.client.ProductDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final InvoiceRepository invoiceRepository;
    private final ProductClient productClient;

    @Override
    @Transactional
    public BillingResponse checkout(BillingRequest request) {
        validateRequest(request);
        Map<Long, Integer> mergedItems = mergeDuplicateItems(request.getItems());
        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .customerName(request.getCustomerName().trim())
                .subtotal(0.0)
                .totalAmount(0.0)
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        double subtotal = 0.0;
        for (Map.Entry<Long, Integer> entry : mergedItems.entrySet()) {
            Long productId = entry.getKey();
            Integer requestedQty = entry.getValue();

            ProductDto product;
            try {
                product = productClient.getProductById(productId);
            } catch (Exception e) {
                throw new EntityNotFoundException("Product not found with id: " + productId);
            }

            int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            double unitPrice = product.getPrice() != null ? product.getPrice() : 0.0;

            if (requestedQty <= 0) throw new IllegalArgumentException("Quantity must be > 0");
            if (currentStock < requestedQty) throw new IllegalArgumentException("Insufficient stock");

            double lineTotal = unitPrice * requestedQty;
            InvoiceItem invoiceItem = InvoiceItem.builder()
                    .invoice(invoice)
                    .productId(productId)
                    .productName(product.getName())
                    .unitPrice(unitPrice)
                    .quantity(requestedQty)
                    .lineTotal(lineTotal)
                    .build();

            invoice.getItems().add(invoiceItem);
            subtotal += lineTotal;

            product.setStockQuantity(currentStock - requestedQty);
            productClient.updateProduct(productId, product);
        }

        invoice.setSubtotal(subtotal);
        invoice.setTotalAmount(subtotal);
        return map(invoiceRepository.save(invoice));
    }

    @Override
    public List<BillingResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public BillingResponse getInvoiceById(Long id) {
        return map(invoiceRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Invoice not found")));
    }

    private void validateRequest(BillingRequest request) { /* omitted for brevity */ }
    private Map<Long, Integer> mergeDuplicateItems(List<BillingItemRequest> items) {
        Map<Long, Integer> merged = new LinkedHashMap<>();
        for (BillingItemRequest item : items) merged.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        return merged;
    }
    private String generateInvoiceNumber() { return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(); }

    private BillingResponse map(Invoice invoice) {
        return BillingResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerName(invoice.getCustomerName())
                .subtotal(invoice.getSubtotal())
                .totalAmount(invoice.getTotalAmount())
                .createdAt(invoice.getCreatedAt())
                .items(invoice.getItems().stream()
                        .map(item -> BillingItemResponse.builder()
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .unitPrice(item.getUnitPrice())
                                .quantity(item.getQuantity())
                                .lineTotal(item.getLineTotal())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
`;
writeClass('billing-service', 'billing', 'BillingServiceImpl', billingServiceImpl);

// 4. Refactor ReportsServiceImpl
const reportsServiceImpl = `package com.mayank.report;
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
`;
writeClass('report-service', 'report', 'ReportsServiceImpl', reportsServiceImpl);

console.log('Refactoring completed successfully.');
