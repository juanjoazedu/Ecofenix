package com.ecofenix.payments.model.dto;


import com.ecofenix.payments.model.enums.PaymentStatus;
import com.ecofenix.payments.model.enums.ShippingState;

public record UpdateOrderStatusRequestDTO(
        PaymentStatus paymentStatus,
        ShippingState shippingState
) {}
