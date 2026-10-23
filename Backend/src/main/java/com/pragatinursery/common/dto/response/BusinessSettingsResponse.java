package com.pragatinursery.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessSettingsResponse {
    private String storeName;
    private String phone;
    private String email;
    private String address;
    private BigDecimal deliveryFee;
    private BigDecimal minOrderValue;
    private BigDecimal maxCodValue;
    private Instant updatedAt;
}
