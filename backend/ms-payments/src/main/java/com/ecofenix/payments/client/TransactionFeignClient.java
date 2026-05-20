package com.ecofenix.payments.client;

import com.ecofenix.payments.model.dto.OrderResponseDTO;
import com.ecofenix.payments.model.dto.UpdateOrderStatusRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "ms-transactions", url = "${transactions.service.url}")
public interface TransactionFeignClient {

    @GetMapping("/orders/{id}")
    OrderResponseDTO getOrderById(@PathVariable("id") Long id);

    @PutMapping("/orders/{id}/status")
    void updateOrderStatus(@PathVariable("id") Long id, @RequestBody UpdateOrderStatusRequestDTO statusRequest);
}