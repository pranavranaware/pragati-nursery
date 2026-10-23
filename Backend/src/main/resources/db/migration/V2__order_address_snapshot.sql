-- =======================================================
-- PRAGATI NURSERY — DATABASE MIGRATION V2 (ORDER ADDRESS SNAPSHOT)
-- =======================================================

ALTER TABLE orders ADD COLUMN shipping_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN shipping_mobile VARCHAR(20);
ALTER TABLE orders ADD COLUMN shipping_address TEXT;
ALTER TABLE orders ADD COLUMN shipping_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN shipping_state VARCHAR(100);
ALTER TABLE orders ADD COLUMN shipping_pincode VARCHAR(10);
ALTER TABLE orders ADD COLUMN shipping_landmark VARCHAR(150);
