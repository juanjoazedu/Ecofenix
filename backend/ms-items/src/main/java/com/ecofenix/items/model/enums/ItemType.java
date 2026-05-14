package com.ecofenix.items.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ItemType {
    FOR_SALE("En venta"),
    DONATION("Donación");

    private final String displayName;
}
