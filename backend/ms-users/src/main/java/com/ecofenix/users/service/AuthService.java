package com.ecofenix.users.service;

import com.ecofenix.users.model.dto.AuthResponseDTO;
import com.ecofenix.users.model.dto.LoginRequestDTO;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO loginRequest);
}