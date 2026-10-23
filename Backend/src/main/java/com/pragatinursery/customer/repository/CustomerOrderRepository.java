package com.pragatinursery.customer.repository;

import com.pragatinursery.customer.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    boolean existsByOrderId(Long orderId);

    @Modifying
    @Query(value = "INSERT IGNORE INTO customer_orders (customer_id, order_id, amount, created_at) " +
                   "VALUES (:customerId, :orderId, :amount, CURRENT_TIMESTAMP)", nativeQuery = true)
    int tryClaimOrder(@Param("customerId") Long customerId, @Param("orderId") Long orderId, @Param("amount") BigDecimal amount);
}
