package com.pragatinursery.cart.controller;

import com.pragatinursery.cart.dto.request.AddToCartRequest;
import com.pragatinursery.cart.dto.request.UpdateCartItemRequest;
import com.pragatinursery.cart.dto.response.CartResponse;
import com.pragatinursery.cart.service.CartService;
import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        CartResponse cart = cartService.getCart(customUserDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addToCart(customUserDetails.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart successfully", cart));
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItemQuantity(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateCartItemQuantity(customUserDetails.getUser(), productId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated successfully", cart));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long productId) {
        CartResponse cart = cartService.removeCartItem(customUserDetails.getUser(), productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart successfully", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        CartResponse cart = cartService.clearCart(customUserDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", cart));
    }
}
