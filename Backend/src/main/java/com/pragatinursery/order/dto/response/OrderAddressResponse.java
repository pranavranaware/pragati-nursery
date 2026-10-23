package com.pragatinursery.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderAddressResponse {
    private String fullName;
    private String mobile;
    private String email;
    private String address;
    private String city;
    private String district;
    private String state;
    private String pincode;
    private String landmark;
}
