package com.ecofenix.users.model.dto;

import java.util.List;

public record AuthResponseDTO(
        String token,
        String type,
        Long id, String username,
        String email,
        List<String> roles
) {}
