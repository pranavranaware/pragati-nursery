package com.pragatinursery.catalog.controller;

import com.pragatinursery.catalog.dto.response.ProductResponse;
import com.pragatinursery.catalog.dto.response.ProductSummaryResponse;
import com.pragatinursery.catalog.service.ProductService;
import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductPublicController {

    private final ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductSummaryResponse>>> getPublicProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        PagedResponse<ProductSummaryResponse> response = productService.getPublicProducts(page, size, search, category, minPrice, maxPrice, sort, direction);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", response));
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getPublicProductBySlug(@PathVariable String slug) {
        ProductResponse response = productService.getPublicProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", response));
    }

    @GetMapping("/categories/{slug}/products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductSummaryResponse>>> getPublicProductsByCategory(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        PagedResponse<ProductSummaryResponse> response = productService.getPublicProductsByCategory(slug, page, size, search, sort, direction);
        return ResponseEntity.ok(ApiResponse.success("Category products retrieved successfully", response));
    }
}
