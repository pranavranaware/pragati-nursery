package com.pragatinursery.config;

import com.pragatinursery.auth.entity.User;
import com.pragatinursery.auth.repository.UserRepository;
import com.pragatinursery.catalog.entity.*;
import com.pragatinursery.catalog.repository.CategoryRepository;
import com.pragatinursery.catalog.repository.ProductRepository;
import com.pragatinursery.common.enums.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@pragatinursery.in}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        boolean isFreshDatabase = userRepository.count() == 0;
        seedAdminUser();
        seedCategoriesAndProducts(isFreshDatabase);
    }

    private void seedAdminUser() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Pragati Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .mobile("+91 98765 43210")
                    .role(UserRole.ROLE_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin user seeded successfully ({})", adminEmail);
        }
    }

    private void seedCategoriesAndProducts(boolean isFreshDatabase) {
        if (!isFreshDatabase || categoryRepository.count() > 0) {
            log.info("Database already initialized with categories and products. Skipping DataInitializer.");
            return;
        }

        log.info("Seeding initial categories and products matching Frontend/types/product.ts...");

        // 1. Categories Seeding
        Category fruitPlants = createCategory("Fruit Plants", "fruit-plants", "Healthy fruit plants for your garden and farm.", "https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?auto=format&fit=crop&w=1600&q=85");
        Category flowerPlants = createCategory("Flower Plants", "flower-plants", "Bring colour, fragrance and gentle joy into every corner.", "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=85");
        Category treePlants = createCategory("Tree Plants", "tree-plants", "Grow something lasting with sturdy trees for open spaces.", "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1600&q=85");
        Category indoorPlants = createCategory("Indoor Plants", "indoor-plants", "Easy, beautiful greens made for rooms, desks and shelves.", "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1600&q=85");
        Category outdoorPlants = createCategory("Outdoor Plants", "outdoor-plants", "Hardy companions for balconies, patios and gardens.", "https://images.unsplash.com/photo-1599598425947-330e6a7d1b0c?auto=format&fit=crop&w=1600&q=85");
        Category ornamentalPlants = createCategory("Ornamental Plants", "ornamental-plants", "Distinctive foliage and form for a more considered garden.", "https://images.unsplash.com/photo-1597055181300-3e7d6b5b3d2d?auto=format&fit=crop&w=1600&q=85");
        Category medicinalPlants = createCategory("Medicinal Plants", "medicinal-plants", "Traditional greens for a thoughtful home garden.", "https://images.unsplash.com/photo-1611909023032-2d6b313b2b5b?auto=format&fit=crop&w=1600&q=85");

        categoryRepository.saveAll(Arrays.asList(fruitPlants, flowerPlants, treePlants, indoorPlants, outdoorPlants, ornamentalPlants, medicinalPlants));

        // 2. Products Seeding
        // Product 1: Mango Plant
        Product mango = Product.builder()
                .sku("PN-0001")
                .slug("mango-plant")
                .name("Mango Plant")
                .category(fruitPlants)
                .description("A cheerful young mango plant, nurtured for a strong start in your garden or sunny balcony.")
                .price(new BigDecimal("250.00"))
                .originalPrice(new BigDecimal("300.00"))
                .badge("Bestseller")
                .stockQuantity(24)
                .stockStatus(StockStatus.IN_STOCK)
                .rating(4.9)
                .reviewCount(84)
                .active(true)
                .build();
        addImages(mango, Arrays.asList(
                img("https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?auto=format&fit=crop&w=1100&q=88", "Young mango plant in a nursery pot", true, 0),
                img("https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1100&q=88", "Healthy mango leaves", false, 1),
                img("https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1100&q=88", "Mango tree foliage", false, 2)
        ));
        addSpecsAndCare(mango,
                Arrays.asList(info(mango, "Plant type", "Fruit plant"), info(mango, "Plant height", "1.5–2 ft"), info(mango, "Sunlight", "Bright, direct light"), info(mango, "Water requirement", "Moderate"), info(mango, "Suitable for", "Garden, balcony"), info(mango, "Availability", "Ready to dispatch")),
                Arrays.asList(care(mango, CareIcon.SUN, "Sunlight", "6–8 hours of bright light"), care(mango, CareIcon.WATER, "Water", "When the top soil feels dry"), care(mango, CareIcon.SOIL, "Soil", "Well-draining, fertile mix"))
        );

        // Product 2: Monstera Deliciosa
        Product monstera = Product.builder()
                .sku("PN-0002")
                .slug("monstera-deliciosa")
                .name("Monstera Deliciosa")
                .category(indoorPlants)
                .description("A sculptural indoor favourite with generous leaves that bring instant character to a room.")
                .price(new BigDecimal("499.00"))
                .originalPrice(new BigDecimal("699.00"))
                .badge("Bestseller")
                .stockQuantity(31)
                .stockStatus(StockStatus.IN_STOCK)
                .rating(4.8)
                .reviewCount(126)
                .active(true)
                .build();
        addImages(monstera, Arrays.asList(
                img("https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1100&q=88", "Monstera deliciosa plant indoors", true, 0),
                img("https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1100&q=88", "Close view of monstera leaves", false, 1)
        ));
        addSpecsAndCare(monstera,
                Arrays.asList(info(monstera, "Plant type", "Indoor foliage"), info(monstera, "Plant height", "1–2 ft"), info(monstera, "Sunlight", "Bright, indirect light"), info(monstera, "Water requirement", "Moderate"), info(monstera, "Suitable for", "Home, office"), info(monstera, "Availability", "Ready to dispatch")),
                Arrays.asList(care(monstera, CareIcon.SUN, "Sunlight", "Bright, indirect light"), care(monstera, CareIcon.WATER, "Water", "Weekly, less in winter"), care(monstera, CareIcon.SOIL, "Soil", "Airy, well-draining mix"))
        );

        // Product 3: Peace Lily
        Product peaceLily = Product.builder()
                .sku("PN-0003")
                .slug("peace-lily")
                .name("Peace Lily")
                .category(flowerPlants)
                .description("Soft white blooms and rich green leaves make this an easy, elegant addition to your home.")
                .price(new BigDecimal("349.00"))
                .badge("Easy care")
                .stockQuantity(18)
                .stockStatus(StockStatus.IN_STOCK)
                .rating(4.7)
                .reviewCount(62)
                .active(true)
                .build();
        addImages(peaceLily, Arrays.asList(
                img("https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=1100&q=88", "Peace lily with white flowers", true, 0),
                img("https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1100&q=88", "Peace lily in a ceramic pot", false, 1)
        ));
        addSpecsAndCare(peaceLily,
                Arrays.asList(info(peaceLily, "Plant type", "Flowering indoor plant"), info(peaceLily, "Plant height", "1–1.5 ft"), info(peaceLily, "Sunlight", "Low to medium indirect"), info(peaceLily, "Water requirement", "Regular"), info(peaceLily, "Suitable for", "Home, office"), info(peaceLily, "Availability", "Ready to dispatch")),
                Arrays.asList(care(peaceLily, CareIcon.SUN, "Sunlight", "Soft, indirect light"), care(peaceLily, CareIcon.WATER, "Water", "Keep soil lightly moist"), care(peaceLily, CareIcon.SOIL, "Soil", "Rich, moisture-retentive mix"))
        );

        // Product 4: Fiddle Leaf Fig
        Product fiddleLeaf = Product.builder()
                .sku("PN-0004")
                .slug("fiddle-leaf-fig")
                .name("Fiddle Leaf Fig")
                .category(indoorPlants)
                .description("A statement plant with broad, glossy leaves for a quiet, architectural corner.")
                .price(new BigDecimal("899.00"))
                .originalPrice(new BigDecimal("1099.00"))
                .badge("New arrival")
                .stockQuantity(4)
                .stockStatus(StockStatus.LOW_STOCK)
                .rating(4.6)
                .reviewCount(31)
                .active(true)
                .build();
        addImages(fiddleLeaf, Arrays.asList(
                img("https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1100&q=88", "Fiddle leaf fig plant", true, 0),
                img("https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1100&q=88", "Fiddle leaf fig leaves", false, 1)
        ));
        addSpecsAndCare(fiddleLeaf,
                Arrays.asList(info(fiddleLeaf, "Plant type", "Indoor foliage"), info(fiddleLeaf, "Plant height", "2–3 ft"), info(fiddleLeaf, "Sunlight", "Bright, indirect light"), info(fiddleLeaf, "Water requirement", "Moderate"), info(fiddleLeaf, "Suitable for", "Living room, office"), info(fiddleLeaf, "Availability", "Limited stock")),
                Arrays.asList(care(fiddleLeaf, CareIcon.SUN, "Sunlight", "Bright, filtered light"), care(fiddleLeaf, CareIcon.WATER, "Water", "When soil is dry on top"), care(fiddleLeaf, CareIcon.SOIL, "Soil", "Loose, well-draining mix"))
        );

        // Product 5: Snake Plant
        Product snakePlant = Product.builder()
                .sku("PN-0005")
                .slug("snake-plant")
                .name("Snake Plant")
                .category(indoorPlants)
                .description("A resilient, upright plant that is happy on a desk, shelf or sunny floor.")
                .price(new BigDecimal("299.00"))
                .badge("Easy care")
                .stockQuantity(50)
                .stockStatus(StockStatus.IN_STOCK)
                .rating(4.9)
                .reviewCount(98)
                .active(true)
                .build();
        addImages(snakePlant, Arrays.asList(
                img("https://images.unsplash.com/photo-1599598425947-330e6a7d1b0c?auto=format&fit=crop&w=1100&q=88", "Snake plant in a pot", true, 0),
                img("https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1100&q=88", "Snake plant foliage", false, 1)
        ));
        addSpecsAndCare(snakePlant,
                Arrays.asList(info(snakePlant, "Plant type", "Indoor foliage"), info(snakePlant, "Plant height", "1–1.5 ft"), info(snakePlant, "Sunlight", "Low to bright indirect"), info(snakePlant, "Water requirement", "Low"), info(snakePlant, "Suitable for", "Desk, shelf, home"), info(snakePlant, "Availability", "Ready to dispatch")),
                Arrays.asList(care(snakePlant, CareIcon.SUN, "Sunlight", "Low to bright indirect light"), care(snakePlant, CareIcon.WATER, "Water", "Allow soil to fully dry"), care(snakePlant, CareIcon.SOIL, "Soil", "Cactus or sandy mix"))
        );

        // Product 6: Bougainvillea
        Product bougainvillea = Product.builder()
                .sku("PN-0006")
                .slug("bougainvillea")
                .name("Bougainvillea")
                .category(flowerPlants)
                .description("A sun-loving flowering plant with lively colour for balconies and garden walls.")
                .price(new BigDecimal("425.00"))
                .originalPrice(new BigDecimal("499.00"))
                .badge("Seasonal")
                .stockQuantity(22)
                .stockStatus(StockStatus.IN_STOCK)
                .rating(4.8)
                .reviewCount(45)
                .active(true)
                .build();
        addImages(bougainvillea, Arrays.asList(
                img("https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1100&q=88", "Bougainvillea flowering plant", true, 0),
                img("https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=1100&q=88", "Pink bougainvillea flowers", false, 1)
        ));
        addSpecsAndCare(bougainvillea,
                Arrays.asList(info(bougainvillea, "Plant type", "Flowering outdoor"), info(bougainvillea, "Plant height", "1–2 ft"), info(bougainvillea, "Sunlight", "Full sun"), info(bougainvillea, "Water requirement", "Moderate"), info(bougainvillea, "Suitable for", "Balcony, garden"), info(bougainvillea, "Availability", "Ready to dispatch")),
                Arrays.asList(care(bougainvillea, CareIcon.SUN, "Sunlight", "At least 6 hours of sun"), care(bougainvillea, CareIcon.WATER, "Water", "Deeply, when soil dries"), care(bougainvillea, CareIcon.SOIL, "Soil", "Sandy, well-draining soil"))
        );

        // Product 7: Neem Tree
        Product neem = Product.builder()
                .sku("PN-0007")
                .slug("neem-tree")
                .name("Neem Tree")
                .category(treePlants)
                .description("A young neem tree for open gardens, nurtured with patience and room to grow.")
                .price(new BigDecimal("325.00"))
                .badge("Native pick")
                .stockQuantity(0)
                .stockStatus(StockStatus.OUT_OF_STOCK)
                .rating(4.8)
                .reviewCount(27)
                .active(true)
                .build();
        addImages(neem, Arrays.asList(
                img("https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1100&q=88", "Young tree in a garden", true, 0),
                img("https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1100&q=88", "Green tree canopy", false, 1)
        ));
        addSpecsAndCare(neem,
                Arrays.asList(info(neem, "Plant type", "Tree plant"), info(neem, "Plant height", "2–3 ft"), info(neem, "Sunlight", "Full sun"), info(neem, "Water requirement", "Moderate"), info(neem, "Suitable for", "Garden, farm"), info(neem, "Availability", "Ready to dispatch")),
                Arrays.asList(care(neem, CareIcon.SUN, "Sunlight", "Full sun outdoors"), care(neem, CareIcon.WATER, "Water", "Regular while establishing"), care(neem, CareIcon.SOIL, "Soil", "Fertile garden soil"))
        );

        // Product 8: Tulsi Plant
        Product tulsi = Product.builder()
                .sku("PN-0008")
                .slug("tulsi-plant")
                .name("Tulsi Plant")
                .category(medicinalPlants)
                .description("A fragrant, familiar green for a balcony, window or small home garden.")
                .price(new BigDecimal("149.00"))
                .badge("Everyday favourite")
                .stockQuantity(40)
                .stockStatus(StockStatus.IN_STOCK)
                .rating(4.9)
                .reviewCount(112)
                .active(true)
                .build();
        addImages(tulsi, Arrays.asList(
                img("https://images.unsplash.com/photo-1611909023032-2d6b313b2b5b?auto=format&fit=crop&w=1100&q=88", "Tulsi plant in a terracotta pot", true, 0),
                img("https://images.unsplash.com/photo-1604848698030-c434ba08ece1?auto=format&fit=crop&w=1100&q=88", "Fresh herb leaves", false, 1)
        ));
        addSpecsAndCare(tulsi,
                Arrays.asList(info(tulsi, "Plant type", "Herb plant"), info(tulsi, "Plant height", "0.5–1 ft"), info(tulsi, "Sunlight", "Bright morning light"), info(tulsi, "Water requirement", "Regular"), info(tulsi, "Suitable for", "Balcony, windowsill"), info(tulsi, "Availability", "Ready to dispatch")),
                Arrays.asList(care(tulsi, CareIcon.SUN, "Sunlight", "Bright morning sunlight"), care(tulsi, CareIcon.WATER, "Water", "Keep soil lightly moist"), care(tulsi, CareIcon.SOIL, "Soil", "Rich, organic mix"))
        );

        productRepository.saveAll(Arrays.asList(mango, monstera, peaceLily, fiddleLeaf, snakePlant, bougainvillea, neem, tulsi));
        log.info("Successfully seeded 7 nursery categories and 8 products!");
    }

    private Category createCategory(String name, String slug, String description, String image) {
        return Category.builder()
                .name(name)
                .slug(slug)
                .description(description)
                .image(image)
                .status(CategoryStatus.ACTIVE)
                .build();
    }

    private ProductImage img(String src, String alt, boolean isPrimary, int sortOrder) {
        return ProductImage.builder()
                .src(src)
                .alt(alt)
                .primary(isPrimary)
                .sortOrder(sortOrder)
                .build();
    }

    private ProductInfo info(Product p, String label, String value) {
        return ProductInfo.builder()
                .product(p)
                .label(label)
                .value(value)
                .build();
    }

    private ProductCare care(Product p, CareIcon icon, String label, String value) {
        return ProductCare.builder()
                .product(p)
                .icon(icon)
                .label(label)
                .value(value)
                .build();
    }

    private void addImages(Product product, List<ProductImage> images) {
        images.forEach(image -> image.setProduct(product));
        product.getImages().addAll(images);
    }

    private void addSpecsAndCare(Product product, List<ProductInfo> infos, List<ProductCare> cares) {
        product.getInfo().addAll(infos);
        product.getCare().addAll(cares);
    }
}
