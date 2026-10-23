package com.pragatinursery.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRefDto {

    @NotBlank
    private String orderNumber;

    @NotBlank
    private String token;
}
