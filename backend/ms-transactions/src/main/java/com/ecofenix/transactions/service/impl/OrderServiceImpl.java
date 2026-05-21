package com.ecofenix.transactions.service.impl;

import com.ecofenix.transactions.client.CartFeignClient;
import com.ecofenix.transactions.model.dto.*;
import com.ecofenix.transactions.model.entity.Order;
import com.ecofenix.transactions.model.entity.OrderItem;
import com.ecofenix.transactions.model.enums.PaymentStatus;
import com.ecofenix.transactions.model.enums.ShippingState;
import com.ecofenix.transactions.repository.OrderItemRepository;
import com.ecofenix.transactions.repository.OrderRepository;
import com.ecofenix.transactions.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartFeignClient cartFeignClient;

    // Conversion methods
    private Order convertToEntity(OrderCreateRequestDTO request, CartResponseDTO cart, List<OrderItem> items) {
        Order order = new Order();
        order.setSubtotalItems(cart.subtotalItems());
        order.setSubtotalShipping(cart.subtotalShipping());
        order.setTotal(cart.total());
        order.setAddress(request.address());
        order.setAddInfo(request.addInfo());
        order.setCustomerId(request.customerId());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setShippingState(ShippingState.PENDING);
        order.setItems(items);
        return order;
    }

    private List<OrderItem> createOrderItems(Order order, CartResponseDTO cart) {
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemDTO cartItem : cart.items()) {
            OrderItem item = new OrderItem();
            item.setQuantity(cartItem.quantity());
            item.setUnitPrice(cartItem.unitPrice());
            item.setShippingCost(cartItem.shippingCost());
            item.setTotalPrice(cartItem.totalPrice());
            item.setItemId(cartItem.itemId());
            item.setOrder(order);
            orderItems.add(item);
        }
        return orderItems;
    }

    private OrderResponseDTO convertToDTO(Order order) {
        List<OrderItemResponseDTO> itemDTOs = order.getItems().stream()
                .map(item -> new OrderItemResponseDTO(
                        item.getId(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getShippingCost(),
                        item.getTotalPrice(),
                        item.getItemId()
                ))
                .toList();

        return new OrderResponseDTO(
                order.getId(),
                order.getSubtotalItems(),
                order.getSubtotalShipping(),
                order.getTotal(),
                order.getAddress(),
                order.getAddInfo(),
                order.getPaymentStatus(),
                order.getShippingState(),
                order.getCustomerId(),
                itemDTOs,
                order.getLastModifiedAt()
        );
    }

    // Supporting methods
    private void validateCreateRequest(OrderCreateRequestDTO request) {
        if (request.customerId() == null || request.customerId() <= 0) {
            throw new RuntimeException("Customer ID inválido");
        }
        if (request.address() == null || request.address().isBlank()) {
            throw new RuntimeException("La dirección es obligatoria");
        }
    }

    // CRUD methods
    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderCreateRequestDTO request) {
        validateCreateRequest(request);

        CartResponseDTO cart = cartFeignClient.getCart(request.customerId());
        if (cart == null || cart.items() == null || cart.items().isEmpty()) {
            throw new RuntimeException("El carrito está vacío, no se puede crear la orden");
        }

        Order order = new Order();
        order.setSubtotalItems(cart.subtotalItems());
        order.setSubtotalShipping(cart.subtotalShipping());
        order.setTotal(cart.total());
        order.setAddress(request.address());
        order.setAddInfo(request.addInfo());
        order.setCustomerId(request.customerId());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setShippingState(ShippingState.PENDING);
        order.setItems(new ArrayList<>());

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = createOrderItems(savedOrder, cart);
        for (OrderItem item : orderItems) {
            orderItemRepository.save(item);
        }
        savedOrder.setItems(orderItems);

        return convertToDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO findById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con id: " + id));
        return convertToDTO(order);
    }

    @Override
    @Transactional
    public OrderResponseDTO updatePaymentAndShippingStatus(Long orderId, UpdateOrderStatusRequestDTO statusRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con id: " + orderId));

        order.setPaymentStatus(statusRequest.paymentStatus());
        order.setShippingState(statusRequest.shippingState());

        if (statusRequest.paymentStatus() == PaymentStatus.COMPLETED || statusRequest.paymentStatus() == PaymentStatus.PARTIAL) {
            try {
                cartFeignClient.emptyCart(order.getCustomerId());
            } catch (Exception e) {
                throw new RuntimeException("Error al vaciar el carrito: " + e.getMessage());
            }
        }

        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }
}