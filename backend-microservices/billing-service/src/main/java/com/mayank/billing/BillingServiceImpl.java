package com.mayank.billing;
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
