package com.ecofenix.items.service;


import com.ecofenix.items.model.dto.ItemRequestDTO;
import com.ecofenix.items.model.dto.ItemResponseDTO;

import java.util.List;

public interface ItemService {
    ItemResponseDTO create(ItemRequestDTO dto);
    List<ItemResponseDTO> findAll();
    ItemResponseDTO findById(Long id);
    List<ItemResponseDTO> findBySeller(Long sellerId);
    List<ItemResponseDTO> findByCategoryIds(List<Long> categoryIds);
    List<ItemResponseDTO> searchItems(String query);
    ItemResponseDTO update(Long id, ItemRequestDTO dto);
    void delete(Long id);
}
