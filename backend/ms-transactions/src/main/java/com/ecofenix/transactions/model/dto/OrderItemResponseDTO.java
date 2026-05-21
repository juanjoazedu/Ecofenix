package com.ecofenix.transactions.model.dto;

public record OrderItemResponseDTO(
        Long id,
        Integer quantity,
        Double unitPrice,
        Double shippingCost,
        Double totalPrice,
        Long itemId
) {}