package com.ecofenix.users.config;

import com.ecofenix.users.model.entity.Role;
import com.ecofenix.users.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {

        if (roleRepository.findByTitle("SELLER").isEmpty()) {
            Role seller = new Role();
            seller.setTitle("SELLER");
            roleRepository.save(seller);
        }

        if (roleRepository.findByTitle("CUSTOMER").isEmpty()) {
            Role customer = new Role();
            customer.setTitle("CUSTOMER");
            roleRepository.save(customer);
        }
    }
}