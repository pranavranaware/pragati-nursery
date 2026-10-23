package com.pragatinursery.customer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerResponse {
    private Long id;
    private Long userId;
    private String name;
    private String mobile;
    private String email;
    private String address;
    private String city;
    private String district;
    private String state;
    private String pincode;
    private Long firstOrderId;
    private Long lastOrderId;
    private Instant firstOrderDate;
    private Instant lastOrderDate;
    private Integer totalOrders;
    private BigDecimal totalSpent;
    private String status; // "New" or "Returning"
}
