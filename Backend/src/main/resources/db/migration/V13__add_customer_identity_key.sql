-- =======================================================
-- PRAGATI NURSERY — DATABASE MIGRATION V13
-- ADD CUSTOMER IDENTITY KEY AND UNIQUE CONSTRAINT
-- =======================================================

ALTER TABLE customers ADD COLUMN identity_key VARCHAR(255) NULL;

-- Populate identity_key for existing registered users if any
UPDATE customers 
SET identity_key = CONCAT('USER:', user_id) 
WHERE user_id IS NOT NULL AND identity_key IS NULL;

-- Populate identity_key for existing guest users if any
UPDATE customers 
SET identity_key = CONCAT('MOBILE:', mobile) 
WHERE user_id IS NULL AND mobile IS NOT NULL AND TRIM(mobile) != '' AND identity_key IS NULL;

-- Enforce UNIQUE constraint (creates required index implicitly in MySQL)
ALTER TABLE customers ADD CONSTRAINT uk_customers_identity_key UNIQUE (identity_key);
