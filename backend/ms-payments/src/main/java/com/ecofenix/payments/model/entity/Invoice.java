package com.ecofenix.payments.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", unique = true)
    private Payment payment;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private LocalDateTime issueDate;

    @Column(nullable = false)
    private Double subtotalItems;

    @Column(nullable = false)
    private Double subtotalShipping;

    @Column(nullable = false)
    private Double total;

    @Column(nullable = false)
    private String address;

    private String addInfo;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceItem> items = new ArrayList<>();
}
