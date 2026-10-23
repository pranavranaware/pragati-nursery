package com.pragatinursery.catalog.controller;

import com.pragatinursery.catalog.dto.request.CreateCategoryRequest;
import com.pragatinursery.catalog.dto.request.UpdateCategoryRequest;
import com.pragatinursery.catalog.dto.request.UpdateCategoryStatusRequest;
import com.pragatinursery.catalog.dto.response.CategoryAdminResponse;
import com.pragatinursery.catalog.service.CategoryService;
import com.pragatinursery.common.enums.CategoryStatus;
import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.common.response.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class CategoryAdminController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CategoryAdminResponse>>> getAdminCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CategoryStatus status,
            @RequestParam(defaultValue = "name") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        PagedResponse<CategoryAdminResponse> response = categoryService.getAdminCategories(page, size, search, status, sort, direction);
        return ResponseEntity.ok(ApiResponse.success("Admin categories retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryAdminResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryAdminResponse category = categoryService.createCategory(request);
        return new ResponseEntity<>(ApiResponse.success("Category created successfully", category), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryAdminResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryAdminResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CategoryAdminResponse>> updateCategoryStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryStatusRequest request) {
        CategoryAdminResponse category = categoryService.updateCategoryStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category status updated successfully", category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
