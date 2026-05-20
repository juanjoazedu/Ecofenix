package com.ecofenix.users.service.impl;
import com.ecofenix.users.model.dto.AuthResponseDTO;
import com.ecofenix.users.model.dto.LoginRequestDTO;
import com.ecofenix.users.model.entity.User;
import com.ecofenix.users.repository.UserRepository;
import com.ecofenix.users.service.AuthService;
import com.ecofenix.users.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.usernameOrEmail(),
                        loginRequest.password()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(loginRequest.usernameOrEmail())
                .orElseGet(() -> userRepository.findByEmail(loginRequest.usernameOrEmail())
                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));

        String token = jwtService.generateToken(user.getUsername());

        var roles = user.getRoles().stream()
                .map(role -> role.getTitle())
                .collect(Collectors.toList());

        return new AuthResponseDTO(token, "Bearer", user.getId(), user.getUsername(), user.getEmail(), roles);
    }
}