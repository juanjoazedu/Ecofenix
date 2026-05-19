package com.ecofenix.carts.model.dto;

public record ItemRequestDTO(
        Long itemId,
        Integer quantity,
        Long customerId
) {
}
