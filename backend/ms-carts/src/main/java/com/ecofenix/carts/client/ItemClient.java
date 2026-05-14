package com.ecofenix.carts.client;

import com.ecofenix.carts.model.dto.ItemDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-items")
public interface ItemClient {

    @GetMapping("/items/{id}")
    ItemDTO getItemById(@PathVariable("id") Long id);
}
