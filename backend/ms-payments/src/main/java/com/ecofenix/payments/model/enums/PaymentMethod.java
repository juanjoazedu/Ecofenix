package com.ecofenix.payments.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentMethod {
    DEBIT("Tarjeta de Débito"),
    CREDIT("Tarjeta de Crédito");

    private final String displayName;
}