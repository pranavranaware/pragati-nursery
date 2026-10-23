package com.pragatinursery.cart.dto.response;

import com.pragatinursery.common.enums.StockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long productId;
    private String productName;
    private String slug;
    private String image;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;
    private StockStatus stockStatus;
    private Integer stockQuantity;
}
