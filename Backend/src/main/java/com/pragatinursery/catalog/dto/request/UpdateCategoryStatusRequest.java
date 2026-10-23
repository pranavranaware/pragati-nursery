package com.pragatinursery.catalog.dto.request;

import com.pragatinursery.common.enums.CategoryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryStatusRequest {

    @NotNull(message = "Category status is required")
    private CategoryStatus status;
}
