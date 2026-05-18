package com.ecofenix.users.service.impl;

import com.ecofenix.users.model.dto.UserRequestDTO;
import com.ecofenix.users.model.dto.UserResponseDTO;
import com.ecofenix.users.model.entity.Addresses;
import com.ecofenix.users.model.entity.Role;
import com.ecofenix.users.model.entity.User;
import com.ecofenix.users.repository.RoleRepository;
import com.ecofenix.users.repository.UserRepository;
import com.ecofenix.users.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Conversion methods

    private User convertToEntity(UserRequestDTO dto) {
        User user = new User();
        user.setName(dto.name());
        user.setLastName(dto.lastName());
        user.setDateOfBirth(dto.dateOfBirth());
        user.setImage(dto.image());
        user.setEmail(dto.email());
        user.setUsername(dto.username());
        user.setPassword(passwordEncoder.encode(dto.password()));

        if (dto.roleIds() != null && !dto.roleIds().isEmpty()) {
            List<Role> roles = validateAndGetRoles(dto.roleIds());
            user.setRoles(roles);
        }
        return user;
    }

    private UserResponseDTO convertToDTO(User user) {
        List<String> roleTitles = user.getRoles().stream()
                .map(Role::getTitle)
                .toList();

        List<String> addressStrings = user.getAddresses().stream()
                .map(Addresses::getAddress)
                .toList();

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getLastName(),
                user.getDateOfBirth(),
                user.getImage(),
                user.getEmail(),
                user.getUsername(),
                roleTitles,
                addressStrings
        );
    }

    private List<Addresses> createAddressesFromStrings(User user, List<String> addressStrings) {
        if (addressStrings == null || addressStrings.isEmpty()) {
            return new ArrayList<>();
        }
        List<Addresses> addresses = new ArrayList<>();
        for (String addrText : addressStrings) {
            Addresses address = new Addresses();
            address.setAddress(addrText);
            address.setUser(user);
            addresses.add(address);
        }
        return addresses;
    }

    // Validation methods

    private List<Role> validateAndGetRoles(List<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            throw new RuntimeException("Debe seleccionar al menos un rol");
        }
        List<Role> roles = roleRepository.findAllById(roleIds);
        if (roles.size() != roleIds.size()) {
            List<Long> foundIds = roles.stream().map(Role::getId).toList();
            List<Long> missingIds = roleIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new RuntimeException("Roles no encontrados con IDs: " + missingIds);
        }
        return roles;
    }

    private void validateEmailUniqueness(String email, Long excludeUserId) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (excludeUserId == null || !user.getId().equals(excludeUserId)) {
                throw new RuntimeException("El email ya está registrado: " + email);
            }
        });
    }

    private void validateUsernameUniqueness(String username, Long excludeUserId) {
        userRepository.findByUsername(username).ifPresent(user -> {
            if (excludeUserId == null || !user.getId().equals(excludeUserId)) {
                throw new RuntimeException("El nombre de usuario ya está registrado: " + username);
            }
        });
    }

    // CRUD methods

    @Override
    @Transactional
    public UserResponseDTO create(UserRequestDTO dto) {
        if (dto.email() == null || dto.email().isBlank())
            throw new RuntimeException("El email es obligatorio");
        if (dto.username() == null || dto.username().isBlank())
            throw new RuntimeException("El nombre de usuario es obligatorio");
        if (dto.password() == null || dto.password().length() < 6)
            throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");

        validateEmailUniqueness(dto.email(), null);
        validateUsernameUniqueness(dto.username(), null);

        User user = convertToEntity(dto);
        List<Addresses> addresses = createAddressesFromStrings(user, dto.addresses());
        user.setAddresses(addresses);

        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }

    @Override
    public List<UserResponseDTO> findAll() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public UserResponseDTO findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        return convertToDTO(user);
    }

    @Override
    public List<UserResponseDTO> findByRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + roleId));
        return userRepository.findByRolesContaining(role).stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    @Transactional
    public UserResponseDTO update(Long id, UserRequestDTO dto) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        validateEmailUniqueness(dto.email(), id);
        validateUsernameUniqueness(dto.username(), id);

        existing.setName(dto.name());
        existing.setLastName(dto.lastName());
        existing.setDateOfBirth(dto.dateOfBirth());
        existing.setImage(dto.image());
        existing.setEmail(dto.email());
        existing.setUsername(dto.username());
        if (dto.password() != null && !dto.password().isBlank()) {
            existing.setPassword(passwordEncoder.encode(dto.password()));
        }

        if (dto.roleIds() != null) {
            List<Role> roles = validateAndGetRoles(dto.roleIds());
            existing.getRoles().clear();
            existing.getRoles().addAll(roles);
        }

        if (dto.addresses() != null) {
            existing.getAddresses().clear();
            List<Addresses> newAddresses = createAddressesFromStrings(existing, dto.addresses());
            existing.getAddresses().addAll(newAddresses);
        }

        User updated = userRepository.save(existing);
        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponseDTO assignRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + roleId));

        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            if (!role.getUsers().contains(user)) {
                role.getUsers().add(user);
            }
        }
        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public UserResponseDTO removeRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + roleId));

        user.getRoles().remove(role);
        role.getUsers().remove(user);
        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }
}