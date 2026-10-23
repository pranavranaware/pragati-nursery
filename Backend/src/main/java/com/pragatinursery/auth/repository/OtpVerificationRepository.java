package com.pragatinursery.auth.repository;

import com.pragatinursery.auth.entity.OtpVerification;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM OtpVerification o WHERE o.mobile = :mobile AND o.purpose = :purpose AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    List<OtpVerification> findActiveOtpsWithLock(@Param("mobile") String mobile, @Param("purpose") String purpose, @Param("now") Instant now);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.verifiedAt = :now WHERE o.id = :id AND o.verifiedAt IS NULL AND o.expiresAt > :now AND o.attempts < 3")
    int tryConsumeOtp(@Param("id") Long id, @Param("now") Instant now);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.attempts = o.attempts + 1, o.expiresAt = CASE WHEN (o.attempts + 1) >= 3 THEN :now ELSE o.expiresAt END WHERE o.id = :id AND o.verifiedAt IS NULL AND o.expiresAt > :now")
    int recordFailedAttempt(@Param("id") Long id, @Param("now") Instant now);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.expiresAt = :now WHERE o.mobile = :mobile AND o.purpose = :purpose AND o.expiresAt > :now")
    int invalidateActiveOtps(@Param("mobile") String mobile, @Param("purpose") String purpose, @Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :now")
    int deleteExpiredOtps(@Param("now") Instant now);
}
