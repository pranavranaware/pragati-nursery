package com.pragatinursery.catalog.service;

import com.pragatinursery.catalog.dto.request.*;
import com.pragatinursery.catalog.dto.response.*;
import com.pragatinursery.catalog.entity.*;
import com.pragatinursery.catalog.repository.CategoryRepository;
import com.pragatinursery.catalog.repository.ProductRepository;
import com.pragatinursery.common.enums.CategoryStatus;
import com.pragatinursery.common.enums.StockStatus;
import com.pragatinursery.common.enums.VideoSource;
import com.pragatinursery.common.exception.BadRequestException;
import com.pragatinursery.common.exception.DuplicateResourceException;
import com.pragatinursery.common.exception.ResourceNotFoundException;
import com.pragatinursery.common.response.PagedResponse;
import com.pragatinursery.order.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.pragatinursery.cart.repository.CartItemRepository;
import com.pragatinursery.wishlist.repository.WishlistRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final WishlistRepository wishlistRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> getPublicProducts(int page, int size, String search, String categorySlug, BigDecimal minPrice, BigDecimal maxPrice, String sort, String direction) {
        Pageable pageable = createPageable(page, size, sort, direction);
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;
        String cleanCategory = StringUtils.hasText(categorySlug) ? categorySlug.trim() : null;

        Page<Product> productPage = productRepository.findPublicProducts(cleanCategory, cleanSearch, minPrice, maxPrice, pageable);

        List<ProductSummaryResponse> content = productPage.getContent().stream()
                .map(this::mapToProductSummaryResponse)
                .toList();

        return buildPagedResponse(productPage, content);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getPublicProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));

        if (product.getCategory().getStatus() != CategoryStatus.ACTIVE) {
            throw new ResourceNotFoundException("Product not found with slug: " + slug);
        }

        return mapToProductResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductSummaryResponse> getPublicProductsByCategory(String categorySlug, int page, int size, String search, String sort, String direction) {
        Category category = categoryRepository.findBySlugAndStatus(categorySlug, CategoryStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + categorySlug));

        return getPublicProducts(page, size, search, category.getSlug(), null, null, sort, direction);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductAdminResponse> getAdminProducts(int page, int size, String search, String categorySlug, Boolean active, StockStatus stockStatus, String sort, String direction) {
        Pageable pageable = createPageable(page, size, sort, direction);
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;
        String cleanCategory = StringUtils.hasText(categorySlug) ? categorySlug.trim() : null;

        Boolean activeFilter = active != null ? active : true;
        Page<Product> productPage = productRepository.findAdminProducts(cleanSearch, cleanCategory, activeFilter, stockStatus, pageable);

        List<ProductAdminResponse> content = productPage.getContent().stream()
                .map(this::mapToProductAdminResponse)
                .toList();

        return buildPagedResponse(productPage, content);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductAdminResponse getAdminProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToProductAdminResponse(product);
    }

    @Override
    @Transactional
    public ProductAdminResponse createProduct(CreateProductRequest request) {
        String sku = request.getSku().trim().toUpperCase();
        if (productRepository.existsBySkuAndActiveTrue(sku)) {
            throw new DuplicateResourceException("Product SKU '" + sku + "' already exists.");
        }

        String nameEn = StringUtils.hasText(request.getNameEn()) ? request.getNameEn().trim() : (request.getName() != null ? request.getName().trim() : "");
        String nameMr = StringUtils.hasText(request.getNameMr()) ? request.getNameMr().trim() : null;
        String nameForSlug = StringUtils.hasText(nameEn) ? nameEn : (request.getName() != null ? request.getName().trim() : "");

        String rawSlug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : nameForSlug;
        String slug = slugify(rawSlug);

        if (productRepository.existsBySlugAndActiveTrue(slug)) {
            throw new DuplicateResourceException("Product slug '" + slug + "' already exists.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (category.getStatus() != CategoryStatus.ACTIVE) {
            throw new BadRequestException("Cannot assign product to an inactive category.");
        }

        int stockQty = request.getStockQuantity() != null ? request.getStockQuantity() : 0;
        StockStatus stockStatus = calculateStockStatus(stockQty);

        String descriptionEn = StringUtils.hasText(request.getDescriptionEn()) ? request.getDescriptionEn().trim() : (request.getDescription() != null ? request.getDescription().trim() : null);
        String descriptionMr = StringUtils.hasText(request.getDescriptionMr()) ? request.getDescriptionMr().trim() : null;

        Product product = Product.builder()
                .sku(sku)
                .slug(slug)
                .nameEn(nameEn)
                .nameMr(nameMr)
                .name(nameForSlug)
                .category(category)
                .descriptionEn(descriptionEn)
                .descriptionMr(descriptionMr)
                .description(descriptionEn != null ? descriptionEn : request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .badge(request.getBadge() != null ? request.getBadge().trim() : null)
                .stockQuantity(stockQty)
                .stockStatus(stockStatus)
                .rating(0.0)
                .reviewCount(0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        attachChildEntities(product, request.getImages(), request.getVideo(), request.getInfo(), request.getCare());

        Product savedProduct = productRepository.save(product);
        log.info("Created new product: {} (SKU: {}, ID: {})", savedProduct.getName(), savedProduct.getSku(), savedProduct.getId());

        return mapToProductAdminResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductAdminResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        String sku = request.getSku().trim().toUpperCase();
        if (productRepository.existsBySkuAndActiveTrueAndIdNot(sku, id)) {
            throw new DuplicateResourceException("Another product with SKU '" + sku + "' already exists.");
        }

        String nameEn = StringUtils.hasText(request.getNameEn()) ? request.getNameEn().trim() : (request.getName() != null ? request.getName().trim() : product.getNameEn());
        String nameMr = StringUtils.hasText(request.getNameMr()) ? request.getNameMr().trim() : product.getNameMr();
        String nameForSlug = StringUtils.hasText(nameEn) ? nameEn : (product.getName() != null ? product.getName() : "");

        String rawSlug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : nameForSlug;
        String slug = slugify(rawSlug);

        if (productRepository.existsBySlugAndActiveTrueAndIdNot(slug, id)) {
            throw new DuplicateResourceException("Another product with slug '" + slug + "' already exists.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (category.getStatus() != CategoryStatus.ACTIVE) {
            throw new BadRequestException("Cannot assign product to an inactive category.");
        }

        int stockQty = request.getStockQuantity() != null ? request.getStockQuantity() : product.getStockQuantity();
        StockStatus stockStatus = calculateStockStatus(stockQty);

        String descriptionEn = request.getDescriptionEn() != null ? request.getDescriptionEn().trim() : (request.getDescription() != null ? request.getDescription().trim() : product.getDescriptionEn());
        String descriptionMr = request.getDescriptionMr() != null ? request.getDescriptionMr().trim() : product.getDescriptionMr();

        product.setSku(sku);
        product.setSlug(slug);
        product.setNameEn(nameEn);
        product.setNameMr(nameMr);
        product.setName(nameForSlug);
        product.setCategory(category);
        product.setDescriptionEn(descriptionEn);
        product.setDescriptionMr(descriptionMr);
        if (descriptionEn != null) product.setDescription(descriptionEn);
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setBadge(request.getBadge() != null ? request.getBadge().trim() : null);
        product.setStockQuantity(stockQty);
        product.setStockStatus(stockStatus);
        if (request.getActive() != null) product.setActive(request.getActive());

        product.getImages().clear();
        product.getInfo().clear();
        product.getCare().clear();

        attachChildEntities(product, request.getImages(), request.getVideo(), request.getInfo(), request.getCare());

        Product updatedProduct = productRepository.save(product);
        log.info("Updated product: {} (SKU: {}, ID: {})", updatedProduct.getName(), updatedProduct.getSku(), updatedProduct.getId());

        return mapToProductAdminResponse(updatedProduct);
    }

    @Override
    @Transactional
    public ProductAdminResponse updateProductStock(Long id, UpdateProductStockRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        int stockQty = request.getStockQuantity();
        StockStatus stockStatus = calculateStockStatus(stockQty);

        product.setStockQuantity(stockQty);
        product.setStockStatus(stockStatus);

        Product updatedProduct = productRepository.save(product);
        log.info("Updated product stock: {} (ID: {}) to {} ({})", updatedProduct.getName(), updatedProduct.getId(), stockQty, stockStatus);

        return mapToProductAdminResponse(updatedProduct);
    }

    @Override
    @Transactional
    public ProductAdminResponse updateProductStatus(Long id, UpdateProductStatusRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setActive(request.getActive());
        Product updatedProduct = productRepository.save(product);
        log.info("Updated product active status: {} (ID: {}) to {}", updatedProduct.getName(), updatedProduct.getId(), updatedProduct.isActive());

        return mapToProductAdminResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        cartItemRepository.deleteByProductId(id);
        wishlistRepository.deleteByProductId(id);

        if (orderItemRepository.existsByProductId(id)) {
            product.setActive(false);
            if (!product.getSlug().contains("-deleted-")) {
                product.setSlug(product.getSlug() + "-deleted-" + product.getId());
            }
            if (!product.getSku().contains("-DELETED-")) {
                product.setSku(product.getSku() + "-DELETED-" + product.getId());
            }
            productRepository.save(product);
            log.info("Soft-deactivated product: {} (ID: {}) because historical orders reference it.", product.getName(), product.getId());
            return;
        }

        productRepository.delete(product);
        log.info("Hard-deleted product: {} (ID: {})", product.getName(), product.getId());
    }

    private void attachChildEntities(Product product, List<ProductImageRequest> imageReqs, ProductVideoRequest videoReq, List<ProductInfoRequest> infoReqs, List<ProductCareRequest> careReqs) {
        if (imageReqs != null && !imageReqs.isEmpty()) {
            boolean hasPrimary = false;
            for (int i = 0; i < imageReqs.size(); i++) {
                ProductImageRequest req = imageReqs.get(i);
                boolean isPrimary = req.isPrimary();
                if (isPrimary) {
                    if (hasPrimary) isPrimary = false;
                    else hasPrimary = true;
                } else if (i == 0 && !hasPrimary) {
                    isPrimary = true;
                    hasPrimary = true;
                }
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .src(req.getSrc().trim())
                        .alt(req.getAlt() != null ? req.getAlt().trim() : product.getName())
                        .primary(isPrimary)
                        .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : i)
                        .build();
                product.getImages().add(image);
            }
        }

        if (videoReq != null && videoReq.getSource() != null && videoReq.getSource() != VideoSource.NONE) {
            ProductVideo video = product.getVideo();
            if (video == null) {
                video = ProductVideo.builder()
                        .product(product)
                        .source(videoReq.getSource())
                        .url(videoReq.getUrl() != null ? videoReq.getUrl().trim() : null)
                        .thumbnail(videoReq.getThumbnail() != null ? videoReq.getThumbnail().trim() : null)
                        .build();
                product.setVideo(video);
            } else {
                video.setSource(videoReq.getSource());
                video.setUrl(videoReq.getUrl() != null ? videoReq.getUrl().trim() : null);
                video.setThumbnail(videoReq.getThumbnail() != null ? videoReq.getThumbnail().trim() : null);
            }
        } else {
            product.setVideo(null);
        }

        if (infoReqs != null && !infoReqs.isEmpty()) {
            for (ProductInfoRequest req : infoReqs) {
                ProductInfo info = ProductInfo.builder()
                        .product(product)
                        .label(req.getLabel().trim())
                        .value(req.getValue().trim())
                        .build();
                product.getInfo().add(info);
            }
        }

        if (careReqs != null && !careReqs.isEmpty()) {
            for (ProductCareRequest req : careReqs) {
                String labelEn = StringUtils.hasText(req.getLabelEn()) ? req.getLabelEn().trim() : (StringUtils.hasText(req.getLabel()) ? req.getLabel().trim() : "");
                String labelMr = StringUtils.hasText(req.getLabelMr()) ? req.getLabelMr().trim() : null;

                String valueEn = StringUtils.hasText(req.getValueEn()) ? req.getValueEn().trim() : (StringUtils.hasText(req.getValue()) ? req.getValue().trim() : "");
                String valueMr = StringUtils.hasText(req.getValueMr()) ? req.getValueMr().trim() : null;

                String defaultLabel = StringUtils.hasText(labelEn) ? labelEn : (req.getIcon() != null ? req.getIcon().name() : "Care");
                String defaultValue = StringUtils.hasText(valueEn) ? valueEn : (valueMr != null ? valueMr : "");

                if (StringUtils.hasText(defaultValue) || StringUtils.hasText(valueMr)) {
                    ProductCare care = ProductCare.builder()
                            .product(product)
                            .icon(req.getIcon())
                            .label(defaultLabel)
                            .labelEn(StringUtils.hasText(labelEn) ? labelEn : defaultLabel)
                            .labelMr(labelMr)
                            .value(defaultValue)
                            .valueEn(valueEn)
                            .valueMr(valueMr)
                            .build();
                    product.getCare().add(care);
                }
            }
        }
    }

    public static final int LOW_STOCK_ALERT_THRESHOLD = 30;
    public static final int LOW_STOCK_STATUS_THRESHOLD = 5;

    private StockStatus calculateStockStatus(int quantity) {
        if (quantity <= 0) return StockStatus.OUT_OF_STOCK;
        if (quantity <= LOW_STOCK_STATUS_THRESHOLD) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }

    private String calculateStockLabel(StockStatus status) {
        switch (status) {
            case OUT_OF_STOCK: return "Out of Stock";
            case LOW_STOCK: return "Low Stock";
            default: return "In Stock";
        }
    }

    private ProductResponse mapToProductResponse(Product p) {
        String stockLabel = calculateStockLabel(p.getStockStatus());

        List<ProductImageResponse> images = p.getImages().stream()
                .map(img -> ProductImageResponse.builder()
                        .id(img.getId())
                        .src(img.getSrc())
                        .alt(img.getAlt())
                        .primary(img.isPrimary())
                        .sortOrder(img.getSortOrder())
                        .build())
                .toList();

        ProductVideoResponse video = p.getVideo() != null ? ProductVideoResponse.builder()
                .id(p.getVideo().getId())
                .source(p.getVideo().getSource())
                .url(p.getVideo().getUrl())
                .thumbnail(p.getVideo().getThumbnail())
                .build() : null;

        List<ProductInfoResponse> info = p.getInfo().stream()
                .map(inf -> ProductInfoResponse.builder()
                        .id(inf.getId())
                        .label(inf.getLabel())
                        .value(inf.getValue())
                        .build())
                .toList();

        List<ProductCareResponse> care = p.getCare().stream()
                .map(c -> {
                    String lEn = StringUtils.hasText(c.getLabelEn()) ? c.getLabelEn() : (c.getLabel() != null ? c.getLabel() : "");
                    String lMr = c.getLabelMr();
                    String vEn = StringUtils.hasText(c.getValueEn()) ? c.getValueEn() : (c.getValue() != null ? c.getValue() : "");
                    String vMr = c.getValueMr();

                    return ProductCareResponse.builder()
                            .id(c.getId())
                            .icon(c.getIcon() != null ? c.getIcon().name().toLowerCase() : "")
                            .label(lEn)
                            .labelEn(lEn)
                            .labelMr(lMr)
                            .value(vEn)
                            .valueEn(vEn)
                            .valueMr(vMr)
                            .build();
                })
                .toList();

        String nameEn = p.getNameEn() != null && !p.getNameEn().trim().isEmpty() ? p.getNameEn() : p.getName();
        String nameMr = p.getNameMr();
        String descEn = p.getDescriptionEn() != null && !p.getDescriptionEn().trim().isEmpty() ? p.getDescriptionEn() : p.getDescription();
        String descMr = p.getDescriptionMr();
        String catNameEn = p.getCategory() != null ? (p.getCategory().getNameEn() != null && !p.getCategory().getNameEn().trim().isEmpty() ? p.getCategory().getNameEn() : p.getCategory().getName()) : null;
        String catNameMr = p.getCategory() != null ? p.getCategory().getNameMr() : null;

        return ProductResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .slug(p.getSlug())
                .nameEn(nameEn)
                .nameMr(nameMr)
                .name(nameEn)
                .categoryEn(catNameEn)
                .categoryMr(catNameMr)
                .category(catNameEn)
                .categorySlug(p.getCategory() != null ? p.getCategory().getSlug() : null)
                .descriptionEn(descEn)
                .descriptionMr(descMr)
                .description(descEn)
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .badge(p.getBadge())
                .stock(stockLabel)
                .stockQuantity(p.getStockQuantity())
                .stockStatus(p.getStockStatus())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .images(images)
                .video(video)
                .info(info)
                .care(care)
                .build();
    }

    private ProductSummaryResponse mapToProductSummaryResponse(Product p) {
        String stockLabel = calculateStockLabel(p.getStockStatus());

        List<ProductImageResponse> images = p.getImages().stream()
                .map(img -> ProductImageResponse.builder()
                        .id(img.getId())
                        .src(img.getSrc())
                        .alt(img.getAlt())
                        .primary(img.isPrimary())
                        .sortOrder(img.getSortOrder())
                        .build())
                .toList();

        ProductVideoResponse video = p.getVideo() != null ? ProductVideoResponse.builder()
                .id(p.getVideo().getId())
                .source(p.getVideo().getSource())
                .url(p.getVideo().getUrl())
                .thumbnail(p.getVideo().getThumbnail())
                .build() : null;

        String nameEn = p.getNameEn() != null && !p.getNameEn().trim().isEmpty() ? p.getNameEn() : p.getName();
        String nameMr = p.getNameMr();
        String descEn = p.getDescriptionEn() != null && !p.getDescriptionEn().trim().isEmpty() ? p.getDescriptionEn() : p.getDescription();
        String descMr = p.getDescriptionMr();
        String catNameEn = p.getCategory() != null ? (p.getCategory().getNameEn() != null && !p.getCategory().getNameEn().trim().isEmpty() ? p.getCategory().getNameEn() : p.getCategory().getName()) : null;
        String catNameMr = p.getCategory() != null ? p.getCategory().getNameMr() : null;

        return ProductSummaryResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .slug(p.getSlug())
                .nameEn(nameEn)
                .nameMr(nameMr)
                .name(nameEn)
                .categoryEn(catNameEn)
                .categoryMr(catNameMr)
                .category(catNameEn)
                .categorySlug(p.getCategory() != null ? p.getCategory().getSlug() : null)
                .descriptionEn(descEn)
                .descriptionMr(descMr)
                .description(descEn)
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .badge(p.getBadge())
                .stock(stockLabel)
                .stockQuantity(p.getStockQuantity())
                .stockStatus(p.getStockStatus())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .images(images)
                .video(video)
                .build();
    }

    private ProductAdminResponse mapToProductAdminResponse(Product p) {
        ProductResponse base = mapToProductResponse(p);

        return ProductAdminResponse.builder()
                .id(base.getId())
                .sku(base.getSku())
                .slug(base.getSlug())
                .nameEn(base.getNameEn())
                .nameMr(base.getNameMr())
                .name(base.getName())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryEn(base.getCategoryEn())
                .categoryMr(base.getCategoryMr())
                .category(base.getCategory())
                .categorySlug(base.getCategorySlug())
                .descriptionEn(base.getDescriptionEn())
                .descriptionMr(base.getDescriptionMr())
                .description(base.getDescription())
                .price(base.getPrice())
                .originalPrice(base.getOriginalPrice())
                .badge(base.getBadge())
                .stock(base.getStock())
                .stockQuantity(base.getStockQuantity())
                .stockStatus(base.getStockStatus())
                .rating(base.getRating())
                .reviewCount(base.getReviewCount())
                .active(p.isActive())
                .images(base.getImages())
                .video(base.getVideo())
                .info(base.getInfo())
                .care(base.getCare())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private Pageable createPageable(int page, int size, String sort, String direction) {
        Sort sortObj = direction.equalsIgnoreCase("desc") ? Sort.by(sort).descending() : Sort.by(sort).ascending();
        return PageRequest.of(page, size, sortObj);
    }

    private <T> PagedResponse<T> buildPagedResponse(Page<Product> page, List<T> content) {
        return PagedResponse.<T>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private String slugify(String input) {
        if (!StringUtils.hasText(input)) return "";
        return input.trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
