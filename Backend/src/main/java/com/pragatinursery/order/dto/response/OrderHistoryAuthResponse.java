package com.pragatinursery.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistoryAuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private String mobile;
    @Builder.Default
    private long expiresInSeconds = 1800; // 30 minutes
}
