package com.pragatinursery.catalog.repository;

import com.pragatinursery.catalog.entity.Product;
import com.pragatinursery.common.enums.StockStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    @EntityGraph(attributePaths = {"category"})
    Optional<Product> findBySlug(String slug);
    
    @EntityGraph(attributePaths = {"category"})
    Optional<Product> findBySlugAndActiveTrue(String slug);
    
    @EntityGraph(attributePaths = {"category"})
    List<Product> findByCategorySlug(String categorySlug);
    
    @EntityGraph(attributePaths = {"category"})
    List<Product> findByActiveTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);
    
    Boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsBySlugAndActiveTrue(String slug);
    boolean existsBySlugAndActiveTrueAndIdNot(String slug, Long id);
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);
    boolean existsBySkuAndActiveTrue(String sku);
    boolean existsBySkuAndActiveTrueAndIdNot(String sku, Long id);
    
    boolean existsByCategoryId(Long categoryId);
    long countByCategoryId(Long categoryId);
    long countByCategoryIdAndActiveTrue(Long categoryId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true " +
           "AND (p.category.id = :categoryId OR LOWER(REPLACE(p.category.slug, '_', '-')) = LOWER(REPLACE(:categorySlug, '_', '-')))")
    long countActiveProductsForCategory(@Param("categoryId") Long categoryId, @Param("categorySlug") String categorySlug);

    List<Product> findByCategoryId(Long categoryId);

    // Custom Search Query for Public Catalog (Active Products Only)
    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.status = com.pragatinursery.common.enums.CategoryStatus.ACTIVE " +
           "AND (:categorySlug IS NULL OR p.category.slug = :categorySlug OR LOWER(REPLACE(p.category.slug, '_', '-')) = LOWER(REPLACE(:categorySlug, '_', '-'))) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findPublicProducts(
            @Param("categorySlug") String categorySlug,
            @Param("search") String search,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            Pageable pageable);

    // Custom Search Query for Admin Catalog (All Products)
    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categorySlug IS NULL OR p.category.slug = :categorySlug OR LOWER(REPLACE(p.category.slug, '_', '-')) = LOWER(REPLACE(:categorySlug, '_', '-'))) " +
           "AND (:active IS NULL OR p.active = :active) " +
           "AND (:stockStatus IS NULL OR p.stockStatus = :stockStatus)")
    Page<Product> findAdminProducts(
            @Param("search") String search,
            @Param("categorySlug") String categorySlug,
            @Param("active") Boolean active,
            @Param("stockStatus") StockStatus stockStatus,
            Pageable pageable);
}
