package com.ecofenix.transactions.model.dto;

import com.ecofenix.transactions.model.enums.PaymentStatus;
import com.ecofenix.transactions.model.enums.ShippingState;

public record UpdateOrderStatusRequestDTO(
        PaymentStatus paymentStatus,
        ShippingState shippingState
) {}
