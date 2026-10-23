package com.pragatinursery.account.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private String fullName;
    private String mobile;
    private String email;
    private String address;
    private String area;
    private String city;
    private String district;
    private String state;
    private String pincode;
    private String landmark;
    private boolean isDefault;
}
