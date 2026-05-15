package com.ecofenix.carts.service;

import com.ecofenix.carts.model.dto.ItemRequestDTO;
import com.ecofenix.carts.model.dto.CartResponseDTO;

public interface CartService {
    void addItemToCart(ItemRequestDTO dto);

    CartResponseDTO getCart(Long customerId);

    void updateItemQuantity(ItemRequestDTO dto);

    void removeItemFromCart(Long customerId, Long itemId);

    void emptyCart(Long customerId);
}
