package com.pragatinursery.order.service;

import com.pragatinursery.account.entity.Address;
import com.pragatinursery.account.repository.AddressRepository;
import com.pragatinursery.auth.entity.User;
import com.pragatinursery.cart.entity.Cart;
import com.pragatinursery.cart.entity.CartItem;
import com.pragatinursery.cart.repository.CartItemRepository;
import com.pragatinursery.cart.repository.CartRepository;
import com.pragatinursery.catalog.entity.Product;
import com.pragatinursery.catalog.entity.ProductImage;
import com.pragatinursery.catalog.repository.ProductRepository;
import com.pragatinursery.common.enums.CategoryStatus;
import com.pragatinursery.common.enums.OrderStatus;
import com.pragatinursery.common.enums.PaymentMethod;
import com.pragatinursery.common.enums.PaymentStatus;
import com.pragatinursery.common.enums.StockStatus;
import com.pragatinursery.common.exception.BadRequestException;
import com.pragatinursery.common.exception.ResourceNotFoundException;
import com.pragatinursery.common.response.PagedResponse;
import com.pragatinursery.order.dto.request.CreateOrderRequest;
import com.pragatinursery.order.dto.response.*;
import com.pragatinursery.order.entity.Order;
import com.pragatinursery.order.entity.OrderItem;
import com.pragatinursery.order.repository.OrderRepository;
import com.pragatinursery.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final com.pragatinursery.common.repository.BusinessSettingsRepository businessSettingsRepository;
    private final com.pragatinursery.customer.service.CustomerService customerService;

    @Override
    @Transactional
    public OrderCreatedResponse createOrder(User user, CreateOrderRequest request) {
        class ItemDetail {
            Long productId;
            int quantity;
            ItemDetail(Long productId, int quantity) {
                this.productId = productId;
                this.quantity = quantity;
            }
        }

        // 0. Targeted Cancellation of specific pending order if requested
        if (request.getCancelOrderId() != null) {
            cancelOrder(user, request.getCancelOrderId(), request.getGuestCheckoutToken());
        }

        List<ItemDetail> itemsToProcess = new ArrayList<>();
        if (user != null) {
            // 1. Verify Cart
            Cart cart = cartRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BadRequestException("Your cart is empty. Please add items before checking out."));

            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new BadRequestException("Your cart is empty. Please add items before checking out.");
            }
            for (CartItem cartItem : cart.getItems()) {
                itemsToProcess.add(new ItemDetail(cartItem.getProduct().getId(), cartItem.getQuantity()));
            }
        } else {
            // Guest user: read items from DTO
            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new BadRequestException("Your cart is empty. Please add items before checking out.");
            }
            for (CreateOrderRequest.GuestCartItem item : request.getItems()) {
                itemsToProcess.add(new ItemDetail(item.getProductId(), item.getQuantity()));
            }
        }

        // 2. Verify Delivery Address
        Address addressObj = null;
        String shippingName = "";
        String shippingMobile = "";
        String shippingEmail = "";
        String shippingAddress = "";
        String shippingCity = "";
        String shippingDistrict = "";
        String shippingState = "";
        String shippingPincode = "";
        String shippingLandmark = "";

        if (user != null) {
            addressObj = addressRepository.findByIdAndUserId(request.getAddressId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Delivery address not found with id: " + request.getAddressId()));
            shippingName = addressObj.getFullName() != null ? addressObj.getFullName().trim() : "";
            shippingMobile = addressObj.getMobile() != null ? addressObj.getMobile().trim() : "";
            shippingEmail = (addressObj.getEmail() != null && !addressObj.getEmail().trim().isEmpty()) ? addressObj.getEmail().trim().toLowerCase() : (user.getEmail() != null ? user.getEmail().trim().toLowerCase() : "");
            shippingAddress = addressObj.getAddress();
            shippingCity = addressObj.getCity();
            shippingDistrict = addressObj.getDistrict() != null ? addressObj.getDistrict().trim() : "";
            shippingState = addressObj.getState();
            shippingPincode = addressObj.getPincode();
            shippingLandmark = addressObj.getLandmark();
        } else {
            CreateOrderRequest.GuestAddress guestAddress = request.getAddress();
            if (guestAddress == null) {
                throw new BadRequestException("Delivery address details are required for guest checkout.");
            }
            if (guestAddress.getFullName() == null || guestAddress.getFullName().trim().isEmpty()) {
                throw new BadRequestException("Full name is required.");
            }
            if (guestAddress.getMobile() == null || guestAddress.getMobile().trim().isEmpty()) {
                throw new BadRequestException("Mobile number is required.");
            }
            if (guestAddress.getAddress() == null || guestAddress.getAddress().trim().isEmpty()) {
                throw new BadRequestException("Address is required.");
            }
            if (guestAddress.getCity() == null || guestAddress.getCity().trim().isEmpty()) {
                throw new BadRequestException("City is required.");
            }
            if (guestAddress.getState() == null || guestAddress.getState().trim().isEmpty()) {
                throw new BadRequestException("State is required.");
            }
            if (guestAddress.getPincode() == null || guestAddress.getPincode().trim().isEmpty()) {
                throw new BadRequestException("Pincode is required.");
            }
            shippingName = guestAddress.getFullName().trim();
            shippingMobile = guestAddress.getMobile().trim();
            shippingEmail = (guestAddress.getEmail() != null && !guestAddress.getEmail().trim().isEmpty()) ? guestAddress.getEmail().trim().toLowerCase() : "";
            shippingAddress = guestAddress.getAddress().trim();
            shippingCity = guestAddress.getCity().trim();
            shippingDistrict = guestAddress.getDistrict() != null ? guestAddress.getDistrict().trim() : "";
            shippingState = guestAddress.getState().trim();
            shippingPincode = guestAddress.getPincode().trim();
            shippingLandmark = guestAddress.getLandmark() != null ? guestAddress.getLandmark().trim() : "";
        }

        // Validate Mobile and Email Regex
        if (!shippingMobile.matches("^[6-9]\\d{9}$")) {
            throw new BadRequestException("Please provide a valid 10-digit Indian mobile number");
        }
        if (org.springframework.util.StringUtils.hasText(shippingEmail) && !shippingEmail.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new BadRequestException("Please provide a valid email address");
        }

        // 3. Validate Items & Stock, Calculate Prices
        BigDecimal subtotal = BigDecimal.ZERO;
        java.util.Map<Long, Product> lockedProductsMap = new java.util.HashMap<>();

        for (ItemDetail item : itemsToProcess) {
            Product product = productRepository.findByIdWithLock(item.productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.productId));

            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is no longer active.");
            }

            if (product.getCategory() == null || product.getCategory().getStatus() != CategoryStatus.ACTIVE) {
                throw new BadRequestException("Category for product '" + product.getName() + "' is currently inactive.");
            }

            if (item.quantity <= 0) {
                throw new BadRequestException("Invalid item quantity.");
            }

            if (item.quantity > product.getStockQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() + "'. Available: " + product.getStockQuantity() + ", Requested: " + item.quantity + ".");
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(item.quantity));
            subtotal = subtotal.add(lineTotal);
            lockedProductsMap.put(product.getId(), product);
        }

        // 4. Calculate Delivery Fee & Total Amount (Delivery fee determined separately after order placement)
        BigDecimal deliveryFee = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal;

        // 5. Generate Order Number & Guest Token
        long count = orderRepository.count();
        String orderNumber = String.format("PN-2026-%05d", count + 1);
        String guestToken = java.util.UUID.randomUUID().toString().replace("-", "");

        // 6. Build Order Entity & Address Snapshot
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .address(addressObj)
                .shippingName(shippingName)
                .shippingMobile(shippingMobile)
                .shippingEmail(shippingEmail)
                .shippingAddress(shippingAddress)
                .shippingCity(shippingCity)
                .shippingDistrict(shippingDistrict)
                .shippingState(shippingState)
                .shippingPincode(shippingPincode)
                .shippingLandmark(shippingLandmark)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .totalAmount(totalAmount)
                .status(OrderStatus.PLACED)
                .guestToken(guestToken)
                .build();

        // 7. Create OrderItems & Deduct Product Stock
        List<OrderItem> orderItems = new ArrayList<>();
        for (ItemDetail item : itemsToProcess) {
            Product product = lockedProductsMap.getOrDefault(item.productId, null);

            // Deduct stock safely with lock held
            int newStock = product.getStockQuantity() - item.quantity;
            product.setStockQuantity(newStock);
            product.setStockStatus(calculateStockStatus(newStock));
            productRepository.save(product);

            String primaryImageUrl = "";
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                primaryImageUrl = product.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .findFirst()
                        .map(ProductImage::getSrc)
                        .orElse(product.getImages().get(0).getSrc());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .name(product.getName())
                    .price(product.getPrice())
                    .quantity(item.quantity)
                    .image(primaryImageUrl)
                    .build();

            orderItems.add(orderItem);
        }
        order.setItems(orderItems);

        // 8. Create Payment Record
        Payment payment = Payment.builder()
                .order(order)
                .method(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .amount(totalAmount)
                .build();
        order.setPayment(payment);

        // 9. Save Order & Clear Cart (COD only)
        Order savedOrder = orderRepository.save(order);

        if (request.getPaymentMethod() == PaymentMethod.COD) {
            customerService.processSuccessfulOrder(savedOrder);
            if (user != null) {
                Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
                if (cart != null) {
                    cart.getItems().clear();
                    cartItemRepository.deleteByCartId(cart.getId());
                }
            }
        }

        log.info("Created order {} for user {} (Total: ₹{}, Payment: {})", savedOrder.getOrderNumber(), user != null ? user.getEmail() : "GUEST", savedOrder.getTotalAmount(), request.getPaymentMethod());

        return OrderCreatedResponse.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .status(savedOrder.getStatus())
                .totalAmount(savedOrder.getTotalAmount())
                .paymentMethod(payment.getMethod())
                .paymentStatus(payment.getStatus())
                .guestCheckoutToken(savedOrder.getGuestToken())
                .build();
    }

    @Override
    @Transactional
    public void cancelOrder(User user, Long orderId, String guestCheckoutToken) {
        if (orderId == null) return;

        Order order = orderRepository.findByIdWithLock(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Validate ownership
        if (user != null) {
            if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
                throw new ResourceNotFoundException("Order not found with id: " + orderId);
            }
        } else {
            if (order.getUser() != null || !org.springframework.util.StringUtils.hasText(guestCheckoutToken)
                    || !guestCheckoutToken.equals(order.getGuestToken())) {
                throw new ResourceNotFoundException("Order not found with id: " + orderId);
            }
        }

        // Idempotency check: if already cancelled, do nothing
        if (order.getStatus() == OrderStatus.CANCELLED) {
            log.info("Order {} is already cancelled. Skipping cancellation.", order.getOrderNumber());
            return;
        }

        if (order.getStatus() == OrderStatus.CONFIRMED || (order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.PAID)) {
            throw new BadRequestException("Cannot cancel an order that has already been confirmed or paid.");
        }

        if (order.getPayment() != null && order.getPayment().getMethod() != PaymentMethod.ONLINE) {
            throw new BadRequestException("Only pending ONLINE orders can be cancelled.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPayment() != null) {
            order.getPayment().setStatus(PaymentStatus.FAILED);
            order.getPayment().setFailureReason("Cancelled by user");
        }

        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = productRepository.findByIdWithLock(item.getProduct().getId())
                        .orElse(item.getProduct());
                int restoredStock = product.getStockQuantity() + item.getQuantity();
                product.setStockQuantity(restoredStock);
                product.setStockStatus(calculateStockStatus(restoredStock));
                productRepository.save(product);
            }
        }

        orderRepository.save(order);
        log.info("Cancelled pending online order {} and restored stock", order.getOrderNumber());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getCustomerOrders(User user, int page, int size, String sort, String direction) {
        String validSort = (sort == null || sort.trim().isEmpty() || !List.of("orderDate", "id", "totalAmount", "status").contains(sort)) ? "orderDate" : sort;
        Sort sortObj = direction.equalsIgnoreCase("asc") ? Sort.by(validSort).ascending() : Sort.by(validSort).descending();
        Pageable pageable = PageRequest.of(Math.max(0, page), size <= 0 ? 10 : size, sortObj);

        Page<Order> orderPage = orderRepository.findByUserId(user.getId(), pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .toList();

        return PagedResponse.<OrderResponse>builder()
                .content(content)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getCustomerOrderById(User user, Long id) {
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getCustomerOrderByOrderNumber(User user, String orderNumber) {
        Order order;
        if (user != null) {
            order = orderRepository.findByOrderNumberAndUserId(orderNumber, user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        } else {
            order = orderRepository.findByOrderNumber(orderNumber)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
            if (order.getUser() != null) {
                throw new ResourceNotFoundException("Order not found with number: " + orderNumber);
            }
        }
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAllOrders(int page, int size, String sort, String direction) {
        String validSort = (sort == null || sort.trim().isEmpty() || !List.of("orderDate", "id", "totalAmount", "status").contains(sort)) ? "orderDate" : sort;
        Sort sortOrder = direction.equalsIgnoreCase("desc") ? Sort.by(validSort).descending() : Sort.by(validSort).ascending();
        Pageable pageable = PageRequest.of(Math.max(0, page), size <= 0 ? 10 : size, sortOrder);
        Page<Order> orderPage = orderRepository.findAll(pageable);
        List<OrderResponse> content = orderPage.getContent().stream().map(this::mapToOrderResponse).toList();
        return PagedResponse.<OrderResponse>builder()
                .content(content)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String orderNumber, OrderStatus status) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        order.setStatus(status);
        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    private StockStatus calculateStockStatus(int quantity) {
        if (quantity <= 0) return StockStatus.OUT_OF_STOCK;
        if (quantity <= 5) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> {
                    BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    return OrderItemResponse.builder()
                            .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                            .productName(item.getName())
                            .sku(item.getProduct() != null ? item.getProduct().getSku() : "")
                            .unitPrice(item.getPrice())
                            .quantity(item.getQuantity())
                            .lineTotal(lineTotal)
                            .image(item.getImage())
                            .build();
                })
                .toList();

        Address addr = order.getAddress();
        OrderAddressResponse addressResponse = OrderAddressResponse.builder()
                .fullName(order.getShippingName() != null ? order.getShippingName() : (addr != null ? addr.getFullName() : ""))
                .mobile(order.getShippingMobile() != null ? order.getShippingMobile() : (addr != null ? addr.getMobile() : ""))
                .address(order.getShippingAddress() != null ? order.getShippingAddress() : (addr != null ? addr.getAddress() : ""))
                .city(order.getShippingCity() != null ? order.getShippingCity() : (addr != null ? addr.getCity() : ""))
                .district(order.getShippingDistrict() != null ? order.getShippingDistrict() : (addr != null ? addr.getDistrict() : ""))
                .state(order.getShippingState() != null ? order.getShippingState() : (addr != null ? addr.getState() : ""))
                .pincode(order.getShippingPincode() != null ? order.getShippingPincode() : (addr != null ? addr.getPincode() : ""))
                .landmark(order.getShippingLandmark() != null ? order.getShippingLandmark() : (addr != null ? addr.getLandmark() : ""))
                .build();

        OrderPaymentResponse paymentResponse = order.getPayment() != null ? OrderPaymentResponse.builder()
                .method(order.getPayment().getMethod())
                .status(order.getPayment().getStatus())
                .razorpayOrderId(order.getPayment().getRazorpayOrderId())
                .build() : null;

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .payment(paymentResponse)
                .items(itemResponses)
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(addressResponse)
                .orderDate(order.getOrderDate())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> lookupOrdersByEmailOrMobile(String emailOrMobile) {
        if (emailOrMobile == null || emailOrMobile.trim().isEmpty()) {
            throw new com.pragatinursery.common.exception.BadRequestException("Email address or phone number is required.");
        }
        String queryVal = emailOrMobile.trim();
        List<Order> orders = orderRepository.findByEmailOrMobile(queryVal);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .toList();
    }
}
