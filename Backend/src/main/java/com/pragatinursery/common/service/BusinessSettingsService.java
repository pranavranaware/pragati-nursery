package com.pragatinursery.common.service;

import com.pragatinursery.common.dto.request.UpdateBusinessSettingsRequest;
import com.pragatinursery.common.dto.response.BusinessSettingsResponse;

public interface BusinessSettingsService {
    BusinessSettingsResponse getSettings();
    BusinessSettingsResponse updateSettings(UpdateBusinessSettingsRequest request);
}
