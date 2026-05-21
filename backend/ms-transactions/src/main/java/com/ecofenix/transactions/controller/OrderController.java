package com.ecofenix.transactions.controller;

import com.ecofenix.transactions.model.dto.OrderCreateRequestDTO;
import com.ecofenix.transactions.model.dto.OrderResponseDTO;
import com.ecofenix.transactions.model.dto.UpdateOrderStatusRequestDTO;
import com.ecofenix.transactions.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/test")
    public String test() {
        return "Running the ms-transactions!!!";
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderCreateRequestDTO request) {
        try {
            OrderResponseDTO created = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            OrderResponseDTO order = orderService.findById(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequestDTO statusRequest) {
        try {
            OrderResponseDTO updated = orderService.updatePaymentAndShippingStatus(id, statusRequest);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
            }
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}