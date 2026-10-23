package com.pragatinursery.order.service;

import com.pragatinursery.account.entity.Address;
import com.pragatinursery.account.repository.AddressRepository;
import com.pragatinursery.auth.entity.User;
import com.pragatinursery.cart.entity.Cart;
import com.pragatinursery.cart.entity.CartItem;
import com.pragatinursery.cart.repository.CartItemRepository;
import com.pragatinursery.cart.repository.CartRepository;
import com.pragatinursery.catalog.entity.Category;
import com.pragatinursery.catalog.entity.Product;
import com.pragatinursery.catalog.repository.ProductRepository;
import com.pragatinursery.common.enums.CategoryStatus;
import com.pragatinursery.common.enums.OrderStatus;
import com.pragatinursery.common.enums.PaymentMethod;
import com.pragatinursery.common.enums.PaymentStatus;
import com.pragatinursery.common.enums.StockStatus;
import com.pragatinursery.order.dto.request.CreateOrderRequest;
import com.pragatinursery.order.dto.response.OrderCreatedResponse;
import com.pragatinursery.order.entity.Order;
import com.pragatinursery.order.entity.OrderItem;
import com.pragatinursery.order.repository.OrderRepository;
import com.pragatinursery.payment.entity.Payment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.pragatinursery.customer.service.CustomerService;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CustomerService customerService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User user;
    private Address address;
    private Product product;
    private Cart cart;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@example.com").mobile("9876543210").build();
        address = Address.builder().id(1L).fullName("Test User").mobile("9876543210").address("123 Street").city("City").state("State").pincode("123456").build();

        Category category = Category.builder().id(1L).name("Plants").status(CategoryStatus.ACTIVE).build();
        product = Product.builder()
                .id(100L)
                .name("Rose Plant")
                .price(BigDecimal.valueOf(200))
                .stockQuantity(10)
                .stockStatus(StockStatus.IN_STOCK)
                .active(true)
                .category(category)
                .build();

        CartItem cartItem = CartItem.builder().id(10L).product(product).quantity(2).build();
        cart = Cart.builder().id(5L).user(user).items(new ArrayList<>(List.of(cartItem))).build();
        cartItem.setCart(cart);
    }

    @Test
    void testCreateOrderOnline_DoesNotClearCart() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .addressId(1L)
                .paymentMethod(PaymentMethod.ONLINE)
                .build();

        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(addressRepository.findByIdAndUserId(1L, user.getId())).thenReturn(Optional.of(address));
        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product));
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(1L);
            return o;
        });

        OrderCreatedResponse response = orderService.createOrder(user, request);

        assertNotNull(response);
        assertEquals(PaymentMethod.ONLINE, response.getPaymentMethod());
        assertEquals(PaymentStatus.PENDING, response.getPaymentStatus());
        verify(cartItemRepository, never()).deleteByCartId(anyLong());
    }

    @Test
    void testCreateOrderCOD_ClearsCart() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .addressId(1L)
                .paymentMethod(PaymentMethod.COD)
                .build();

        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(addressRepository.findByIdAndUserId(1L, user.getId())).thenReturn(Optional.of(address));
        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product));
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(1L);
            return o;
        });

        OrderCreatedResponse response = orderService.createOrder(user, request);

        assertNotNull(response);
        assertEquals(PaymentMethod.COD, response.getPaymentMethod());
        verify(cartItemRepository, times(1)).deleteByCartId(5L);
    }

    @Test
    void testCancelOrder_RestoresStockIdempotently() {
        Payment payment = Payment.builder().method(PaymentMethod.ONLINE).status(PaymentStatus.PENDING).build();
        Order order = Order.builder()
                .id(50L)
                .orderNumber("PN-2026-00050")
                .user(user)
                .status(OrderStatus.PLACED)
                .payment(payment)
                .items(new ArrayList<>())
                .build();
        payment.setOrder(order);

        OrderItem orderItem = OrderItem.builder().order(order).product(product).quantity(3).build();
        order.getItems().add(orderItem);

        when(orderRepository.findByIdWithLock(50L)).thenReturn(Optional.of(order));
        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product));

        // First cancellation
        orderService.cancelOrder(user, 50L, null);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        assertEquals(13, product.getStockQuantity()); // 10 + 3 = 13

        // Second cancellation (idempotency check)
        orderService.cancelOrder(user, 50L, null);
        assertEquals(13, product.getStockQuantity()); // Stock remains 13, not 16
    }

    @Test
    void testGuestCheckout_GeneratesGuestToken() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .paymentMethod(PaymentMethod.ONLINE)
                .address(CreateOrderRequest.GuestAddress.builder()
                        .fullName("Guest User")
                        .mobile("9999999999")
                        .email("guest@example.com")
                        .address("Guest Addr")
                        .city("City")
                        .state("State")
                        .pincode("111222")
                        .build())
                .items(List.of(new CreateOrderRequest.GuestCartItem(100L, 1)))
                .build();

        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product));
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(2L);
            return o;
        });

        OrderCreatedResponse response = orderService.createOrder(null, request);

        assertNotNull(response);
        assertNotNull(response.getGuestCheckoutToken());
        assertFalse(response.getGuestCheckoutToken().isEmpty());
    }

    @Test
    void testGuestCheckout_WithEmptyEmail_Succeeds() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .paymentMethod(PaymentMethod.ONLINE)
                .address(CreateOrderRequest.GuestAddress.builder()
                        .fullName("Guest User")
                        .mobile("9999999999")
                        .email("   ")
                        .address("Guest Addr")
                        .city("City")
                        .state("State")
                        .pincode("111222")
                        .build())
                .items(List.of(new CreateOrderRequest.GuestCartItem(100L, 1)))
                .build();

        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product));
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(3L);
            return o;
        });

        OrderCreatedResponse response = orderService.createOrder(null, request);

        assertNotNull(response);
        assertNotNull(response.getGuestCheckoutToken());
        assertFalse(response.getGuestCheckoutToken().isEmpty());
    }
}
