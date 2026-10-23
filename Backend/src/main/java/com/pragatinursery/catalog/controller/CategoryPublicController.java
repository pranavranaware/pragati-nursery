package com.pragatinursery.catalog.controller;

import com.pragatinursery.catalog.dto.response.CategoryResponse;
import com.pragatinursery.catalog.service.CategoryService;
import com.pragatinursery.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryPublicController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getPublicCategories() {
        List<CategoryResponse> categories = categoryService.getPublicCategories();
        return ResponseEntity.ok(ApiResponse.success("Active categories retrieved successfully", categories));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getPublicCategoryBySlug(@PathVariable String slug) {
        CategoryResponse category = categoryService.getPublicCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }
}
