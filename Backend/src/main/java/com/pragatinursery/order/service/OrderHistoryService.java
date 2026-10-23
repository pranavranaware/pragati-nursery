package com.pragatinursery.order.service;

import com.pragatinursery.order.dto.request.OrderRefDto;
import com.pragatinursery.order.dto.response.OrderResponse;

import java.util.List;

public interface OrderHistoryService {
    List<OrderResponse> fetchVerifiedCustomerOrders(List<OrderRefDto> orderRefs);
}
