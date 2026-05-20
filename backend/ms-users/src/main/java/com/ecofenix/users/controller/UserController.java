package com.ecofenix.users.controller;

import com.ecofenix.users.model.dto.AddressDTO;
import com.ecofenix.users.model.dto.UserRequestDTO;
import com.ecofenix.users.model.dto.UserResponseDTO;
import com.ecofenix.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRequestDTO request) {
        return new ResponseEntity<>(userService.register(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponseDTO> findByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.findByUsername(username));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }


    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Long id, @Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/roles/{roleTitle}")
    public ResponseEntity<UserResponseDTO> assignRole(@PathVariable Long userId, @PathVariable String roleTitle) {
        return ResponseEntity.ok(userService.assignRole(userId, roleTitle));
    }

    @PutMapping("/{userId}/addresses")
    public ResponseEntity<UserResponseDTO> replaceAddresses(
            @PathVariable Long userId,
            @RequestBody List<AddressDTO> addresses) {
        return ResponseEntity.ok(userService.replaceAddresses(userId, addresses));
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<UserResponseDTO> addAddress(
            @PathVariable Long userId,
            @RequestBody AddressDTO address) {
        return new ResponseEntity<>(userService.addAddress(userId, address), HttpStatus.CREATED);
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<UserResponseDTO> updateAddress(
            @PathVariable Long addressId,
            @RequestBody AddressDTO address) {
        return ResponseEntity.ok(userService.updateAddress(addressId, address));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        userService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }
}