package com.pragatinursery.catalog.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInfoRequest {

    @NotBlank(message = "Info label is required")
    private String label;

    @NotBlank(message = "Info value is required")
    private String value;
}
