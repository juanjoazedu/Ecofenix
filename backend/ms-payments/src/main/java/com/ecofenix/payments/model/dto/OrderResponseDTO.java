package com.ecofenix.payments.model.dto;

import com.ecofenix.payments.model.enums.PaymentStatus;
import com.ecofenix.payments.model.enums.ShippingState;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponseDTO(
        Long id,
        Double subtotalItems,
        Double subtotalShipping,
        Double total,
        String address,
        String addInfo,
        PaymentStatus paymentStatus,
        ShippingState shippingState,
        Long customerId,
        List<OrderItemResponseDTO> items,
        LocalDateTime lastModifiedAt
) {}
