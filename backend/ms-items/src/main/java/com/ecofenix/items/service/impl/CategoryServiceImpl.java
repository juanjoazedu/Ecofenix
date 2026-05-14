package com.ecofenix.items.service.impl;

import com.ecofenix.items.model.dto.CategoryRequestDTO;
import com.ecofenix.items.model.dto.CategoryResponseDTO;
import com.ecofenix.items.model.entity.Category;
import com.ecofenix.items.repository.CategoryRepository;
import com.ecofenix.items.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    //Suporting methods
    private void validateUniqueName(String name, Long excludeId) {
        boolean exists;
        if (excludeId == null) {
            exists = categoryRepository.existsByNameIgnoreCase(name);
        } else {
            exists = categoryRepository.existsByNameIgnoreCaseAndIdNot(name, excludeId);
        }
        if (exists) {
            throw new RuntimeException("Ya existe una categoría con el nombre: " + name);
        }
    }

    // Conversion methods
    private Category convertToEntity(CategoryRequestDTO dto) {
        Category category = new Category();
        category.setName(dto.name());

        if (dto.parentCategoryId() != null) {
            Category parent = categoryRepository.findById(dto.parentCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoría padre no encontrada con id: " + dto.parentCategoryId()));
            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }
        return category;
    }

    private CategoryResponseDTO convertToDTO(Category category) {
        Long parentId = (category.getParentCategory() != null)
                ? category.getParentCategory().getId()
                : null;
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                parentId
        );
    }

    // CRUD methods
    @Override
    @Transactional
    public CategoryResponseDTO create(CategoryRequestDTO dto) {
        validateUniqueName(dto.name(), null);
        Category category = convertToEntity(dto);
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    @Override
    public List<CategoryResponseDTO> mainCategories() {
        return categoryRepository.findByParentCategoryIsNull()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<CategoryResponseDTO> subCategories(Long parentId) {
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Categoría padre no encontrada con id: " + parentId));

        return categoryRepository.findByParentCategory(parent)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponseDTO update(Long id, CategoryRequestDTO dto) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + id));

        validateUniqueName(dto.name(), id);

        existingCategory.setName(dto.name());

        if (dto.parentCategoryId() != null) {
            if (dto.parentCategoryId().equals(id)) {
                throw new RuntimeException("Una categoría no puede ser padre de sí misma");
            }
            Category newParent = categoryRepository.findById(dto.parentCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoría padre no encontrada con id: " + dto.parentCategoryId()));
            existingCategory.setParentCategory(newParent);
        } else {
            existingCategory.setParentCategory(null);
        }

        Category updatedCategory = categoryRepository.save(existingCategory);
        return convertToDTO(updatedCategory);
    }
}