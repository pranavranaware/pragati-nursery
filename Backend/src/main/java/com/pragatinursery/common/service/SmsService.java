package com.pragatinursery.common.service;

public interface SmsService {
    void sendOtp(String mobile, String otp, String purpose);
}
