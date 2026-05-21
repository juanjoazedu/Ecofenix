package com.ecofenix.items.service.impl;

import com.ecofenix.items.model.dto.ImageResponseDTO;
import com.ecofenix.items.model.dto.ItemRequestDTO;
import com.ecofenix.items.model.dto.ItemResponseDTO;
import com.ecofenix.items.model.entity.Category;
import com.ecofenix.items.model.entity.Image;
import com.ecofenix.items.model.entity.Item;
import com.ecofenix.items.model.enums.ItemStatus;
import com.ecofenix.items.repository.CategoryRepository;
import com.ecofenix.items.repository.ItemRepository;
import com.ecofenix.items.service.ImageService;
import com.ecofenix.items.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemServiceImpl implements ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ImageService imageService;

    // Conversion methods
    private Item convertToEntity(ItemRequestDTO dto) {
        List<Category> categories = validateAndGetCategories(dto.categoryIds());
        Item item = new Item();
        item.setTitle(dto.title());
        item.setDescription(dto.description());
        item.setPrice(dto.price());
        item.setStock(dto.stock());
        item.setShippingCost(dto.shippingCost());
        item.setItemType(dto.type());
        item.setItemStatus(dto.status());
        item.setSellerId(dto.sellerId());
        item.setCategories(categories);
        return item;
    }

    private ItemResponseDTO convertToDTO(Item item) {
        List<ImageResponseDTO> urlImages = imageService.getUrls(item.getImages());
        return new ItemResponseDTO(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getPrice(),
                item.getStock(),
                urlImages,
                item.getShippingCost(),
                item.getItemType(),
                item.getItemStatus(),
                item.getSellerId()
        );
    }

    private List<Image> createImagesFromUrls(Item item, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return new ArrayList<>();
        }
        return imageUrls.stream()
                .map(url -> {
                    Image image = new Image();
                    image.setUrl(url);
                    image.setItem(item);
                    return image;
                })
                .collect(Collectors.toList());
    }

    // Supporting methods
    private List<Category> validateAndGetCategories(List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            throw new RuntimeException("Debe seleccionar al menos una categoría");
        }
        List<Category> categories = categoryRepository.findAllById(categoryIds);
        if (categories.size() != categoryIds.size()) {
            List<Long> foundIds = categories.stream().map(Category::getId).toList();
            List<Long> missingIds = categoryIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new RuntimeException("Categorías no encontradas con IDs: " + missingIds);
        }
        return categories;
    }

    // CRUD methods
    @Override
    @Transactional
    public ItemResponseDTO create(ItemRequestDTO dto) {
        if (dto.price() < 0) {
            throw new RuntimeException("El precio debe ser mayor o igual a 0");
        }

        Item item = convertToEntity(dto);

        List<Image> images = createImagesFromUrls(item, dto.imageUrls());
        item.setImages(images);

        Item savedItem = itemRepository.save(item);
        return convertToDTO(savedItem);
    }

    @Override
    public List<ItemResponseDTO> findAll() {
        return itemRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public ItemResponseDTO findById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado con la id: " + id));
        return convertToDTO(item);
    }

    @Override
    public List<ItemResponseDTO> findBySeller(Long sellerId) {
        return itemRepository.findBySellerId(sellerId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<ItemResponseDTO> findByCategoryIds(List<Long> categoryIds) {
        return itemRepository.findByCategoryIds(categoryIds)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<ItemResponseDTO> searchItems(String query) {
        Pageable pageable = PageRequest.of(0, 10);
        return itemRepository.searchItems(query, pageable)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    @Transactional
    public ItemResponseDTO update(Long id, ItemRequestDTO dto) {
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado con la id: " + id));

        existingItem.setTitle(dto.title());
        existingItem.setDescription(dto.description());
        existingItem.setPrice(dto.price());
        existingItem.setStock(dto.stock());
        existingItem.setShippingCost(dto.shippingCost());
        existingItem.setItemStatus(dto.status());
        existingItem.setSellerId(dto.sellerId());

        List<Category> categories = validateAndGetCategories(dto.categoryIds());
        existingItem.setCategories(categories);

        List<Image> newImages = createImagesFromUrls(existingItem, dto.imageUrls());
        existingItem.getImages().clear();
        existingItem.getImages().addAll(newImages);

        Item updatedItem = itemRepository.save(existingItem);
        return convertToDTO(updatedItem);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado con la id: " + id));
        item.setItemStatus(ItemStatus.INACTIVE);
        itemRepository.save(item);
    }
}