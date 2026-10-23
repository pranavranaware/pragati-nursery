package com.pragatinursery.account.controller;

import com.pragatinursery.account.dto.request.CreateAddressRequest;
import com.pragatinursery.account.dto.request.UpdateAddressRequest;
import com.pragatinursery.account.dto.response.AddressResponse;
import com.pragatinursery.account.service.AddressService;
import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getCustomerAddresses(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        List<AddressResponse> addresses = addressService.getCustomerAddresses(customUserDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved successfully", addresses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody CreateAddressRequest request) {
        AddressResponse address = addressService.createAddress(customUserDetails.getUser(), request);
        return new ResponseEntity<>(ApiResponse.success("Address created successfully", address), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAddressRequest request) {
        AddressResponse address = addressService.updateAddress(customUserDetails.getUser(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", address));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long id) {
        AddressResponse address = addressService.setDefaultAddress(customUserDetails.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long id) {
        addressService.deleteAddress(customUserDetails.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
}
