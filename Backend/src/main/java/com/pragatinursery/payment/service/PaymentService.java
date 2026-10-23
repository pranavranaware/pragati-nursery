package com.pragatinursery.payment.service;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.payment.dto.request.CreateRazorpayOrderRequest;
import com.pragatinursery.payment.dto.request.VerifyPaymentRequest;
import com.pragatinursery.payment.dto.response.PaymentDetailResponse;
import com.pragatinursery.payment.dto.response.RazorpayOrderResponse;

public interface PaymentService {
    RazorpayOrderResponse createRazorpayOrder(User user, CreateRazorpayOrderRequest request);
    PaymentDetailResponse verifyPayment(User user, VerifyPaymentRequest request);
    void processWebhook(String payload, String razorpaySignature);
    PaymentDetailResponse getPaymentDetails(User user, Long orderId);
}
