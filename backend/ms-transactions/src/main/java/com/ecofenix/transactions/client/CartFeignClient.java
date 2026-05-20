package com.ecofenix.transactions.client;

import com.ecofenix.transactions.model.dto.CartResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-carts")
public interface CartFeignClient {

    @GetMapping("/carts/{customerId}")
    CartResponseDTO getCart(@PathVariable("customerId") Long customerId);

    @DeleteMapping("/carts/{customerId}/empty")
    void emptyCart(@PathVariable("customerId") Long customerId);
}