package com.ecofenix.users.model.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleDTO(
        Long id,
        @NotBlank String title
) {}
