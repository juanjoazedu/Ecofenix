package com.ecofenix.users.service;

import com.ecofenix.users.model.entity.Role;
import java.util.List;

public interface RoleService {
    Role create(Role role);
    Role update(Long id, Role role);
    void delete(Long id);
    Role findById(Long id);
    List<Role> findAll();
}