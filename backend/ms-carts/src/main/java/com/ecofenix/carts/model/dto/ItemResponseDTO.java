package com.ecofenix.carts.model.dto;

public record ItemResponseDTO(
        Long id,
        String title,
        Double price,
        Integer stock,
        Double shippingCost
) {
}
