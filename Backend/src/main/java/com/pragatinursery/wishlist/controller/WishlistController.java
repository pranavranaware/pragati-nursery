package com.pragatinursery.wishlist.controller;

import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.security.CustomUserDetails;
import com.pragatinursery.wishlist.dto.request.AddToWishlistRequest;
import com.pragatinursery.wishlist.dto.response.WishlistExistsResponse;
import com.pragatinursery.wishlist.dto.response.WishlistResponse;
import com.pragatinursery.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlist(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        WishlistResponse wishlist = wishlistService.getWishlist(customUserDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved successfully", wishlist));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody AddToWishlistRequest request) {
        WishlistResponse wishlist = wishlistService.addToWishlist(customUserDetails.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to wishlist successfully", wishlist));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> removeFromWishlist(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long productId) {
        WishlistResponse wishlist = wishlistService.removeFromWishlist(customUserDetails.getUser(), productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from wishlist successfully", wishlist));
    }

    @GetMapping("/items/{productId}/exists")
    public ResponseEntity<ApiResponse<WishlistExistsResponse>> checkWishlistExists(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long productId) {
        WishlistExistsResponse response = wishlistService.checkWishlistExists(customUserDetails.getUser(), productId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist status checked successfully", response));
    }
}
