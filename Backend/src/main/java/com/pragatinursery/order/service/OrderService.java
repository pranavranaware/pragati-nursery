package com.pragatinursery.order.service;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.common.response.PagedResponse;
import com.pragatinursery.order.dto.request.CreateOrderRequest;
import com.pragatinursery.order.dto.response.OrderCreatedResponse;
import com.pragatinursery.order.dto.response.OrderResponse;

public interface OrderService {
    OrderCreatedResponse createOrder(User user, CreateOrderRequest request);
    PagedResponse<OrderResponse> getCustomerOrders(User user, int page, int size, String sort, String direction);
    OrderResponse getCustomerOrderById(User user, Long id);
    OrderResponse getCustomerOrderByOrderNumber(User user, String orderNumber);
    PagedResponse<OrderResponse> getAllOrders(int page, int size, String sort, String direction);
    OrderResponse updateOrderStatus(String orderNumber, com.pragatinursery.common.enums.OrderStatus status);
    java.util.List<OrderResponse> lookupOrdersByEmailOrMobile(String emailOrMobile);
    void cancelOrder(User user, Long orderId, String guestCheckoutToken);
}
