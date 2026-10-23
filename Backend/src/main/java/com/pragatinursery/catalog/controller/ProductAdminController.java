package com.pragatinursery.catalog.controller;

import com.pragatinursery.catalog.dto.request.CreateProductRequest;
import com.pragatinursery.catalog.dto.request.UpdateProductRequest;
import com.pragatinursery.catalog.dto.request.UpdateProductStatusRequest;
import com.pragatinursery.catalog.dto.request.UpdateProductStockRequest;
import com.pragatinursery.catalog.dto.response.ProductAdminResponse;
import com.pragatinursery.catalog.service.ProductService;
import com.pragatinursery.common.enums.StockStatus;
import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.common.response.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ProductAdminController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductAdminResponse>>> getAdminProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) StockStatus stockStatus,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        PagedResponse<ProductAdminResponse> response = productService.getAdminProducts(page, size, search, category, active, stockStatus, sort, direction);
        return ResponseEntity.ok(ApiResponse.success("Admin products retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductAdminResponse>> getAdminProductById(@PathVariable Long id) {
        ProductAdminResponse product = productService.getAdminProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductAdminResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        ProductAdminResponse product = productService.createProduct(request);
        return new ResponseEntity<>(ApiResponse.success("Product created successfully", product), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductAdminResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductAdminResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<ProductAdminResponse>> updateProductStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductStockRequest request) {
        ProductAdminResponse product = productService.updateProductStock(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product stock updated successfully", product));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductAdminResponse>> updateProductStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductStatusRequest request) {
        ProductAdminResponse product = productService.updateProductStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product status updated successfully", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}
