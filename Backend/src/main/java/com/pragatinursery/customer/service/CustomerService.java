package com.pragatinursery.customer.service;

import com.pragatinursery.common.response.PagedResponse;
import com.pragatinursery.customer.dto.response.AdminCustomerResponse;
import com.pragatinursery.order.entity.Order;

import java.util.List;

public interface CustomerService {
    void processSuccessfulOrder(Order order);
    PagedResponse<AdminCustomerResponse> getAdminCustomers(String search, String district, String sort, String direction, int page, int size);
    List<String> getDistinctDistricts();
}
