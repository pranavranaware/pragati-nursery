package com.pragatinursery.catalog.dto.response;

import com.pragatinursery.common.enums.VideoSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVideoResponse {
    private Long id;
    private VideoSource source;
    private String url;
    private String thumbnail;
}
