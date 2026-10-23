package com.pragatinursery.catalog.dto.request;

import com.pragatinursery.common.enums.CareIcon;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCareRequest {

    @NotNull(message = "Care icon is required")
    private CareIcon icon;

    private String label;
    private String labelEn;
    private String labelMr;

    private String value;
    private String valueEn;
    private String valueMr;
}
