package com.ecofenix.items.service;

import com.ecofenix.items.model.dto.ImageResponseDTO;
import com.ecofenix.items.model.entity.Image;

import java.util.List;

public interface ImageService {
    List<ImageResponseDTO> getUrls(List<Image> images);
    List<Image> getImages(List<Long> imageIds);
    void delete(Long id);
}
