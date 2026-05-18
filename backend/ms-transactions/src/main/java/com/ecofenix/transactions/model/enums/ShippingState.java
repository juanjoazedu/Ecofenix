package com.ecofenix.transactions.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ShippingState {
    PENDING("Pendiente"),
    SHIPPED("Enviado"),
    DELIVERED("Entregado");

    private final String displayName;
}
