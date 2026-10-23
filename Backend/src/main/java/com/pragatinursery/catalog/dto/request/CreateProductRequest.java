package com.pragatinursery.catalog.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "Product SKU is required")
    @Size(min = 2, max = 50, message = "SKU must be between 2 and 50 characters")
    private String sku;

    @NotBlank(message = "English product name is required")
    @Size(min = 2, max = 150, message = "English product name must be between 2 and 150 characters")
    private String nameEn;

    @NotBlank(message = "Marathi product name is required")
    @Size(min = 2, max = 150, message = "Marathi product name must be between 2 and 150 characters")
    private String nameMr;

    private String name;

    private String slug;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String descriptionEn;

    private String descriptionMr;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Original price cannot be negative")
    private BigDecimal originalPrice;

    private String badge;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private List<ProductImageRequest> images = new ArrayList<>();

    private ProductVideoRequest video;

    @Builder.Default
    private List<ProductInfoRequest> info = new ArrayList<>();

    @Builder.Default
    private List<ProductCareRequest> care = new ArrayList<>();
}
