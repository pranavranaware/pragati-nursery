package com.pragatinursery.catalog.entity;

import com.pragatinursery.common.enums.VideoSource;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_videos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VideoSource source;

    @Column(name = "video_url", length = 500)
    private String url;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnail;
}
