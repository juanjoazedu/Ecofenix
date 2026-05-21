package com.ecofenix.users.repository;

import com.ecofenix.users.model.entity.Addresses;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Addresses, Long> {
}