package com.pragatinursery.common.service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DevSmsServiceImpl implements SmsService {

    @Override
    public void sendOtp(String mobile, String otp, String purpose) {
        log.info("[DEV SMS PROVIDER] Simulated SMS sent to mobile {}: OTP = {} (Purpose: {})", mobile, otp, purpose);
    }
}
