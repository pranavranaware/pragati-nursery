package com.pragatinursery.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCareResponse {
    private Long id;
    private String icon;
    private String label;
    private String labelEn;
    private String labelMr;
    private String value;
    private String valueEn;
    private String valueMr;
}
