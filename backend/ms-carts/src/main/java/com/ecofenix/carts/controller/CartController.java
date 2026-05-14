package com.ecofenix.carts.controller;

import com.ecofenix.carts.model.dto.AddItemRequestDTO;
import com.ecofenix.carts.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/test")
    public String test() {
        return "Running the ms-items!!!";
    }

    @PostMapping("/cart/items")
    public ResponseEntity<?> addItem(@RequestParam Long customerId, @RequestBody AddItemRequestDTO dto) {
        cartService.addItemToCart(customerId, dto.id(), dto.quantity());
        return ResponseEntity.ok().build();
    }
}
