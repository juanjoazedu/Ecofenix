package com.ecofenix.payments.model.dto;

import com.ecofenix.payments.model.enums.PaymentMethod;
import java.time.LocalDateTime;

public record PaymentResponseDTO(
        Long id,
        Double total,
        PaymentMethod paymentMethod,
        Integer installments,
        Long orderId,
        LocalDateTime createdAt
) {}
