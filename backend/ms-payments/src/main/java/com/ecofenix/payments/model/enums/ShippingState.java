package com.ecofenix.payments.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ShippingState {
    PENDING("Pendiente"),
    PROCESSING("Procesando"),
    SHIPPED("Enviado"),
    DELIVERED("Entregado"),
    CANCELLED("Cancelado");

    private final String displayName;
}