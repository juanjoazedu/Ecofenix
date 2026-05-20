package com.ecofenix.transactions.service;


import com.ecofenix.transactions.model.dto.OrderCreateRequestDTO;
import com.ecofenix.transactions.model.dto.OrderResponseDTO;
import com.ecofenix.transactions.model.dto.UpdateOrderStatusRequestDTO;

public interface OrderService {

    OrderResponseDTO createOrder(OrderCreateRequestDTO request);

    OrderResponseDTO findById(Long id);

    OrderResponseDTO updatePaymentAndShippingStatus(Long orderId, UpdateOrderStatusRequestDTO statusRequest);
}