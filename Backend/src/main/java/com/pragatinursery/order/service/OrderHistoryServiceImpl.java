package com.pragatinursery.order.service;

import com.pragatinursery.auth.entity.OtpVerification;
import com.pragatinursery.auth.repository.OtpVerificationRepository;
import com.pragatinursery.common.enums.OrderStatus;
import com.pragatinursery.common.enums.PaymentMethod;
import com.pragatinursery.common.enums.PaymentStatus;
import com.pragatinursery.common.exception.BadRequestException;
import com.pragatinursery.common.exception.ResourceNotFoundException;
import com.pragatinursery.common.service.SmsService;
import com.pragatinursery.order.dto.request.OrderRefDto;
import com.pragatinursery.order.dto.request.SendOtpRequest;
import com.pragatinursery.order.dto.request.VerifyOtpRequest;
import com.pragatinursery.order.dto.response.OrderAddressResponse;
import com.pragatinursery.order.dto.response.OrderHistoryAuthResponse;
import com.pragatinursery.order.dto.response.OrderItemResponse;
import com.pragatinursery.order.dto.response.OrderPaymentResponse;
import com.pragatinursery.order.dto.response.OrderResponse;
import com.pragatinursery.order.entity.Order;
import com.pragatinursery.order.repository.OrderRepository;
import com.pragatinursery.security.JwtTokenProvider;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderHistoryServiceImpl implements OrderHistoryService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final OrderRepository orderRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final SmsService smsService;

    @Value("${app.otp.secret-pepper:${OTP_SECRET_PEPPER:PragatiNurseryDefaultOtpPepperSecret2026SecureKey}}")
    private String secretPepper;

    private static final String PURPOSE = "ORDER_HISTORY";
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESEND_THROTTLE_SECONDS = 60;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> fetchVerifiedCustomerOrders(List<OrderRefDto> orderRefs) {
        if (orderRefs == null || orderRefs.isEmpty()) {
            return Collections.emptyList();
        }

        // Limit maximum batch size to 50
        List<OrderRefDto> limitedRefs = orderRefs.stream().limit(50).toList();
        List<OrderResponse> result = new ArrayList<>();

        for (OrderRefDto ref : limitedRefs) {
            if (ref == null || !StringUtils.hasText(ref.getOrderNumber()) || !StringUtils.hasText(ref.getToken())) {
                continue;
            }

            Optional<Order> orderOpt = orderRepository.findByOrderNumber(ref.getOrderNumber());
            if (orderOpt.isEmpty()) {
                continue;
            }

            Order order = orderOpt.get();

            // Validate secure token match
            if (!StringUtils.hasText(order.getGuestToken()) || !order.getGuestToken().equals(ref.getToken())) {
                log.warn("Invalid guest token provided for order {}", ref.getOrderNumber());
                continue;
            }

            // Status Eligibility Check:
            // Do not return CANCELLED orders or ONLINE Razorpay orders that are not PAID
            if (order.getStatus() == OrderStatus.CANCELLED) {
                continue;
            }
            if (order.getPayment() != null && order.getPayment().getMethod() == PaymentMethod.ONLINE) {
                if (order.getPayment().getStatus() != PaymentStatus.PAID) {
                    continue;
                }
            }

            result.add(mapToOrderResponse(order));
        }

        // Sort descending by orderDate
        result.sort((a, b) -> {
            if (a.getOrderDate() == null || b.getOrderDate() == null) return 0;
            return b.getOrderDate().compareTo(a.getOrderDate());
        });

        return result;
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = (order.getItems() != null ? order.getItems() : Collections.<com.pragatinursery.order.entity.OrderItem>emptyList()).stream()
                .map((com.pragatinursery.order.entity.OrderItem item) -> OrderItemResponse.builder()
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getPrice())
                        .lineTotal(item.getPrice().multiply(new java.math.BigDecimal(item.getQuantity())))
                        .image(item.getImage())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        OrderAddressResponse addressResponse = OrderAddressResponse.builder()
                .fullName(order.getShippingName() != null ? order.getShippingName() : "")
                .mobile(order.getShippingMobile() != null ? order.getShippingMobile() : "")
                .email(order.getShippingEmail() != null ? order.getShippingEmail() : "")
                .address(order.getShippingAddress() != null ? order.getShippingAddress() : "")
                .city(order.getShippingCity() != null ? order.getShippingCity() : "")
                .district(order.getShippingDistrict() != null ? order.getShippingDistrict() : "")
                .state(order.getShippingState() != null ? order.getShippingState() : "")
                .pincode(order.getShippingPincode() != null ? order.getShippingPincode() : "")
                .landmark(order.getShippingLandmark() != null ? order.getShippingLandmark() : "")
                .build();

        OrderPaymentResponse paymentResponse = order.getPayment() != null ? OrderPaymentResponse.builder()
                .method(order.getPayment().getMethod())
                .status(order.getPayment().getStatus())
                .razorpayOrderId(order.getPayment().getRazorpayOrderId())
                .build() : null;

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .payment(paymentResponse)
                .items(itemResponses)
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(addressResponse)
                .orderDate(order.getOrderDate())
                .build();
    }
}
