package com.ecofenix.transactions.model.dto;

public record CartItemDTO(
        Long itemId,
        String title,
        Integer quantity,
        Double unitPrice,
        Double totalPrice,
        Double shippingCost
) {}