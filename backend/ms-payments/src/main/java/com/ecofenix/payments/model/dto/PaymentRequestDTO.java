package com.ecofenix.payments.model.dto;

import com.ecofenix.payments.model.enums.PaymentMethod;

public record PaymentRequestDTO(
        Double total,
        PaymentMethod paymentMethod,
        Integer installments,
        Long orderId
) {}