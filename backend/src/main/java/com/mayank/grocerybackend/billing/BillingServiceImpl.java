package com.mayank.grocerybackend.billing;

import com.mayank.grocerybackend.product.Product;
import com.mayank.grocerybackend.product.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;

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
                .build();

        double subtotal = 0.0;

        for (Map.Entry<Long, Integer> entry : mergedItems.entrySet()) {
            Long productId = entry.getKey();
            Integer requestedQty = entry.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));

            int currentStock = safeInt(product.getStockQuantity());
            double unitPrice = safeDouble(product.getPrice());

            if (requestedQty <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0 for product id: " + productId);
            }

            if (currentStock < requestedQty) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + product.getName() +
                        ". Available: " + currentStock + ", Requested: " + requestedQty
                );
            }

            double lineTotal = unitPrice * requestedQty;

            InvoiceItem invoiceItem = InvoiceItem.builder()
                    .invoice(invoice)
                    .product(product)
                    .productName(product.getName())
                    .unitPrice(unitPrice)
                    .quantity(requestedQty)
                    .lineTotal(lineTotal)
                    .build();

            invoice.getItems().add(invoiceItem);
            subtotal += lineTotal;

            product.setStockQuantity(currentStock - requestedQty);
            productRepository.save(product);
        }

        invoice.setSubtotal(subtotal);
        invoice.setTotalAmount(subtotal);

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return map(savedInvoice);
    }

    @Override
    public List<BillingResponse> getAllInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public BillingResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
        return map(invoice);
    }

    private void validateRequest(BillingRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Billing request cannot be null");
        }

        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("At least one item is required for checkout");
        }

        for (BillingItemRequest item : request.getItems()) {
            if (item == null) {
                throw new IllegalArgumentException("Billing item cannot be null");
            }

            if (item.getProductId() == null) {
                throw new IllegalArgumentException("Product id is required");
            }

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Valid quantity is required for product id: " + item.getProductId());
            }
        }
    }

    private Map<Long, Integer> mergeDuplicateItems(List<BillingItemRequest> items) {
        Map<Long, Integer> merged = new LinkedHashMap<>();

        for (BillingItemRequest item : items) {
            merged.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }

        return merged;
    }

    private String generateInvoiceNumber() {
        return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private double safeDouble(Double value) {
        return value != null ? value : 0.0;
    }

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
                                .productId(item.getProduct().getId())
                                .productName(item.getProductName())
                                .unitPrice(item.getUnitPrice())
                                .quantity(item.getQuantity())
                                .lineTotal(item.getLineTotal())
                                .build())
                        .toList())
                .build();
    }
}
