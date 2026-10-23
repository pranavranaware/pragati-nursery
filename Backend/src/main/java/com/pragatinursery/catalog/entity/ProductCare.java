package com.pragatinursery.catalog.entity;

import com.pragatinursery.common.enums.CareIcon;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_cares")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CareIcon icon;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(name = "label_en", length = 100)
    private String labelEn;

    @Column(name = "label_mr", length = 100)
    private String labelMr;

    @Column(nullable = false)
    private String value;

    @Column(name = "value_en")
    private String valueEn;

    @Column(name = "value_mr")
    private String valueMr;
}
