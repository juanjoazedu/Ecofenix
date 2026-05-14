package com.ecofenix.items.model.dto;

import com.ecofenix.items.model.entity.Image;
import com.ecofenix.items.model.enums.ItemStatus;
import com.ecofenix.items.model.enums.ItemType;

import java.util.List;

public record ItemResponseDTO(
        Long id,
        String title,
        String description,
        Double price,
        Integer stock,
        List<ImageResponseDTO> images,
        Double shippingCost,
        ItemType type,
        ItemStatus status,
        Long sellerId
) {
}
