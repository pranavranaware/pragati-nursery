package com.pragatinursery.order.repository;

import com.pragatinursery.common.enums.OrderStatus;
import com.pragatinursery.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    Optional<Order> findByOrderNumberAndUserId(String orderNumber, Long userId);
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    Page<Order> findByUserId(Long userId, Pageable pageable);
    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT o FROM Order o LEFT JOIN o.user u WHERE " +
           "o.shippingEmail = :inputValue OR " +
           "o.shippingMobile = :inputValue OR " +
           "(u IS NOT NULL AND (u.email = :inputValue OR u.mobile = :inputValue)) " +
           "ORDER BY o.orderDate DESC")
    List<Order> findByEmailOrMobile(@Param("inputValue") String inputValue);

    @Query(value = "SELECT * FROM orders o WHERE RIGHT(REGEXP_REPLACE(o.shipping_mobile, '[^0-9]', ''), 10) = :mobile10 ORDER BY o.order_date DESC", nativeQuery = true)
    List<Order> findByNormalizedShippingMobile(@Param("mobile10") String mobile10);
}
