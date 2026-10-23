-- V9: Create Business Settings Table for Centralized MySQL Storage
CREATE TABLE IF NOT EXISTS business_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 80.00,
    min_order_value DECIMAL(10, 2) NOT NULL DEFAULT 299.00,
    max_cod_value DECIMAL(10, 2) NOT NULL DEFAULT 5000.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO business_settings (id, store_name, phone, email, address, delivery_fee, min_order_value, max_cod_value)
VALUES (1, 'Pragati Nursery', '+91 98765 00000', 'hello@pragatinursery.in', 'Pune, Maharashtra, India', 80.00, 299.00, 5000.00)
ON DUPLICATE KEY UPDATE id=1;
