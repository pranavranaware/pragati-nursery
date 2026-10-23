package com.pragatinursery.order.controller;

import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.order.dto.request.FetchCustomerOrdersRequest;
import com.pragatinursery.order.dto.response.OrderResponse;
import com.pragatinursery.order.service.OrderHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-history")
@RequiredArgsConstructor
public class OrderHistoryController {

    private final OrderHistoryService orderHistoryService;

    @PostMapping("/fetch")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> fetchCustomerOrders(
            @Valid @RequestBody FetchCustomerOrdersRequest request) {
        List<OrderResponse> orders = orderHistoryService.fetchVerifiedCustomerOrders(request.getOrders());
        return ResponseEntity.ok(ApiResponse.success("Customer orders retrieved successfully.", orders));
    }
}
