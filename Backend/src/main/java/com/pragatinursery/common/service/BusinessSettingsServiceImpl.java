package com.pragatinursery.common.service;

import com.pragatinursery.common.dto.request.UpdateBusinessSettingsRequest;
import com.pragatinursery.common.dto.response.BusinessSettingsResponse;
import com.pragatinursery.common.entity.BusinessSettings;
import com.pragatinursery.common.repository.BusinessSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BusinessSettingsServiceImpl implements BusinessSettingsService {

    private final BusinessSettingsRepository repository;

    @Override
    @Transactional(readOnly = true)
    public BusinessSettingsResponse getSettings() {
        BusinessSettings settings = getOrCreateSettings();
        return mapToResponse(settings);
    }

    @Override
    @Transactional
    public BusinessSettingsResponse updateSettings(UpdateBusinessSettingsRequest request) {
        BusinessSettings settings = getOrCreateSettings();
        settings.setStoreName(request.getStoreName());
        settings.setPhone(request.getPhone());
        settings.setEmail(request.getEmail());
        settings.setAddress(request.getAddress());
        if (request.getDeliveryFee() != null) settings.setDeliveryFee(request.getDeliveryFee());
        settings.setMinOrderValue(request.getMinOrderValue());
        settings.setMaxCodValue(request.getMaxCodValue());

        BusinessSettings saved = repository.save(settings);
        return mapToResponse(saved);
    }

    private BusinessSettings getOrCreateSettings() {
        return repository.findFirstByOrderByIdAsc().orElseGet(() -> {
            BusinessSettings defaults = BusinessSettings.builder()
                    .id(1L)
                    .storeName("Pragati Nursery")
                    .phone("+91 98765 00000")
                    .email("hello@pragatinursery.in")
                    .address("Pune, Maharashtra, India")
                    .deliveryFee(new BigDecimal("0.00"))
                    .minOrderValue(new BigDecimal("299.00"))
                    .maxCodValue(new BigDecimal("5000.00"))
                    .build();
            return repository.save(defaults);
        });
    }

    private BusinessSettingsResponse mapToResponse(BusinessSettings settings) {
        return BusinessSettingsResponse.builder()
                .storeName(settings.getStoreName())
                .phone(settings.getPhone())
                .email(settings.getEmail())
                .address(settings.getAddress())
                .deliveryFee(settings.getDeliveryFee())
                .minOrderValue(settings.getMinOrderValue())
                .maxCodValue(settings.getMaxCodValue())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}
