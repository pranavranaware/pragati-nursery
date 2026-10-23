package com.pragatinursery.customer.controller;

import com.pragatinursery.common.response.ApiResponse;
import com.pragatinursery.common.response.PagedResponse;
import com.pragatinursery.customer.dto.response.AdminCustomerResponse;
import com.pragatinursery.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/customers")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class CustomerAdminController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AdminCustomerResponse>>> getAdminCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        PagedResponse<AdminCustomerResponse> response = customerService.getAdminCustomers(search, district, sort, direction, page, size);
        return ResponseEntity.ok(ApiResponse.success("Admin customers retrieved successfully", response));
    }

    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctDistricts() {
        List<String> districts = customerService.getDistinctDistricts();
        return ResponseEntity.ok(ApiResponse.success("Distinct districts retrieved successfully", districts));
    }
}
