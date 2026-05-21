package com.ecofenix.carts.controller;

import com.ecofenix.carts.model.dto.CartResponseDTO;
import com.ecofenix.carts.model.dto.ItemRequestDTO;
import com.ecofenix.carts.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carts")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping("/test")
    public String test() {
        return "Running the ms-carts!!!";
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<?> getCart(@PathVariable Long customerId) {
        try {
            CartResponseDTO cart = cartService.getCart(customerId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItemToCart(@RequestBody ItemRequestDTO dto) {
        try {
            cartService.addItemToCart(dto);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/items")
    public ResponseEntity<?> updateItemQuantity(@RequestBody ItemRequestDTO dto) {
        try {
            cartService.updateItemQuantity(dto);
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/{customerId}/items/{itemId}")
    public ResponseEntity<?> removeItemFromCart(@PathVariable Long customerId, @PathVariable Long itemId) {
        try {
            cartService.removeItemFromCart(customerId, itemId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @DeleteMapping("/{customerId}/empty")
    public ResponseEntity<?> emptyCart(@PathVariable Long customerId) {
        try {
            cartService.emptyCart(customerId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}