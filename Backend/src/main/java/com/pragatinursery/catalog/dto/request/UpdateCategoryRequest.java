package com.pragatinursery.catalog.dto.request;

import com.pragatinursery.common.enums.CategoryStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryRequest {

    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String nameEn;

    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String nameMr;

    private String name;

    @Size(max = 100, message = "Slug cannot exceed 100 characters")
    private String slug;

    private String descriptionEn;
    private String descriptionMr;
    private String description;

    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String image;

    private CategoryStatus status;
}
