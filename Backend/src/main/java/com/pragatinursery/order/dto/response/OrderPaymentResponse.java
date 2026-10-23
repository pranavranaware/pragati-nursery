package com.pragatinursery.order.dto.response;

import com.pragatinursery.common.enums.PaymentMethod;
import com.pragatinursery.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPaymentResponse {
    private PaymentMethod method;
    private PaymentStatus status;
    private String razorpayOrderId;
}
