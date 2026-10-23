package com.pragatinursery.cart.service;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.cart.dto.request.AddToCartRequest;
import com.pragatinursery.cart.dto.request.UpdateCartItemRequest;
import com.pragatinursery.cart.dto.response.CartItemResponse;
import com.pragatinursery.cart.dto.response.CartResponse;
import com.pragatinursery.cart.entity.Cart;
import com.pragatinursery.cart.entity.CartItem;
import com.pragatinursery.cart.repository.CartItemRepository;
import com.pragatinursery.cart.repository.CartRepository;
import com.pragatinursery.catalog.entity.Product;
import com.pragatinursery.catalog.entity.ProductImage;
import com.pragatinursery.catalog.repository.ProductRepository;
import com.pragatinursery.common.enums.CategoryStatus;
import com.pragatinursery.common.enums.StockStatus;
import com.pragatinursery.common.exception.BadRequestException;
import com.pragatinursery.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(User user) {
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(User user, AddToCartRequest request) {
        Product product = validateAndGetProduct(request.getProductId());

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        int newQuantity = request.getQuantity();
        if (existingItemOpt.isPresent()) {
            newQuantity += existingItemOpt.get().getQuantity();
        }

        if (newQuantity > product.getStockQuantity()) {
            throw new BadRequestException("Requested quantity (" + newQuantity + ") exceeds available stock (" + product.getStockQuantity() + ").");
        }

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(newQuantity)
                    .build();
            cart.getItems().add(newItem);
            cartRepository.save(cart);
        }

        log.info("Added product ID {} (qty: {}) to cart for user {}", product.getId(), request.getQuantity(), user.getEmail());
        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    @Transactional
    public CartResponse updateCartItemQuantity(User user, Long productId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart is empty."));

        Product product = validateAndGetProduct(productId);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in your cart."));

        if (request.getQuantity() > product.getStockQuantity()) {
            throw new BadRequestException("Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + product.getStockQuantity() + ").");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        log.info("Updated product ID {} quantity to {} for user {}", productId, request.getQuantity(), user.getEmail());
        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(User user, Long productId) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart is empty."));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in your cart."));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        log.info("Removed product ID {} from cart for user {}", productId, user.getEmail());
        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    @Transactional
    public CartResponse clearCart(User user) {
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartItemRepository.deleteByCartId(cart.getId());
            log.info("Cleared cart for user {}", user.getEmail());
        }
        return mapToCartResponse(cart);
    }

    private Product validateAndGetProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.isActive()) {
            throw new BadRequestException("Product '" + product.getName() + "' is currently unavailable.");
        }

        if (product.getCategory().getStatus() != CategoryStatus.ACTIVE) {
            throw new BadRequestException("Product category is currently inactive.");
        }

        if (product.getStockStatus() == StockStatus.OUT_OF_STOCK || product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product '" + product.getName() + "' is currently out of stock.");
        }

        return product;
    }

    private CartResponse mapToCartResponse(Cart cart) {
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return CartResponse.builder()
                    .id(cart != null ? cart.getId() : null)
                    .items(new ArrayList<>())
                    .totalItems(0)
                    .subtotal(BigDecimal.ZERO)
                    .build();
        }

        List<CartItemResponse> itemResponses = new ArrayList<>();
        int totalItems = 0;
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            String primaryImageUrl = product.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .findFirst()
                    .map(ProductImage::getSrc)
                    .orElse(product.getImages().isEmpty() ? "" : product.getImages().get(0).getSrc());

            itemResponses.add(CartItemResponse.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .slug(product.getSlug())
                    .image(primaryImageUrl)
                    .unitPrice(unitPrice)
                    .quantity(item.getQuantity())
                    .lineTotal(lineTotal)
                    .stockStatus(product.getStockStatus())
                    .stockQuantity(product.getStockQuantity())
                    .build());

            totalItems += item.getQuantity();
            subtotal = subtotal.add(lineTotal);
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .build();
    }
}
