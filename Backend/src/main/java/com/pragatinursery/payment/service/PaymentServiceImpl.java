package com.pragatinursery.payment.service;

import com.pragatinursery.cart.repository.CartItemRepository;
import com.pragatinursery.cart.repository.CartRepository;
import com.pragatinursery.auth.entity.User;
import com.pragatinursery.common.enums.OrderStatus;
import com.pragatinursery.common.enums.PaymentMethod;
import com.pragatinursery.common.enums.PaymentStatus;
import com.pragatinursery.common.exception.BadRequestException;
import com.pragatinursery.common.exception.ResourceNotFoundException;
import com.pragatinursery.order.entity.Order;
import com.pragatinursery.order.repository.OrderRepository;
import com.pragatinursery.payment.dto.request.CreateRazorpayOrderRequest;
import com.pragatinursery.payment.dto.request.VerifyPaymentRequest;
import com.pragatinursery.payment.dto.response.PaymentDetailResponse;
import com.pragatinursery.payment.dto.response.RazorpayOrderResponse;
import com.pragatinursery.payment.entity.Payment;
import com.pragatinursery.payment.repository.PaymentRepository;
import com.razorpay.RazorpayClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final com.pragatinursery.customer.service.CustomerService customerService;

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${app.razorpay.webhook-secret:}")
    private String razorpayWebhookSecret;

    @Override
    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(User user, CreateRazorpayOrderRequest request) {
        Order order;
        if (user != null) {
            order = orderRepository.findByIdAndUserId(request.getOrderId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));
        } else {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));
            if (order.getUser() != null || !StringUtils.hasText(request.getGuestCheckoutToken()) || !request.getGuestCheckoutToken().equals(order.getGuestToken())) {
                throw new ResourceNotFoundException("Order not found with id: " + request.getOrderId());
            }
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot create payment for a cancelled order.");
        }

        Payment payment = order.getPayment();
        if (payment == null) {
            throw new BadRequestException("No payment record associated with this order.");
        }

        if (payment.getMethod() != PaymentMethod.ONLINE) {
            throw new BadRequestException("Order does not use ONLINE payment method.");
        }

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Order has already been successfully paid.");
        }

        // Idempotent reuse: if razorpayOrderId already exists, return existing order info
        if (StringUtils.hasText(payment.getRazorpayOrderId())) {
            log.info("Reusing existing Razorpay order ID {} for local order {}", payment.getRazorpayOrderId(), order.getOrderNumber());
            return buildRazorpayOrderResponse(order, payment.getRazorpayOrderId());
        }

        long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", order.getOrderNumber());

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            payment.setRazorpayOrderId(razorpayOrderId);
            paymentRepository.save(payment);

            log.info("Created Razorpay order {} for local order {} (Amount: ₹{})", razorpayOrderId, order.getOrderNumber(), order.getTotalAmount());
            return buildRazorpayOrderResponse(order, razorpayOrderId);

        } catch (Exception ex) {
            log.error("Failed to create Razorpay order for local order {}: {}", order.getOrderNumber(), ex.getMessage());
            throw new BadRequestException("Online payment is not configured. Please configure valid Razorpay Test Mode credentials.");
        }
    }

    @Override
    @Transactional
    public PaymentDetailResponse verifyPayment(User user, VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for Razorpay order ID: " + request.getRazorpayOrderId()));

        Order order = payment.getOrder();
        if (user != null) {
            if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
                throw new ResourceNotFoundException("Payment record not found for Razorpay order ID: " + request.getRazorpayOrderId());
            }
        } else {
            if (order.getUser() != null) {
                throw new ResourceNotFoundException("Payment record not found for Razorpay order ID: " + request.getRazorpayOrderId());
            }
        }

        // Idempotent check: if already paid, return response without duplicating action
        if (payment.getStatus() == PaymentStatus.PAID) {
            log.info("Payment already verified for Razorpay order ID {}", request.getRazorpayOrderId());
            return mapToPaymentDetailResponse(payment);
        }

        // Verify HMAC-SHA256 signature
        boolean isValidSignature = verifyHmacSha256(
                request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                razorpayKeySecret
        );

        if (!isValidSignature) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Invalid signature");
            paymentRepository.save(payment);
            log.error("Payment signature verification failed for Razorpay order ID {}", request.getRazorpayOrderId());
            throw new BadRequestException("Payment verification failed. Invalid signature.");
        }

        return finalizeSuccessfulPayment(payment, request.getRazorpayPaymentId(), request.getRazorpaySignature());
    }

    private PaymentDetailResponse finalizeSuccessfulPayment(Payment payment, String razorpayPaymentId, String razorpaySignature) {
        Order order = payment.getOrder();

        if (payment.getStatus() == PaymentStatus.PAID) {
            log.info("Payment already finalized for order {}", order.getOrderNumber());
            return mapToPaymentDetailResponse(payment);
        }

        payment.setStatus(PaymentStatus.PAID);
        if (StringUtils.hasText(razorpayPaymentId)) payment.setRazorpayPaymentId(razorpayPaymentId);
        if (StringUtils.hasText(razorpaySignature)) payment.setRazorpaySignature(razorpaySignature);
        payment.setPaidAt(Instant.now());
        payment.setFailureReason(null);

        order.setStatus(OrderStatus.CONFIRMED);

        paymentRepository.save(payment);
        orderRepository.save(order);

        // Process Customer Statistics and Tracking Record
        customerService.processSuccessfulOrder(order);

        // Clear DB cart for authenticated user
        if (order.getUser() != null) {
            cartRepository.findByUserId(order.getUser().getId()).ifPresent(cart -> {
                cart.getItems().clear();
                cartItemRepository.deleteByCartId(cart.getId());
                log.info("Cleared DB cart for user {} after payment verification", order.getUser().getEmail());
            });
        }

        log.info("Successfully verified and finalized payment {} for order {} (Amount: ₹{})", payment.getRazorpayPaymentId(), order.getOrderNumber(), payment.getAmount());
        return mapToPaymentDetailResponse(payment);
    }

    @Override
    @Transactional
    public void processWebhook(String payload, String razorpaySignature) {
        if (!StringUtils.hasText(razorpaySignature)) {
            throw new BadRequestException("Missing Razorpay signature header.");
        }

        boolean isValid = verifyHmacSha256(payload, razorpaySignature, razorpayWebhookSecret);
        if (!isValid) {
            log.error("Invalid webhook signature received.");
            throw new BadRequestException("Invalid webhook signature.");
        }

        try {
            JSONObject event = new JSONObject(payload);
            String eventType = event.optString("event");
            JSONObject payloadObj = event.optJSONObject("payload");

            if (payloadObj != null) {
                JSONObject paymentEntity = null;
                if (payloadObj.has("payment")) {
                    paymentEntity = payloadObj.getJSONObject("payment").getJSONObject("entity");
                }

                if (paymentEntity != null) {
                    String razorpayOrderId = paymentEntity.optString("order_id");
                    String razorpayPaymentId = paymentEntity.optString("id");

                    if (StringUtils.hasText(razorpayOrderId)) {
                        paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(payment -> {
                            Order order = payment.getOrder();
                            if ("payment.captured".equalsIgnoreCase(eventType) || "order.paid".equalsIgnoreCase(eventType)) {
                                finalizeSuccessfulPayment(payment, razorpayPaymentId, null);
                            } else if ("payment.failed".equalsIgnoreCase(eventType)) {
                                if (payment.getStatus() == PaymentStatus.PENDING) {
                                    payment.setStatus(PaymentStatus.FAILED);
                                    payment.setFailureReason("Webhook event: payment.failed");
                                    paymentRepository.save(payment);
                                    log.info("Webhook updated payment status to FAILED for order {}", order.getOrderNumber());
                                }
                            }
                        });
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Error processing Razorpay webhook: {}", ex.getMessage());
            throw new BadRequestException("Failed to process webhook payload.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDetailResponse getPaymentDetails(User user, Long orderId) {
        Order order;
        if (user != null) {
            order = orderRepository.findByIdAndUserId(orderId, user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        } else {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
            if (order.getUser() != null) {
                throw new ResourceNotFoundException("Order not found with id: " + orderId);
            }
        }

        Payment payment = order.getPayment();
        if (payment == null) {
            throw new ResourceNotFoundException("Payment details not found for order id: " + orderId);
        }

        return mapToPaymentDetailResponse(payment);
    }

    private RazorpayOrderResponse buildRazorpayOrderResponse(Order order, String razorpayOrderId) {
        long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
        return RazorpayOrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .razorpayOrderId(razorpayOrderId)
                .razorpayKeyId(razorpayKeyId)
                .amount(order.getTotalAmount())
                .amountInPaise(amountInPaise)
                .currency("INR")
                .build();
    }

    private PaymentDetailResponse mapToPaymentDetailResponse(Payment payment) {
        return PaymentDetailResponse.builder()
                .orderId(payment.getOrder().getId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .paidAt(payment.getPaidAt())
                .failureReason(payment.getFailureReason())
                .build();
    }

    private boolean verifyHmacSha256(String data, String expectedSignature, String secret) {
        if (!StringUtils.hasText(expectedSignature) || !StringUtils.hasText(secret)) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(expectedSignature);
        } catch (Exception ex) {
            log.error("HMAC SHA256 calculation error: {}", ex.getMessage());
            return false;
        }
    }

    private String UUIDHex() {
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 14);
    }
}
