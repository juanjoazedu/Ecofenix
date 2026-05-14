package com.ecofenix.items.controller;

import com.ecofenix.items.model.dto.ItemRequestDTO;
import com.ecofenix.items.model.dto.ItemResponseDTO;
import com.ecofenix.items.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping("/test")
    public String test() {
        return "Running the ms-items!!!";
    }

    @PostMapping
    public ResponseEntity<?> registerItem(@RequestBody @Valid ItemRequestDTO dto) {
        try {
            ItemResponseDTO createdItem = itemService.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        List<ItemResponseDTO> items = itemService.findAll();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        try {
            ItemResponseDTO item = itemService.findById(id);
            return ResponseEntity.ok(item);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ItemResponseDTO>> getItemsBySeller(@PathVariable Long sellerId) {
        List<ItemResponseDTO> items = itemService.findBySeller(sellerId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getItemsByCategories(@RequestParam List<Long> categoryIds) {
        try {
            List<ItemResponseDTO> items = itemService.findByCategoryIds(categoryIds);
            return ResponseEntity.ok(items);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemResponseDTO>> searchItems(@RequestParam String query) {
        List<ItemResponseDTO> items = itemService.searchItems(query);
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id,  @RequestBody @Valid ItemRequestDTO dto) {
        try {
            ItemResponseDTO updatedItem = itemService.update(id, dto);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            itemService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}
