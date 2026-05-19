package com.ecofenix.items.model.dto;

import java.time.LocalDateTime;

public record CategoryResponseDTO(
        Long id,
        String name,
        Long parentCategoryId
) {
}
