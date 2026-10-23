package com.pragatinursery.common.controller;

import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.common.dto.request.UpdateBusinessSettingsRequest;
import com.pragatinursery.common.dto.response.BusinessSettingsResponse;
import com.pragatinursery.common.service.BusinessSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class BusinessSettingsController {

    private final BusinessSettingsService service;

    @GetMapping("/api/v1/settings/business")
    public ResponseEntity<ApiResponse<BusinessSettingsResponse>> getPublicBusinessSettings() {
        BusinessSettingsResponse settings = service.getSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @GetMapping("/api/v1/admin/settings/business")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BusinessSettingsResponse>> getAdminBusinessSettings() {
        BusinessSettingsResponse settings = service.getSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/api/v1/admin/settings/business")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BusinessSettingsResponse>> updateBusinessSettings(
            @Valid @RequestBody UpdateBusinessSettingsRequest request) {
        BusinessSettingsResponse updated = service.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.success("Business settings updated successfully", updated));
    }
}
