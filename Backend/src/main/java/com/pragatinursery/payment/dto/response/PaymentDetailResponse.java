package com.pragatinursery.payment.dto.response;

import com.pragatinursery.common.enums.PaymentMethod;
import com.pragatinursery.common.enums.PaymentStatus;
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
public class PaymentDetailResponse {
    private Long orderId;
    private String orderNumber;
    private PaymentMethod method;
    private PaymentStatus status;
    private BigDecimal amount;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private Instant paidAt;
    private String failureReason;
}
