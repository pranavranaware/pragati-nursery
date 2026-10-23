-- =======================================================
-- PRAGATI NURSERY — DATABASE MIGRATION V12
-- ADD SHIPPING DISTRICT AND CUSTOMERS TRACKING TABLES
-- =======================================================

-- 1. Add shipping_district column to orders table for address snapshot parity
ALTER TABLE orders ADD COLUMN shipping_district VARCHAR(100) NULL;

-- 2. Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    district VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    pincode VARCHAR(10) NULL,
    first_order_id BIGINT NULL,
    last_order_id BIGINT NULL,
    first_order_date TIMESTAMP NULL,
    last_order_date TIMESTAMP NULL,
    total_orders INT NOT NULL DEFAULT 1,
    total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_customers_user UNIQUE (user_id),
    INDEX idx_customers_mobile (mobile),
    INDEX idx_customers_email (email),
    INDEX idx_customers_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create customer_orders tracking table for strict DB-level order idempotency
CREATE TABLE IF NOT EXISTS customer_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_orders_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT uk_customer_orders_order UNIQUE (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
