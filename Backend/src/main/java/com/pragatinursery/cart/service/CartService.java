package com.pragatinursery.cart.service;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.cart.dto.request.AddToCartRequest;
import com.pragatinursery.cart.dto.request.UpdateCartItemRequest;
import com.pragatinursery.cart.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(User user);
    CartResponse addToCart(User user, AddToCartRequest request);
    CartResponse updateCartItemQuantity(User user, Long productId, UpdateCartItemRequest request);
    CartResponse removeCartItem(User user, Long productId);
    CartResponse clearCart(User user);
}
