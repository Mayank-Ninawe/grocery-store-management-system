package com.mayank.billing;
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
}