package com.pragatinursery.wishlist.service;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.wishlist.dto.request.AddToWishlistRequest;
import com.pragatinursery.wishlist.dto.response.WishlistExistsResponse;
import com.pragatinursery.wishlist.dto.response.WishlistResponse;

public interface WishlistService {
    WishlistResponse getWishlist(User user);
    WishlistResponse addToWishlist(User user, AddToWishlistRequest request);
    WishlistResponse removeFromWishlist(User user, Long productId);
    WishlistExistsResponse checkWishlistExists(User user, Long productId);
}
