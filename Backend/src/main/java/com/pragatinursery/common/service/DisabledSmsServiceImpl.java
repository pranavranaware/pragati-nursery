package com.pragatinursery.common.service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DisabledSmsServiceImpl implements SmsService {

    @Override
    public void sendOtp(String mobile, String otp, String purpose) {
        log.error("SMS Delivery Failed: No SMS provider is configured in application properties (app.sms.provider).");
        throw new IllegalStateException("SMS delivery service is not configured. Please set app.sms.provider=dev for development testing.");
    }
}
