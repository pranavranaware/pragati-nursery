package com.pragatinursery.pincode.controller;

import com.pragatinursery.pincode.dto.PincodeResponse;
import com.pragatinursery.pincode.service.PincodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pincode")
@RequiredArgsConstructor
public class PincodeController {

    private final PincodeService pincodeService;

    @GetMapping("/{pincode}")
    public ResponseEntity<PincodeResponse> getPincodeDetails(@PathVariable String pincode) {
        PincodeResponse response = pincodeService.lookupPincode(pincode);
        return ResponseEntity.ok(response);
    }
}
