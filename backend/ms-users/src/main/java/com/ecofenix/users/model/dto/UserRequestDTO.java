package com.ecofenix.users.model.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

public record UserRequestDTO(

        @NotBlank String name,

        @NotBlank String lastName,

        @NotNull @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dateOfBirth,

        String image,

        @NotBlank @Email String email,

        @NotBlank String username,

        @NotBlank @Size(min = 6) String password,

        @NotNull @Size(min = 1)
        List<@NotNull(message = "El ID del rol no puede ser nulo") Long> roleIds,

        List<String> addresses

) {}