package com.ecofenix.carts.service.impl;

import com.ecofenix.carts.client.ItemClient;
import com.ecofenix.carts.model.dto.ItemDTO;
import com.ecofenix.carts.model.entity.Cart;
import com.ecofenix.carts.model.entity.CartItem;
import com.ecofenix.carts.repository.CartRepository;
import com.ecofenix.carts.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ItemClient itemClient;

    @Transactional
    public Cart getOrCreateCart(Long customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomerId(customerId);
                    newCart.setSubtotalItems(0.0);
                    newCart.setSubtotalShipping(0.0);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });
    }

    @Override
    @Transactional
    public void addItemToCart(Long customerId, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(customerId);
        ItemDTO item = itemClient.getItemById(itemId);

        if (item == null) {
            throw new RuntimeException("Artículo no encontrado con la id: " + itemId);
        }
        if (item.stock() < quantity) {
            throw new RuntimeException("Stock insuficiente");

        }

        CartItem cartItem = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(itemId))
                .findFirst().orElse(null);

        if (cartItem == null) {
            cartItem = new CartItem();
            cartItem.setItemId(itemId);
            cartItem.setCart(cart);
            cart.getItems().add(cartItem);
        }

        cartItem.setQuantity(quantity);
        cartItem.setUnitPrice(item.price());
        cartItem.setTotalPrice(item.price() * quantity);

        double subtotalItems = cart.getItems().stream()
                .mapToDouble(CartItem::getTotalPrice)
                .sum();
        double subtotalShipping = cart.getItems().stream()
                .mapToDouble(i -> item.shippingCost() * i.getQuantity())
                .sum();

        cart.setSubtotalItems(subtotalItems);
        cart.setSubtotalShipping(subtotalShipping);

        cartRepository.save(cart);
    }
}
