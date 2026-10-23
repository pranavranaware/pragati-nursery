package com.pragatinursery.payment.controller;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.payment.dto.request.CreateRazorpayOrderRequest;
import com.pragatinursery.payment.dto.request.VerifyPaymentRequest;
import com.pragatinursery.payment.dto.response.PaymentDetailResponse;
import com.pragatinursery.payment.dto.response.RazorpayOrderResponse;
import com.pragatinursery.payment.service.PaymentService;
import com.pragatinursery.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<RazorpayOrderResponse>> createRazorpayOrder(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody CreateRazorpayOrderRequest request) {
        User user = (customUserDetails != null) ? customUserDetails.getUser() : null;
        RazorpayOrderResponse response = paymentService.createRazorpayOrder(user, request);
        return ResponseEntity.ok(ApiResponse.success("Razorpay order created successfully", response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentDetailResponse>> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody VerifyPaymentRequest request) {
        User user = (customUserDetails != null) ? customUserDetails.getUser() : null;
        PaymentDetailResponse response = paymentService.verifyPayment(user, request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Void>> processWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        paymentService.processWebhook(payload, signature);
        return ResponseEntity.ok(ApiResponse.success("Webhook processed successfully", null));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<PaymentDetailResponse>> getPaymentDetails(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long orderId) {
        User user = (customUserDetails != null) ? customUserDetails.getUser() : null;
        PaymentDetailResponse response = paymentService.getPaymentDetails(user, orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully", response));
    }
}
