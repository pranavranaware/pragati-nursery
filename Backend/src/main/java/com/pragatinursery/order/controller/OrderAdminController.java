package com.pragatinursery.order.controller;

import com.pragatinursery.common.enums.OrderStatus;
import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.common.response.PagedResponse;
import com.pragatinursery.order.dto.response.OrderResponse;
import com.pragatinursery.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class OrderAdminController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getAdminOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        PagedResponse<OrderResponse> response = orderService.getAllOrders(page, size, sort, direction);
        return ResponseEntity.ok(ApiResponse.success("Admin orders retrieved successfully", response));
    }

    @PatchMapping("/{orderNumber}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
        OrderResponse response = orderService.updateOrderStatus(orderNumber, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }
}
