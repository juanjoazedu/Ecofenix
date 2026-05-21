package com.ecofenix.transactions.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ShippingState {
    PROCESSING("Procesando"),
    PENDING("Pendiente"),
    SHIPPED("Enviado"),
    DELIVERED("Entregado"),
    CANCELLED("Cancelado");

    private final String displayName;
}
