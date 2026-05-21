package com.ecofenix.users.model.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

public record UserRequestDTO(
        @NotBlank String name,
        @NotBlank String lastName,
        @NotNull LocalDateTime dateOfBirth,
        String image,
        @Email @NotBlank String email,
        @NotBlank String username,
        // @NotBlank String password,
        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password,
        List<AddressDTO> addresses,
        @NotNull @Size(min = 1) List<Long> roleIds
) {}