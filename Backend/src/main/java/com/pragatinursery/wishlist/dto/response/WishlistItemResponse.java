package com.pragatinursery.wishlist.dto.response;

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
public class WishlistItemResponse {
    private Long productId;
    private String name;
    private String slug;
    private String image;
    private BigDecimal price;
    private StockStatus stockStatus;
}
