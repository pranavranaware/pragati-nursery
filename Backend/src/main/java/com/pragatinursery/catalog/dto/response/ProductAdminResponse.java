package com.pragatinursery.catalog.dto.response;

import com.pragatinursery.common.enums.StockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAdminResponse {
    private Long id;
    private String sku;
    private String slug;
    private String nameEn;
    private String nameMr;
    private String name;
    private Long categoryId;
    private String categoryEn;
    private String categoryMr;
    private String category;
    private String categorySlug;
    private String descriptionEn;
    private String descriptionMr;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String badge;
    private String stock;
    private Integer stockQuantity;
    private StockStatus stockStatus;
    private Double rating;
    private Integer reviewCount;
    private boolean active;
    private List<ProductImageResponse> images;
    private ProductVideoResponse video;
    private List<ProductInfoResponse> info;
    private List<ProductCareResponse> care;
    private Instant createdAt;
    private Instant updatedAt;
}
