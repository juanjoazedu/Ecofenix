package com.ecofenix.carts.service;

public interface CartService {
    void addItemToCart(Long customerId, Long itemId, Integer quantity);
}
