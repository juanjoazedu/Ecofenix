package com.ecofenix.carts.service.impl;

import com.ecofenix.carts.client.ItemClient;
import com.ecofenix.carts.model.dto.CartItemResponseDTO;
import com.ecofenix.carts.model.dto.ItemRequestDTO;
import com.ecofenix.carts.model.dto.CartResponseDTO;
import com.ecofenix.carts.model.dto.ItemResponseDTO;
import com.ecofenix.carts.model.entity.Cart;
import com.ecofenix.carts.model.entity.CartItem;
import com.ecofenix.carts.repository.CartRepository;
import com.ecofenix.carts.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ItemClient itemClient;

    //Supporting methods
    @Transactional
    public Cart getOrCreateCart(Long customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomerId(customerId);
                    newCart.setSubtotalItems(0.0);
                    newCart.setSubtotalShipping(0.0);
                    newCart.setTotal(0.0);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });
    }

    private void recalculateCartTotals(Cart cart) {
        double subtotalItems = cart.getItems().stream()
                .mapToDouble(CartItem::getTotalPrice)
                .sum();
        double subtotalShipping = cart.getItems().stream()
                .mapToDouble(i -> i.getShippingCost() * i.getQuantity())
                .sum();
        cart.setSubtotalItems(subtotalItems);
        cart.setSubtotalShipping(subtotalShipping);
        cart.setTotal(subtotalItems + subtotalShipping);
    }

    public CartResponseDTO convertToDTO(Cart cart) {
        List<CartItemResponseDTO> cartItems = cart.getItems().stream()
                .map(cartItem -> {
                    ItemResponseDTO item = itemClient.getItemById(cartItem.getItemId());
                    return new CartItemResponseDTO(
                            cartItem.getItemId(),
                            item.title(),
                            cartItem.getQuantity(),
                            cartItem.getUnitPrice(),
                            cartItem.getTotalPrice(),
                            item.shippingCost() * cartItem.getQuantity()
                    );
                })
                .collect(Collectors.toList());

        return new CartResponseDTO(
                cart.getSubtotalItems(),
                cart.getSubtotalShipping(),
                cart.getSubtotalItems() + cart.getSubtotalShipping(),
                cartItems,
                cart.getCustomerId()
        );
    }

    // CRUR methods
    @Override
    @Transactional
    public void addItemToCart(ItemRequestDTO dto) {
        if (dto.customerId() == null || dto.itemId() == null || dto.quantity() == null || dto.quantity() <= 0) {
            throw new RuntimeException("Datos inválidos para agregar al carrito");
        }

        Cart cart = getOrCreateCart(dto.customerId());
        ItemResponseDTO item = itemClient.getItemById(dto.itemId());

        if (item == null) {
            throw new RuntimeException("Artículo no encontrado con la id: " + dto.itemId());
        }

        CartItem cartItem = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(dto.itemId()))
                .findFirst()
                .orElse(null);

        int newTotalQuantity = dto.quantity();
        if (cartItem != null) {
            newTotalQuantity = cartItem.getQuantity() + dto.quantity();
        }

        if (item.stock() < newTotalQuantity) {
            throw new RuntimeException("Stock insuficiente. Stock disponible: " + item.stock());
        }

        if (cartItem == null) {
            cartItem = new CartItem();
            cartItem.setItemId(dto.itemId());
            cartItem.setCart(cart);
            cart.getItems().add(cartItem);
        }

        cartItem.setQuantity(newTotalQuantity);
        cartItem.setUnitPrice(item.price());
        cartItem.setShippingCost(item.shippingCost());
        cartItem.setTotalPrice(item.price() * newTotalQuantity);

        recalculateCartTotals(cart);
        cartRepository.save(cart);
    }

    @Override
    public CartResponseDTO getCart(Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        return convertToDTO(cart);
    }

    @Override
    @Transactional
    public void updateItemQuantity(ItemRequestDTO dto) {
        if (dto.customerId() == null || dto.itemId() == null || dto.quantity() == null || dto.quantity() <= 0) {
            throw new RuntimeException("Datos inválidos para agregar al carrito");
        }

        Cart cart = getOrCreateCart(dto.customerId());
        CartItem cartItem = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(dto.itemId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado en el carrito"));

        if (dto.quantity() <= 0) {
            removeItemFromCart(dto.customerId(), dto.itemId());
            return;
        }

        ItemResponseDTO item = itemClient.getItemById(dto.itemId());
        if (item.stock() < dto.quantity()) {
            throw new RuntimeException("Stock insuficiente");
        }

        cartItem.setQuantity(dto.quantity());
        cartItem.setUnitPrice(item.price());
        cartItem.setShippingCost(item.shippingCost());
        cartItem.setTotalPrice(item.price() * dto.quantity());

        recalculateCartTotals(cart);
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void removeItemFromCart(Long customerId, Long itemId) {
        Cart cart = getOrCreateCart(customerId);
        CartItem toRemove = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        cart.getItems().remove(toRemove);
        recalculateCartTotals(cart);
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void emptyCart(Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        cart.getItems().clear();
        recalculateCartTotals(cart);
        cartRepository.save(cart);
    }
}