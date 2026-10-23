package com.pragatinursery.pincode.service;

import com.pragatinursery.pincode.dto.PincodeResponse;

public interface PincodeService {
    PincodeResponse lookupPincode(String pincode);
}
