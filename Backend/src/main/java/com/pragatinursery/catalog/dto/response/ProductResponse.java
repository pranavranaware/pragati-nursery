package com.pragatinursery.catalog.dto.response;

import com.pragatinursery.common.enums.StockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String sku;
    private String slug;
    private String nameEn;
    private String nameMr;
    private String name;
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
    private String stock; // 'In Stock', 'Low Stock', 'Out of Stock'
    private Integer stockQuantity;
    private StockStatus stockStatus; // 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
    private Double rating;
    private Integer reviewCount;
    private List<ProductImageResponse> images;
    private ProductVideoResponse video;
    private List<ProductInfoResponse> info;
    private List<ProductCareResponse> care;
}
