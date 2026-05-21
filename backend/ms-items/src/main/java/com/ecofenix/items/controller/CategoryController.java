package com.ecofenix.items.controller;

import com.ecofenix.items.model.dto.CategoryRequestDTO;
import com.ecofenix.items.model.dto.CategoryResponseDTO;
import com.ecofenix.items.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;


    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody @Valid CategoryRequestDTO dto) {
        try {
            CategoryResponseDTO created = categoryService.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/main")
    public ResponseEntity<List<CategoryResponseDTO>> getMainCategories() {
        List<CategoryResponseDTO> categories = categoryService.mainCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/sub/{parentId}")
    public ResponseEntity<List<CategoryResponseDTO>> getSubCategories(@PathVariable Long parentId) {
        List<CategoryResponseDTO> categories = categoryService.subCategories(parentId);
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody @Valid CategoryRequestDTO dto) {
        try {
            CategoryResponseDTO updated = categoryService.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}