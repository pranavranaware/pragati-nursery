package com.pragatinursery.wishlist.service;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.catalog.entity.Product;
import com.pragatinursery.catalog.entity.ProductImage;
import com.pragatinursery.catalog.repository.ProductRepository;
import com.pragatinursery.common.enums.CategoryStatus;
import com.pragatinursery.common.exception.BadRequestException;
import com.pragatinursery.common.exception.ResourceNotFoundException;
import com.pragatinursery.wishlist.dto.request.AddToWishlistRequest;
import com.pragatinursery.wishlist.dto.response.WishlistExistsResponse;
import com.pragatinursery.wishlist.dto.response.WishlistItemResponse;
import com.pragatinursery.wishlist.dto.response.WishlistResponse;
import com.pragatinursery.wishlist.entity.Wishlist;
import com.pragatinursery.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public WishlistResponse getWishlist(User user) {
        List<Wishlist> wishlists = wishlistRepository.findByUserId(user.getId());
        return mapToWishlistResponse(wishlists);
    }

    @Override
    @Transactional
    public WishlistResponse addToWishlist(User user, AddToWishlistRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product '" + product.getName() + "' is currently unavailable.");
        }

        if (product.getCategory().getStatus() != CategoryStatus.ACTIVE) {
            throw new BadRequestException("Product category is currently inactive.");
        }

        if (!wishlistRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            Wishlist item = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(item);
            log.info("Added product ID {} to wishlist for user {}", product.getId(), user.getEmail());
        }

        return getWishlist(user);
    }

    @Override
    @Transactional
    public WishlistResponse removeFromWishlist(User user, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in your wishlist."));

        wishlistRepository.delete(wishlist);
        log.info("Removed product ID {} from wishlist for user {}", productId, user.getEmail());

        return getWishlist(user);
    }

    @Override
    @Transactional(readOnly = true)
    public WishlistExistsResponse checkWishlistExists(User user, Long productId) {
        boolean exists = wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
        return WishlistExistsResponse.builder().exists(exists).build();
    }

    private WishlistResponse mapToWishlistResponse(List<Wishlist> wishlists) {
        List<WishlistItemResponse> items = wishlists.stream()
                .filter(w -> w.getProduct() != null && w.getProduct().isActive())
                .map(w -> {
                    Product p = w.getProduct();
                    String primaryImageUrl = p.getImages().stream()
                            .filter(ProductImage::isPrimary)
                            .findFirst()
                            .map(ProductImage::getSrc)
                            .orElse(p.getImages().isEmpty() ? "" : p.getImages().get(0).getSrc());

                    return WishlistItemResponse.builder()
                            .productId(p.getId())
                            .name(p.getName())
                            .slug(p.getSlug())
                            .image(primaryImageUrl)
                            .price(p.getPrice())
                            .stockStatus(p.getStockStatus())
                            .build();
                })
                .toList();

        return WishlistResponse.builder()
                .items(items)
                .build();
    }
}
