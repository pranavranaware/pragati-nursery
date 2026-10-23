package com.pragatinursery.customer.repository;

import com.pragatinursery.customer.entity.Customer;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Customer c WHERE c.user.id = :userId")
    Optional<Customer> findByUserIdWithLock(@Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Customer c WHERE c.user IS NULL AND c.mobile = :mobile")
    Optional<Customer> findByGuestMobileWithLock(@Param("mobile") String mobile);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Customer c WHERE c.user IS NULL AND LOWER(c.email) = LOWER(:email)")
    Optional<Customer> findByGuestEmailWithLock(@Param("email") String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Customer c WHERE c.identityKey = :identityKey")
    Optional<Customer> findByIdentityKeyWithLock(@Param("identityKey") String identityKey);

    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "INSERT INTO customers (identity_key, user_id, name, mobile, email, address, city, district, state, pincode, total_orders, total_spent, created_at, updated_at) " +
                   "VALUES (:identityKey, :userId, :name, :mobile, :email, :address, :city, :district, :state, :pincode, 0, 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
                   "ON DUPLICATE KEY UPDATE identity_key = identity_key", nativeQuery = true)
    int createCustomerIfAbsent(
            @Param("identityKey") String identityKey,
            @Param("userId") Long userId,
            @Param("name") String name,
            @Param("mobile") String mobile,
            @Param("email") String email,
            @Param("address") String address,
            @Param("city") String city,
            @Param("district") String district,
            @Param("state") String state,
            @Param("pincode") String pincode
    );

    Optional<Customer> findByUserId(Long userId);
    Optional<Customer> findByMobile(String mobile);

    @Query("SELECT DISTINCT c.district FROM Customer c WHERE c.district IS NOT NULL AND TRIM(c.district) != '' ORDER BY c.district ASC")
    List<String> findDistinctDistricts();

    @Query("SELECT c FROM Customer c WHERE " +
           "(:district IS NULL OR TRIM(:district) = '' OR LOWER(c.district) = LOWER(TRIM(:district))) AND " +
           "(:search IS NULL OR TRIM(:search) = '' OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', TRIM(:search), '%')) OR " +
           " c.mobile LIKE CONCAT('%', TRIM(:search), '%') OR " +
           " LOWER(c.email) LIKE LOWER(CONCAT('%', TRIM(:search), '%')))")
    Page<Customer> searchAdminCustomers(
            @Param("search") String search,
            @Param("district") String district,
            Pageable pageable
    );
}
