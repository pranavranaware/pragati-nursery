package com.pragatinursery.pincode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PincodeResponse {
    private boolean success;
    private String pincode;
    private String state;
    private String district;
    private String city;
    private List<String> localities;
    private String errorMessage;
}
