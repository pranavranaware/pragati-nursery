package com.pragatinursery.catalog.dto.request;

import com.pragatinursery.common.enums.VideoSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVideoRequest {
    private VideoSource source;
    private String url;
    private String thumbnail;
}
