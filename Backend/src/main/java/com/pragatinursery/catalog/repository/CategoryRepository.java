package com.pragatinursery.catalog.repository;

import com.pragatinursery.catalog.entity.Category;
import com.pragatinursery.common.enums.CategoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    Optional<Category> findBySlugAndStatus(String slug, CategoryStatus status);
    List<Category> findByStatus(CategoryStatus status);
    List<Category> findByStatusOrderByNameAsc(CategoryStatus status);
    Optional<Category> findFirstByStatusAndIdNot(CategoryStatus status, Long id);
    Boolean existsBySlug(String slug);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    boolean existsBySlugAndIdNot(String slug, Long id);
    Page<Category> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Category> findByNameContainingIgnoreCaseAndStatus(String name, CategoryStatus status, Pageable pageable);
    Page<Category> findByStatus(CategoryStatus status, Pageable pageable);
}
