package com.pragatinursery.common.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBusinessSettingsRequest {

    @NotBlank(message = "Store name is required.")
    private String storeName;

    @NotBlank(message = "Phone number is required.")
    private String phone;

    @NotBlank(message = "Email address is required.")
    private String email;

    @NotBlank(message = "Address is required.")
    private String address;

    @DecimalMin(value = "0.0", message = "Delivery fee cannot be negative.")
    private BigDecimal deliveryFee;

    @NotNull(message = "Minimum order value is required.")
    @DecimalMin(value = "0.0", message = "Minimum order value cannot be negative.")
    private BigDecimal minOrderValue;

    @NotNull(message = "Maximum COD order value is required.")
    @DecimalMin(value = "0.0", message = "Maximum COD order value cannot be negative.")
    private BigDecimal maxCodValue;
}
