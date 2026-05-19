package com.ecofenix.items.service.impl;

import com.ecofenix.items.model.dto.ImageResponseDTO;
import com.ecofenix.items.model.entity.Image;
import com.ecofenix.items.repository.ImageRepository;
import com.ecofenix.items.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ImageServiceImpl implements ImageService {

    @Autowired
    private ImageRepository imageRepository;

    private ImageResponseDTO convertToDTO(Image image) {
        return new ImageResponseDTO(image.getUrl());
    }

    @Override
    public List<ImageResponseDTO> getUrls(List<Image> images) {
        return images.stream().map(this::convertToDTO).toList();
    }

    @Override
    public List<Image> getImages(List<Long> imageIds) {
        return imageRepository.findAllById(imageIds);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada con id: " + id));

        if (image.getItem() != null && image.getItem().getImages() != null) {
            image.getItem().getImages().remove(image);
        }

        imageRepository.delete(image);
    }
}