package com.ecofenix.users.service.impl;

import com.ecofenix.users.model.dto.AddressDTO;
import com.ecofenix.users.model.dto.RoleDTO;
import com.ecofenix.users.model.dto.UserRequestDTO;
import com.ecofenix.users.model.dto.UserResponseDTO;
import com.ecofenix.users.model.entity.Addresses;
import com.ecofenix.users.model.entity.Role;
import com.ecofenix.users.model.entity.User;
import com.ecofenix.users.repository.AddressRepository;
import com.ecofenix.users.repository.RoleRepository;
import com.ecofenix.users.repository.UserRepository;
import com.ecofenix.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AddressRepository addressRepository;

    private final PasswordEncoder passwordEncoder;

    //Conversion methods
    private UserResponseDTO convertToDTO(User user) {
        List<RoleDTO> roleDTOs = user.getRoles().stream()
                .map(role -> new RoleDTO(role.getId(), role.getTitle()))
                .collect(Collectors.toList());

        List<AddressDTO> addressDTOs = user.getAddresses().stream()
                .map(addr -> new AddressDTO(addr.getId(), addr.getAddress()))
                .collect(Collectors.toList());

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getLastName(),
                user.getDateOfBirth(),
                user.getImage(),
                user.getEmail(),
                user.getUsername(),
                roleDTOs,
                addressDTOs
        );
    }

    //CRUD methods
    @Override
    @Transactional
    public UserResponseDTO register(UserRequestDTO userRequest) {
        if (userRepository.existsByUsername(userRequest.username())) {
            throw new RuntimeException("Este nombre de usuario ya existe");
        }
        if (userRepository.existsByEmail(userRequest.email())) {
            throw new RuntimeException("Este email ya existe");
        }

        User user = new User();
        user.setName(userRequest.name());
        user.setLastName(userRequest.lastName());
        user.setDateOfBirth(userRequest.dateOfBirth());
        user.setImage(userRequest.image());
        user.setEmail(userRequest.email());
        user.setUsername(userRequest.username());
        user.setPassword(passwordEncoder.encode(userRequest.password()));

        if (userRequest.roleIds() == null || userRequest.roleIds().isEmpty()) {
            throw new RuntimeException("Debe asignar al menos un rol al usuario");
        }

        List<Role> roles = userRequest.roleIds().stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + roleId)))
                .collect(Collectors.toList());

        user.setRoles(roles);

        if (userRequest.addresses() != null) {
            List<Addresses> addresses = userRequest.addresses().stream()
                    .map(addr -> {
                        Addresses a = new Addresses();
                        a.setAddress(addr.address());
                        a.setUser(user);
                        return a;
                    }).collect(Collectors.toList());
            user.setAddresses(addresses);
        }

        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }

    @Override
    public UserResponseDTO findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertToDTO(user);
    }

    @Override
    public UserResponseDTO findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertToDTO(user);
    }

    @Override
    public List<UserResponseDTO> findAll() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponseDTO update(Long id, UserRequestDTO userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setName(userRequest.name());
        user.setLastName(userRequest.lastName());
        user.setDateOfBirth(userRequest.dateOfBirth());
        user.setImage(userRequest.image());
        user.setEmail(userRequest.email());
        user.setUsername(userRequest.username());
        if (userRequest.password() != null && !userRequest.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(userRequest.password()));
        }

        // Reemplazar direcciones si vienen en la petición
        if (userRequest.addresses() != null) {
            user.getAddresses().clear();  // elimina las antiguas
            List<Addresses> newAddresses = userRequest.addresses().stream()
                    .map(dto -> {
                        Addresses a = new Addresses();
                        a.setAddress(dto.address());
                        a.setUser(user);
                        return a;
                    }).collect(Collectors.toList());
            user.getAddresses().addAll(newAddresses);
        }

        User updated = userRepository.save(user);
        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponseDTO assignRole(Long userId, String roleTitle) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Role role = roleRepository.findByTitle(roleTitle)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
        }
        User updated = userRepository.save(user);
        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public UserResponseDTO replaceAddresses(Long userId, List<AddressDTO> addressDTOs) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.getAddresses().clear();

        List<Addresses> newAddresses = addressDTOs.stream()
                .map(dto -> {
                    Addresses addr = new Addresses();
                    addr.setAddress(dto.address());
                    addr.setUser(user);
                    return addr;
                })
                .toList();
        user.getAddresses().addAll(newAddresses);

        User updated = userRepository.save(user);
        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public UserResponseDTO addAddress(Long userId, AddressDTO addressDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Addresses address = new Addresses();
        address.setAddress(addressDTO.address());
        address.setUser(user);
        user.getAddresses().add(address);
        User updated = userRepository.save(user);
        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public UserResponseDTO updateAddress(Long addressId, AddressDTO addressDTO) {
        Addresses address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
        address.setAddress(addressDTO.address());
        addressRepository.save(address);
        return convertToDTO(address.getUser());
    }

    @Override
    @Transactional
    public void deleteAddress(Long addressId) {
        Addresses address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
        addressRepository.delete(address);
    }
}