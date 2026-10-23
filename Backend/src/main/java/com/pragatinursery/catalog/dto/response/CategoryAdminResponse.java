package com.pragatinursery.catalog.dto.response;

import com.pragatinursery.common.enums.CategoryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAdminResponse {
    private Long id;
    private String nameEn;
    private String nameMr;
    private String name;
    private String slug;
    private String descriptionEn;
    private String descriptionMr;
    private String description;
    private String image;
    private CategoryStatus status;
    private long productCount;
    private Instant createdAt;
}
