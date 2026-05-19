package com.ecofenix.items.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ItemStatus {
    ACTIVE("Activo"),
    INACTIVE("Inactivo"),
    OUT_OF_STOCK("Agotado"),
    DELETED("Eliminado");

    private final String displayName;
}
