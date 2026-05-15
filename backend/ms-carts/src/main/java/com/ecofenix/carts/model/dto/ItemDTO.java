package com.ecofenix.carts.model.dto;

public record ItemDTO(
        Long id,
        String title,
        Double price,
        Integer stock,
        Double shippingCost
) {
}
