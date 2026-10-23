package com.pragatinursery.catalog.service;

import com.pragatinursery.catalog.dto.request.CreateCategoryRequest;
import com.pragatinursery.catalog.dto.request.UpdateCategoryRequest;
import com.pragatinursery.catalog.dto.request.UpdateCategoryStatusRequest;
import com.pragatinursery.catalog.dto.response.CategoryAdminResponse;
import com.pragatinursery.catalog.dto.response.CategoryResponse;
import com.pragatinursery.catalog.entity.Category;
import com.pragatinursery.catalog.repository.CategoryRepository;
import com.pragatinursery.catalog.repository.ProductRepository;
import com.pragatinursery.common.enums.CategoryStatus;
import com.pragatinursery.common.exception.BadRequestException;
import com.pragatinursery.common.exception.DuplicateResourceException;
import com.pragatinursery.common.exception.ResourceNotFoundException;
import com.pragatinursery.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.pragatinursery.catalog.entity.Product;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getPublicCategories() {
        return categoryRepository.findByStatusOrderByNameAsc(CategoryStatus.ACTIVE)
                .stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getPublicCategoryBySlug(String slug) {
        String cleanSlug = slug.trim().toLowerCase();
        Category category = categoryRepository.findBySlugAndStatus(cleanSlug, CategoryStatus.ACTIVE)
                .or(() -> categoryRepository.findBySlugAndStatus(cleanSlug.replace('_', '-'), CategoryStatus.ACTIVE))
                .or(() -> categoryRepository.findBySlug(cleanSlug))
                .or(() -> categoryRepository.findBySlug(cleanSlug.replace('_', '-')))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return mapToCategoryResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CategoryAdminResponse> getAdminCategories(int page, int size, String search, CategoryStatus status, String sort, String direction) {
        Sort sortObj = direction.equalsIgnoreCase("desc") ? Sort.by(sort).descending() : Sort.by(sort).ascending();
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Category> categoryPage;
        boolean hasSearch = StringUtils.hasText(search);

        if (hasSearch && status != null) {
            categoryPage = categoryRepository.findByNameContainingIgnoreCaseAndStatus(search.trim(), status, pageable);
        } else if (hasSearch) {
            categoryPage = categoryRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else if (status != null) {
            categoryPage = categoryRepository.findByStatus(status, pageable);
        } else {
            categoryPage = categoryRepository.findAll(pageable);
        }

        List<CategoryAdminResponse> content = categoryPage.getContent()
                .stream()
                .map(this::mapToCategoryAdminResponse)
                .collect(Collectors.toList());

        return PagedResponse.<CategoryAdminResponse>builder()
                .content(content)
                .page(categoryPage.getNumber())
                .size(categoryPage.getSize())
                .totalElements(categoryPage.getTotalElements())
                .totalPages(categoryPage.getTotalPages())
                .last(categoryPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public CategoryAdminResponse createCategory(CreateCategoryRequest request) {
        String nameEn = StringUtils.hasText(request.getNameEn()) ? request.getNameEn().trim() : (request.getName() != null ? request.getName().trim() : "");
        String nameMr = StringUtils.hasText(request.getNameMr()) ? request.getNameMr().trim() : null;
        String nameForSlug = StringUtils.hasText(nameEn) ? nameEn : (request.getName() != null ? request.getName().trim() : "");

        if (categoryRepository.existsByNameIgnoreCase(nameForSlug)) {
            throw new DuplicateResourceException("A category with the name '" + nameForSlug + "' already exists.");
        }

        String rawSlug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : nameForSlug;
        String slug = slugify(rawSlug);

        if (categoryRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("A category with the slug '" + slug + "' already exists.");
        }

        CategoryStatus status = request.getStatus() != null ? request.getStatus() : CategoryStatus.ACTIVE;

        String descriptionEn = StringUtils.hasText(request.getDescriptionEn()) ? request.getDescriptionEn().trim() : (request.getDescription() != null ? request.getDescription().trim() : null);
        String descriptionMr = StringUtils.hasText(request.getDescriptionMr()) ? request.getDescriptionMr().trim() : null;

        Category category = Category.builder()
                .nameEn(nameEn)
                .nameMr(nameMr)
                .name(nameForSlug)
                .slug(slug)
                .descriptionEn(descriptionEn)
                .descriptionMr(descriptionMr)
                .description(descriptionEn != null ? descriptionEn : request.getDescription())
                .image(request.getImage() != null ? request.getImage().trim() : null)
                .status(status)
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Created new category: {} (ID: {})", savedCategory.getName(), savedCategory.getId());

        return mapToCategoryAdminResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryAdminResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String nameEn = StringUtils.hasText(request.getNameEn()) ? request.getNameEn().trim() : (request.getName() != null ? request.getName().trim() : category.getNameEn());
        String nameMr = StringUtils.hasText(request.getNameMr()) ? request.getNameMr().trim() : category.getNameMr();
        String nameForSlug = StringUtils.hasText(nameEn) ? nameEn : (category.getName() != null ? category.getName() : "");

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(nameForSlug, id)) {
            throw new DuplicateResourceException("Another category with the name '" + nameForSlug + "' already exists.");
        }

        String rawSlug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : nameForSlug;
        String slug = slugify(rawSlug);

        if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new DuplicateResourceException("Another category with the slug '" + slug + "' already exists.");
        }

        String descriptionEn = request.getDescriptionEn() != null ? request.getDescriptionEn().trim() : (request.getDescription() != null ? request.getDescription().trim() : category.getDescriptionEn());
        String descriptionMr = request.getDescriptionMr() != null ? request.getDescriptionMr().trim() : category.getDescriptionMr();

        category.setNameEn(nameEn);
        category.setNameMr(nameMr);
        category.setName(nameForSlug);
        category.setSlug(slug);
        category.setDescriptionEn(descriptionEn);
        category.setDescriptionMr(descriptionMr);
        if (descriptionEn != null) category.setDescription(descriptionEn);
        if (request.getImage() != null) category.setImage(request.getImage().trim());
        if (request.getStatus() != null) category.setStatus(request.getStatus());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Updated category: {} (ID: {})", updatedCategory.getName(), updatedCategory.getId());

        return mapToCategoryAdminResponse(updatedCategory);
    }

    @Override
    @Transactional
    public CategoryAdminResponse updateCategoryStatus(Long id, UpdateCategoryStatusRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setStatus(request.getStatus());
        Category updatedCategory = categoryRepository.save(category);
        log.info("Updated category status: {} (ID: {}) to {}", updatedCategory.getName(), updatedCategory.getId(), updatedCategory.getStatus());

        return mapToCategoryAdminResponse(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long activeProductCount = productRepository.countByCategoryIdAndActiveTrue(id);
        if (activeProductCount > 0) {
            throw new BadRequestException("Cannot delete category '" + category.getName() + "' because " + activeProductCount + " active product(s) are assigned to it. Please reassign or remove the products first.");
        }

        List<Product> softDeletedProducts = productRepository.findByCategoryId(id);
        for (Product product : softDeletedProducts) {
            product.setCategory(null);
            productRepository.save(product);
        }

        categoryRepository.delete(category);
        log.info("Deleted category: {} (ID: {}) and unlinked {} soft-deleted product(s)", category.getName(), category.getId(), softDeletedProducts.size());
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        long count = productRepository.countActiveProductsForCategory(category.getId(), category.getSlug());
        String nameEn = category.getNameEn() != null && !category.getNameEn().trim().isEmpty() ? category.getNameEn() : category.getName();
        String descEn = category.getDescriptionEn() != null && !category.getDescriptionEn().trim().isEmpty() ? category.getDescriptionEn() : category.getDescription();

        return CategoryResponse.builder()
                .id(category.getId())
                .nameEn(nameEn)
                .nameMr(category.getNameMr())
                .name(nameEn)
                .slug(category.getSlug())
                .descriptionEn(descEn)
                .descriptionMr(category.getDescriptionMr())
                .description(descEn)
                .image(category.getImage())
                .status(category.getStatus())
                .productCount(count)
                .build();
    }

    private CategoryAdminResponse mapToCategoryAdminResponse(Category category) {
        long count = productRepository.countActiveProductsForCategory(category.getId(), category.getSlug());
        String nameEn = category.getNameEn() != null && !category.getNameEn().trim().isEmpty() ? category.getNameEn() : category.getName();
        String descEn = category.getDescriptionEn() != null && !category.getDescriptionEn().trim().isEmpty() ? category.getDescriptionEn() : category.getDescription();

        return CategoryAdminResponse.builder()
                .id(category.getId())
                .nameEn(nameEn)
                .nameMr(category.getNameMr())
                .name(nameEn)
                .slug(category.getSlug())
                .descriptionEn(descEn)
                .descriptionMr(category.getDescriptionMr())
                .description(descEn)
                .image(category.getImage())
                .status(category.getStatus())
                .productCount(count)
                .createdAt(category.getCreatedAt())
                .build();
    }

    private String slugify(String input) {
        if (!StringUtils.hasText(input)) return "";
        return input.trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
