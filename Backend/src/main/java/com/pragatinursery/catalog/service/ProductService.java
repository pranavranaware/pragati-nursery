package com.pragatinursery.catalog.service;

import com.pragatinursery.catalog.dto.request.CreateProductRequest;
import com.pragatinursery.catalog.dto.request.UpdateProductRequest;
import com.pragatinursery.catalog.dto.request.UpdateProductStatusRequest;
import com.pragatinursery.catalog.dto.request.UpdateProductStockRequest;
import com.pragatinursery.catalog.dto.response.ProductAdminResponse;
import com.pragatinursery.catalog.dto.response.ProductResponse;
import com.pragatinursery.catalog.dto.response.ProductSummaryResponse;
import com.pragatinursery.common.enums.StockStatus;
import com.pragatinursery.common.response.PagedResponse;

import java.math.BigDecimal;

public interface ProductService {
    // Public Customer Methods
    PagedResponse<ProductSummaryResponse> getPublicProducts(int page, int size, String search, String categorySlug, BigDecimal minPrice, BigDecimal maxPrice, String sort, String direction);
    ProductResponse getPublicProductBySlug(String slug);
    PagedResponse<ProductSummaryResponse> getPublicProductsByCategory(String categorySlug, int page, int size, String search, String sort, String direction);

    // Admin Methods
    PagedResponse<ProductAdminResponse> getAdminProducts(int page, int size, String search, String categorySlug, Boolean active, StockStatus stockStatus, String sort, String direction);
    ProductAdminResponse getAdminProductById(Long id);
    ProductAdminResponse createProduct(CreateProductRequest request);
    ProductAdminResponse updateProduct(Long id, UpdateProductRequest request);
    ProductAdminResponse updateProductStock(Long id, UpdateProductStockRequest request);
    ProductAdminResponse updateProductStatus(Long id, UpdateProductStatusRequest request);
    void deleteProduct(Long id);
}
