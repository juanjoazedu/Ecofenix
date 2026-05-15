package com.ecofenix.items.model.dto;

import com.ecofenix.items.model.enums.ItemStatus;
import com.ecofenix.items.model.enums.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ItemRequestDTO(
        @NotBlank String title,

        @NotBlank
        @Size(max = 1000)
        String description,

        @NotNull
        @PositiveOrZero
        Double price,

        @NotNull
        @PositiveOrZero
        Integer stock,

        List<String> imageUrls,

        @NotNull
        @PositiveOrZero
        Double shippingCost,

        @NotNull
        ItemType type,

        @NotNull
        ItemStatus status,

        @NotNull
        Long sellerId,

        @NotNull
        @Size(min = 1)
        List<Long> categoryIds

) {
}
