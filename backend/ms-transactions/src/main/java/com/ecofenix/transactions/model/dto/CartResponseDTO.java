package com.ecofenix.transactions.model.dto;

import java.util.List;

public record CartResponseDTO(
        Double subtotalItems,
        Double subtotalShipping,
        Double total,
        List<CartItemDTO> items,
        Long customerId
) {}