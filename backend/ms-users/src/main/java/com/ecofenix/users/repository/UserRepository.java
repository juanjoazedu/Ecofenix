package com.ecofenix.users.repository;

import com.ecofenix.users.model.entity.Role;
import com.ecofenix.users.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByRolesContaining(Role role);
}