package com.ecofenix.users.model.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record UserRequestDTO(
        @NotBlank String name,
        @NotBlank String lastName,
        @NotNull LocalDateTime dateOfBirth,
        String image,
        @Email @NotBlank String email,
        @NotBlank String username,
        @NotBlank String password,
        java.util.List<AddressDTO> addresses
) {}