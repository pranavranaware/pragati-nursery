package com.pragatinursery.pincode.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pragatinursery.pincode.dto.PincodeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class PincodeServiceImpl implements PincodeService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final Map<String, PincodeResponse> cache = new ConcurrentHashMap<>();

    public PincodeServiceImpl() {
        this.objectMapper = new ObjectMapper();
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3000);
        requestFactory.setReadTimeout(3000);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    @Override
    public PincodeResponse lookupPincode(String pincode) {
        if (pincode == null || !pincode.trim().matches("^\\d{6}$")) {
            return PincodeResponse.builder()
                    .success(false)
                    .pincode(pincode)
                    .state(null)
                    .district(null)
                    .city(null)
                    .localities(Collections.emptyList())
                    .errorMessage("Invalid Indian pincode format. Pincode must be 6 digits.")
                    .build();
        }

        String cleanPincode = pincode.trim();

        if (cache.containsKey(cleanPincode)) {
            log.info("Returning cached pincode response for {}", cleanPincode);
            return cache.get(cleanPincode);
        }

        try {
            String url = "https://api.pincodeapi.in/api/v1/pincode/" + cleanPincode;
            String rawJson;
            try {
                rawJson = restTemplate.getForObject(url, String.class);
            } catch (HttpStatusCodeException e) {
                log.warn("PincodeAPI.in returned HTTP status {} for pincode {}", e.getStatusCode(), cleanPincode);
                return buildErrorResponse(cleanPincode, "Invalid Indian pincode or pincode not found.");
            } catch (RestClientException e) {
                log.warn("Failed to reach PincodeAPI.in service for pincode {}: {}", cleanPincode, e.getMessage());
                return buildErrorResponse(cleanPincode, "Unable to lookup pincode at this time. Please enter address manually.");
            }

            if (rawJson == null || rawJson.trim().isEmpty()) {
                return buildErrorResponse(cleanPincode, "No response received from postal service.");
            }

            JsonNode rootNode = objectMapper.readTree(rawJson);
            boolean success = rootNode.path("success").asBoolean(false);
            if (!success) {
                return buildErrorResponse(cleanPincode, "Invalid Indian pincode or pincode not found.");
            }

            JsonNode dataNode = rootNode.path("data");
            JsonNode postOffices = dataNode.path("post_offices");
            if (!postOffices.isArray() || postOffices.isEmpty()) {
                return buildErrorResponse(cleanPincode, "No postal areas found for this pincode.");
            }

            String state = null;
            String district = null;
            Set<String> localitySet = new LinkedHashSet<>();

            for (JsonNode po : postOffices) {
                if (state == null && po.hasNonNull("state")) {
                    String s = po.path("state").asText().trim();
                    if (!s.isEmpty()) {
                        state = s;
                    }
                }
                if (district == null && po.hasNonNull("district")) {
                    String d = po.path("district").asText().trim();
                    if (!d.isEmpty()) {
                        district = d;
                    }
                }
                if (po.hasNonNull("office_name")) {
                    String name = po.path("office_name").asText().trim();
                    if (!name.isEmpty()) {
                        localitySet.add(name);
                    }
                }
            }

            PincodeResponse response = PincodeResponse.builder()
                    .success(true)
                    .pincode(cleanPincode)
                    .state(state)
                    .district(district)
                    .city(null)
                    .localities(new ArrayList<>(localitySet))
                    .errorMessage(null)
                    .build();

            cache.put(cleanPincode, response);
            return response;

        } catch (Exception e) {
            log.error("Error fetching pincode information for {}: {}", cleanPincode, e.getMessage());
            return buildErrorResponse(cleanPincode, "Unable to lookup pincode at this time. Please enter address manually.");
        }
    }

    private PincodeResponse buildErrorResponse(String pincode, String message) {
        return PincodeResponse.builder()
                .success(false)
                .pincode(pincode)
                .state(null)
                .district(null)
                .city(null)
                .localities(Collections.emptyList())
                .errorMessage(message)
                .build();
    }
}
