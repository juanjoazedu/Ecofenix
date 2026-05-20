package com.ecofenix.users.service;

import com.ecofenix.users.model.dto.AddressDTO;
import com.ecofenix.users.model.dto.UserRequestDTO;
import com.ecofenix.users.model.dto.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO register(UserRequestDTO userRequest);

    UserResponseDTO findById(Long id);
    UserResponseDTO findByUsername(String username);
    List<UserResponseDTO> findAll();

    UserResponseDTO update(Long id, UserRequestDTO userRequest);

    void delete(Long id);

    UserResponseDTO assignRole(Long userId, String roleTitle);

    UserResponseDTO replaceAddresses(Long userId, List<AddressDTO> addresses);
    UserResponseDTO addAddress(Long userId, AddressDTO address);
    UserResponseDTO updateAddress(Long addressId, AddressDTO address);
    void deleteAddress(Long addressId);
}