package com.ecofenix.users.service.impl;

import com.ecofenix.users.model.dto.RoleDTO;
import com.ecofenix.users.model.entity.Role;
import com.ecofenix.users.repository.RoleRepository;
import com.ecofenix.users.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public List<RoleDTO> findAll() {
        return roleRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RoleDTO findById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + id));
        return toDTO(role);
    }

    @Override
    @Transactional
    public RoleDTO create(RoleDTO dto) {
        if (roleRepository.findByTitle(dto.title()).isPresent()) {
            throw new RuntimeException("Ya existe un rol con el título: " + dto.title());
        }
        Role role = new Role();
        role.setTitle(dto.title());
        Role saved = roleRepository.save(role);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public RoleDTO update(Long id, RoleDTO dto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + id));

        roleRepository.findByTitle(dto.title())
                .ifPresent(r -> {
                    if (!r.getId().equals(id)) {
                        throw new RuntimeException("Ya existe un rol con el título: " + dto.title());
                    }
                });

        role.setTitle(dto.title());
        Role updated = roleRepository.save(role);
        return toDTO(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Role role = roleRepository.findByIdWithUsers(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + id));

        if (role.getUsers() != null && !role.getUsers().isEmpty()) {
            throw new RuntimeException(
                    String.format("No se puede eliminar el rol '%s' porque tiene %d usuario(s) asociado(s)",
                            role.getTitle(), role.getUsers().size())
            );
        }
        roleRepository.delete(role);
    }

    private RoleDTO toDTO(Role role) {
        return new RoleDTO(role.getId(), role.getTitle());
    }
}