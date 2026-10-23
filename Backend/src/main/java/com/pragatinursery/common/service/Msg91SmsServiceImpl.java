package com.pragatinursery.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@Slf4j
public class Msg91SmsServiceImpl implements SmsService {

    @Value("${app.sms.msg91.auth-key:}")
    private String authKey;

    @Value("${app.sms.msg91.template-id:}")
    private String templateId;

    private static final String MSG91_OTP_URL = "https://control.msg91.com/api/v5/otp";
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtp(String mobile, String otp, String purpose) {
        if (!StringUtils.hasText(authKey) || !StringUtils.hasText(templateId)) {
            log.error("MSG91 SMS delivery configuration is incomplete. Check MSG91_AUTH_KEY and MSG91_TEMPLATE_ID environment variables.");
            throw new IllegalStateException("Failed to send OTP via MSG91: Configuration incomplete");
        }

        String normalizedMobile = normalizeIndianMobile(mobile);

        URI targetUri = UriComponentsBuilder.fromHttpUrl(MSG91_OTP_URL)
                .queryParam("template_id", templateId)
                .queryParam("mobile", normalizedMobile)
                .queryParam("otp", otp)
                .build()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("authkey", authKey);

        HttpEntity<String> entity = new HttpEntity<>("{}", headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(targetUri, HttpMethod.POST, entity, Map.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("MSG91 API returned non-2xx HTTP status code.");
                throw new IllegalStateException("Failed to send OTP via MSG91");
            }

            Map body = response.getBody();
            if (body != null && "error".equalsIgnoreCase(String.valueOf(body.get("type")))) {
                log.error("MSG91 API error response: {}", body.get("message"));
                throw new IllegalStateException("Failed to send OTP via MSG91");
            }

            log.info("Successfully dispatched OTP request to MSG91 for recipient mobile ending in {}", maskMobile(normalizedMobile));
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Exception occurred while communicating with MSG91 API: {}", e.getMessage());
            throw new IllegalStateException("Failed to send OTP via MSG91", e);
        }
    }

    private String normalizeIndianMobile(String input) {
        if (!StringUtils.hasText(input)) return "";
        String digits = input.replaceAll("\\D", "");
        if (digits.length() == 10) {
            return "91" + digits;
        }
        if (digits.length() == 12 && digits.startsWith("91")) {
            return digits;
        }
        return digits.length() > 10 ? "91" + digits.substring(digits.length() - 10) : "91" + digits;
    }

    private String maskMobile(String mobile) {
        if (!StringUtils.hasText(mobile) || mobile.length() < 4) return "****";
        return "****" + mobile.substring(mobile.length() - 4);
    }
}
