package com.pragatinursery.customer.service;

import com.pragatinursery.common.response.PagedResponse;
import com.pragatinursery.customer.dto.response.AdminCustomerResponse;
import com.pragatinursery.customer.entity.Customer;
import com.pragatinursery.customer.repository.CustomerOrderRepository;
import com.pragatinursery.customer.repository.CustomerRepository;
import com.pragatinursery.order.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerOrderRepository customerOrderRepository;

    @Override
    @Transactional
    public void processSuccessfulOrder(Order order) {
        if (order == null || order.getId() == null) {
            return;
        }

        // 1. Extract & Normalize Input Data
        String rawMobile = order.getShippingMobile() != null ? order.getShippingMobile() : "";
        String normalizedMobile = rawMobile.replaceAll("\\D", "");
        if (normalizedMobile.length() > 10) {
            normalizedMobile = normalizedMobile.substring(normalizedMobile.length() - 10);
        }

        String normalizedEmail = order.getShippingEmail() != null ? order.getShippingEmail().trim().toLowerCase() : "";
        String name = StringUtils.hasText(order.getShippingName()) ? order.getShippingName().trim() : "Customer";
        String address = StringUtils.hasText(order.getShippingAddress()) ? order.getShippingAddress().trim() : "";
        String city = StringUtils.hasText(order.getShippingCity()) ? order.getShippingCity().trim() : "";
        String district = toTitleCase(order.getShippingDistrict());
        String state = StringUtils.hasText(order.getShippingState()) ? order.getShippingState().trim() : "";
        String pincode = StringUtils.hasText(order.getShippingPincode()) ? order.getShippingPincode().trim() : "";
        Instant orderDate = order.getOrderDate() != null ? order.getOrderDate() : Instant.now();
        BigDecimal amount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;

        // 2. Resolve Customer Identity Key
        String identityKey;
        Long userId = order.getUser() != null ? order.getUser().getId() : null;

        if (userId != null) {
            String userIdentityKey = "USER:" + userId;
            // Check if guest conversion is appropriate
            if (StringUtils.hasText(normalizedMobile)) {
                Optional<Customer> guestMatch = customerRepository.findByGuestMobileWithLock(normalizedMobile);
                if (guestMatch.isPresent()) {
                    Customer g = guestMatch.get();
                    if (g.getUser() == null && (!StringUtils.hasText(g.getEmail()) || !StringUtils.hasText(normalizedEmail) || g.getEmail().equalsIgnoreCase(normalizedEmail))) {
                        // Convert guest to registered ONLY if USER:<userId> does not already exist
                        if (customerRepository.findByIdentityKeyWithLock(userIdentityKey).isEmpty()) {
                            g.setUser(order.getUser());
                            g.setIdentityKey(userIdentityKey);
                            customerRepository.save(g);
                        }
                    }
                }
            }
            identityKey = userIdentityKey;
        } else if (StringUtils.hasText(normalizedMobile)) {
            identityKey = "MOBILE:" + normalizedMobile;
        } else if (StringUtils.hasText(normalizedEmail)) {
            identityKey = "EMAIL:" + normalizedEmail;
        } else {
            identityKey = "ORDER:" + order.getId();
        }

        // 3. Race-Free Customer Creation / Loading with Pessimistic Lock
        customerRepository.createCustomerIfAbsent(
                identityKey,
                userId,
                name,
                normalizedMobile,
                normalizedEmail,
                address,
                city,
                district,
                state,
                pincode
        );

        Customer customer = customerRepository.findByIdentityKeyWithLock(identityKey)
                .orElseThrow(() -> new IllegalStateException("Failed to load or lock customer with identity key: " + identityKey));

        // 4. Attempt Order Claim (INSERT IGNORE) within the SAME transaction
        int claimed = customerOrderRepository.tryClaimOrder(customer.getId(), order.getId(), amount);

        if (claimed == 0) {
            log.info("Order ID {} was already claimed in customer_orders. Exiting without incrementing totals.", order.getId());
            return;
        }

        // 5. Only increment totals if this transaction successfully claimed the order
        customer.setName(name);
        if (StringUtils.hasText(normalizedMobile)) customer.setMobile(normalizedMobile);
        if (StringUtils.hasText(normalizedEmail)) customer.setEmail(normalizedEmail);
        if (StringUtils.hasText(address)) customer.setAddress(address);
        if (StringUtils.hasText(city)) customer.setCity(city);
        if (StringUtils.hasText(district)) customer.setDistrict(district);
        if (StringUtils.hasText(state)) customer.setState(state);
        if (StringUtils.hasText(pincode)) customer.setPincode(pincode);

        // Null-Safe Chronological First Order Date Comparison
        if (customer.getFirstOrderDate() == null || orderDate.isBefore(customer.getFirstOrderDate()) ||
            (orderDate.equals(customer.getFirstOrderDate()) && customer.getFirstOrderId() != null && order.getId() < customer.getFirstOrderId())) {
            customer.setFirstOrderDate(orderDate);
            customer.setFirstOrderId(order.getId());
        }

        // Null-Safe Chronological Last Order Date Comparison
        if (customer.getLastOrderDate() == null || orderDate.isAfter(customer.getLastOrderDate()) ||
            (orderDate.equals(customer.getLastOrderDate()) && customer.getLastOrderId() != null && order.getId() > customer.getLastOrderId())) {
            customer.setLastOrderDate(orderDate);
            customer.setLastOrderId(order.getId());
        }

        customer.setTotalOrders((customer.getTotalOrders() != null ? customer.getTotalOrders() : 0) + 1);
        customer.setTotalSpent((customer.getTotalSpent() != null ? customer.getTotalSpent() : BigDecimal.ZERO).add(amount));

        customerRepository.save(customer);
        log.info("Successfully updated customer totals for order ID {} (Customer ID: {})", order.getId(), customer.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminCustomerResponse> getAdminCustomers(String search, String district, String sort, String direction, int page, int size) {
        String sortProperty = "createdAt";
        if ("district".equalsIgnoreCase(sort)) {
            sortProperty = "district";
        } else if ("name".equalsIgnoreCase(sort)) {
            sortProperty = "name";
        } else if ("totalSpent".equalsIgnoreCase(sort)) {
            sortProperty = "totalSpent";
        } else if ("totalOrders".equalsIgnoreCase(sort)) {
            sortProperty = "totalOrders";
        }

        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortProperty));

        Page<Customer> pageResult = customerRepository.searchAdminCustomers(search, district, pageable);

        List<AdminCustomerResponse> content = pageResult.getContent().stream()
                .map(this::mapToAdminCustomerResponse)
                .collect(Collectors.toList());

        return PagedResponse.<AdminCustomerResponse>builder()
                .content(content)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctDistricts() {
        return customerRepository.findDistinctDistricts();
    }

    private String toTitleCase(String input) {
        if (!StringUtils.hasText(input)) return "";
        String trimmed = input.trim().replaceAll("\\s+", " ");
        StringBuilder result = new StringBuilder();
        for (String word : trimmed.split(" ")) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1).toLowerCase())
                      .append(" ");
            }
        }
        return result.toString().trim();
    }

    private AdminCustomerResponse mapToAdminCustomerResponse(Customer c) {
        String status = (c.getTotalOrders() != null && c.getTotalOrders() > 1) ? "Returning" : "New";
        return AdminCustomerResponse.builder()
                .id(c.getId())
                .userId(c.getUser() != null ? c.getUser().getId() : null)
                .name(c.getName())
                .mobile(c.getMobile())
                .email(c.getEmail())
                .address(c.getAddress())
                .city(c.getCity())
                .district(c.getDistrict())
                .state(c.getState())
                .pincode(c.getPincode())
                .firstOrderId(c.getFirstOrderId())
                .lastOrderId(c.getLastOrderId())
                .firstOrderDate(c.getFirstOrderDate())
                .lastOrderDate(c.getLastOrderDate())
                .totalOrders(c.getTotalOrders() != null ? c.getTotalOrders() : 0)
                .totalSpent(c.getTotalSpent() != null ? c.getTotalSpent() : BigDecimal.ZERO)
                .status(status)
                .build();
    }
}
