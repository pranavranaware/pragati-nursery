package com.pragatinursery.order.controller;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.common.response.PagedResponse;
import com.pragatinursery.order.dto.request.CreateOrderRequest;
import com.pragatinursery.order.dto.response.OrderCreatedResponse;
import com.pragatinursery.order.dto.response.OrderResponse;
import com.pragatinursery.order.service.OrderService;
import com.pragatinursery.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderCreatedResponse>> createOrder(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        User user = (customUserDetails != null) ? customUserDetails.getUser() : null;
        OrderCreatedResponse response = orderService.createOrder(user, request);
        return new ResponseEntity<>(ApiResponse.success("Order placed successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getCustomerOrders(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        PagedResponse<OrderResponse> orders = orderService.getCustomerOrders(customUserDetails.getUser(), page, size, sort, direction);
        return ResponseEntity.ok(ApiResponse.success("Order history retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getCustomerOrderById(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long id) {
        OrderResponse order = orderService.getCustomerOrderById(customUserDetails.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved successfully", order));
    }

    @GetMapping("/number/{orderNumber}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getCustomerOrderByOrderNumber(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable String orderNumber) {
        User user = (customUserDetails != null) ? customUserDetails.getUser() : null;
        OrderResponse order = orderService.getCustomerOrderByOrderNumber(user, orderNumber);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved successfully", order));
    }

    @GetMapping("/lookup")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> lookupOrders(
            @RequestParam String emailOrMobile) {
        List<OrderResponse> orders = orderService.lookupOrdersByEmailOrMobile(emailOrMobile);
        return ResponseEntity.ok(ApiResponse.success("Matching orders retrieved successfully", orders));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long id,
            @RequestParam(required = false) String guestCheckoutToken) {
        User user = (customUserDetails != null) ? customUserDetails.getUser() : null;
        orderService.cancelOrder(user, id, guestCheckoutToken);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }
}
