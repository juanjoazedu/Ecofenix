package com.ecofenix.items.service;

import com.ecofenix.items.model.dto.CategoryRequestDTO;
import com.ecofenix.items.model.dto.CategoryResponseDTO;

import java.util.List;

public interface CategoryService {
    CategoryResponseDTO create(CategoryRequestDTO dto);
    List<CategoryResponseDTO> mainCategories();
    List<CategoryResponseDTO> subCategories(Long parentCategoryId);
    CategoryResponseDTO update(Long id, CategoryRequestDTO dto);
}
