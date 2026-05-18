package com.ecofenix.users.model.dto;

import java.time.LocalDateTime;
import java.util.List;

public record UserResponseDTO(
        Long id,
        String name,
        String lastName,
        LocalDateTime dateOfBirth,
        String image,
        String email,
        String username,
        List<String> roles,
        List<String> addresses
) {}