package com.pragatinursery.order.dto.request;

import com.pragatinursery.common.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    private Long addressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private List<GuestCartItem> items;

    @Valid
    private GuestAddress address;

    private Long cancelOrderId;
    private String guestCheckoutToken;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestCartItem {
        private Long productId;
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestAddress {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please provide a valid 10-digit Indian mobile number")
        private String mobile;

        @Email(message = "Please provide a valid email address")
        private String email;

        @NotBlank(message = "Address line is required")
        private String address;

        private String area;

        @NotBlank(message = "City is required")
        private String city;

        private String district;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "Pincode is required")
        private String pincode;

        private String landmark;
    }
}
