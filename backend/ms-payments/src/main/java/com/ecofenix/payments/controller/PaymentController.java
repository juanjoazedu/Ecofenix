package com.ecofenix.payments.controller;

import com.ecofenix.payments.model.dto.InvoiceResponseDTO;
import com.ecofenix.payments.model.dto.PaymentRequestDTO;
import com.ecofenix.payments.model.dto.PaymentResponseDTO;
import com.ecofenix.payments.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/test")
    public String test() {
        return "Running the ms-payments!!!";
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequestDTO request) {
        try {
            PaymentResponseDTO created = paymentService.createPayment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPayment(@PathVariable Long id) {
        try {
            PaymentResponseDTO payment = paymentService.findPaymentById(id);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<?> getInvoice(@PathVariable Long id) {
        try {
            InvoiceResponseDTO invoice = paymentService.getInvoiceByPaymentId(id);
            return ResponseEntity.ok(invoice);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}
