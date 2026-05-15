package com.ecofenix.items.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequestDTO(
   @NotBlank
   @Size(min = 3, max = 100)
   String name,

   Long parentCategoryId
) {}
