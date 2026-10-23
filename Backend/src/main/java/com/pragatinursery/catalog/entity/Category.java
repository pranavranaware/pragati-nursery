package com.pragatinursery.catalog.entity;

import com.pragatinursery.common.enums.CategoryStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Column(name = "name_mr", length = 100)
    private String nameMr;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "description_mr", columnDefinition = "TEXT")
    private String descriptionMr;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoryStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public String getName() {
        return nameEn != null && !nameEn.trim().isEmpty() ? nameEn : name;
    }

    public String getDescription() {
        return descriptionEn != null && !descriptionEn.trim().isEmpty() ? descriptionEn : description;
    }
}
