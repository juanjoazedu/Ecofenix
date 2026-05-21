package com.ecofenix.payments.model.dto;

public record InvoiceItemDTO(
        Long id,
        Long itemId,
        Integer quantity,
        Double unitPrice,
        Double shippingCost,
        Double totalPrice
) {}