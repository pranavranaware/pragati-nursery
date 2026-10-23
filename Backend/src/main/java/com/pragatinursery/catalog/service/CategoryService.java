package com.pragatinursery.catalog.service;

import com.pragatinursery.catalog.dto.request.CreateCategoryRequest;
import com.pragatinursery.catalog.dto.request.UpdateCategoryRequest;
import com.pragatinursery.catalog.dto.request.UpdateCategoryStatusRequest;
import com.pragatinursery.catalog.dto.response.CategoryAdminResponse;
import com.pragatinursery.catalog.dto.response.CategoryResponse;
import com.pragatinursery.common.enums.CategoryStatus;
import com.pragatinursery.common.response.PagedResponse;

import java.util.List;

public interface CategoryService {
    // Public Customer Methods
    List<CategoryResponse> getPublicCategories();
    CategoryResponse getPublicCategoryBySlug(String slug);

    // Admin Methods
    PagedResponse<CategoryAdminResponse> getAdminCategories(int page, int size, String search, CategoryStatus status, String sort, String direction);
    CategoryAdminResponse createCategory(CreateCategoryRequest request);
    CategoryAdminResponse updateCategory(Long id, UpdateCategoryRequest request);
    CategoryAdminResponse updateCategoryStatus(Long id, UpdateCategoryStatusRequest request);
    void deleteCategory(Long id);
}
