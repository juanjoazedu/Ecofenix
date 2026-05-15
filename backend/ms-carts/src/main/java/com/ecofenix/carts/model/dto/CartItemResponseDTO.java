package com.ecofenix.carts.model.dto;

public record CartItemResponseDTO(
        Long itemId,
        String title,
        Integer quantity,
        Double unitPrice,
        Double totalPrice,
        Double shippingCost
) {}
