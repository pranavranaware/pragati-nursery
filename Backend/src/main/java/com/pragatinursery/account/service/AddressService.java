package com.pragatinursery.account.service;

import com.pragatinursery.account.dto.request.CreateAddressRequest;
import com.pragatinursery.account.dto.request.UpdateAddressRequest;
import com.pragatinursery.account.dto.response.AddressResponse;
import com.pragatinursery.auth.entity.User;

import java.util.List;

public interface AddressService {
    List<AddressResponse> getCustomerAddresses(User user);
    AddressResponse getAddressById(User user, Long id);
    AddressResponse createAddress(User user, CreateAddressRequest request);
    AddressResponse updateAddress(User user, Long id, UpdateAddressRequest request);
    AddressResponse setDefaultAddress(User user, Long id);
    void deleteAddress(User user, Long id);
}
