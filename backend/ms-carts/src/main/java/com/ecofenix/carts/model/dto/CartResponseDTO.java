package com.ecofenix.carts.model.dto;

import java.util.List;

public record CartResponseDTO(
        Double subtotalItems,
        Double subtotalShipping,
        Double total,
        List<CartItemResponseDTO> cartItems,
        Long customerId
) {
}
