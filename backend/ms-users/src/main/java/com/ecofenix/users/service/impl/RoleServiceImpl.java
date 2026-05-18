package com.ecofenix.users.service.impl;

import com.ecofenix.users.model.entity.Role;
import com.ecofenix.users.repository.RoleRepository;
import com.ecofenix.users.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    private void validateTitleUniqueness(String title, Long excludeId) {
        roleRepository.findByTitle(title).ifPresent(role -> {
            if (excludeId == null || !role.getId().equals(excludeId)) {
                throw new RuntimeException("El título del rol ya existe: " + title);
            }
        });
    }

    @Override
    @Transactional
    public Role create(Role role) {
        if (role.getTitle() == null || role.getTitle().isBlank()) {
            throw new RuntimeException("El título del rol es obligatorio");
        }
        validateTitleUniqueness(role.getTitle(), null);
        return roleRepository.save(role);
    }

    @Override
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Override
    public Role findById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
    }

    @Override
    @Transactional
    public Role update(Long id, Role roleDetails) {
        Role existingRole = findById(id);
        if (roleDetails.getTitle() == null || roleDetails.getTitle().isBlank()) {
            throw new RuntimeException("El título del rol es obligatorio");
        }
        validateTitleUniqueness(roleDetails.getTitle(), id);
        existingRole.setTitle(roleDetails.getTitle());
        return roleRepository.save(existingRole);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Role role = findById(id);
        if (role.getUsers() != null && !role.getUsers().isEmpty()) {
            throw new RuntimeException("No se puede eliminar el rol porque tiene usuarios asociados");
        }
        roleRepository.delete(role);
    }
}