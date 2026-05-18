package com.ecofenix.users.service;

import com.ecofenix.users.model.dto.UserRequestDTO;
import com.ecofenix.users.model.dto.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO create(UserRequestDTO dto);
    UserResponseDTO update(Long id, UserRequestDTO dto);
    void delete(Long id);
    UserResponseDTO findById(Long id);
    List<UserResponseDTO> findAll();
    List<UserResponseDTO> findByRole(Long roleId);
    UserResponseDTO assignRole(Long userId, Long roleId);
    UserResponseDTO removeRole(Long userId, Long roleId);
}