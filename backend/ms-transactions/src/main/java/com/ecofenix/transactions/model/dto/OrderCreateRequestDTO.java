package com.ecofenix.transactions.model.dto;

public record OrderCreateRequestDTO(
        Long customerId,
        String address,
        String addInfo
) {}