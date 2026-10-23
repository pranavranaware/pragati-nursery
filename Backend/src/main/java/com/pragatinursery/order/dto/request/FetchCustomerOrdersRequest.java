package com.pragatinursery.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FetchCustomerOrdersRequest {

    @NotEmpty
    @Size(max = 50)
    @Valid
    private List<OrderRefDto> orders;
}
