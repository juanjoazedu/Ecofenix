package com.ecofenix.payments.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentStatus {
    PENDING("Pendiente"),
    PROCESSING("Procesando"),
    DECLINED("Rechazado"),
    CANCELLED("Cancelado"),
    PARTIAL("Parcial"),
    COMPLETED("Completado");

    private final String displayName;
}
