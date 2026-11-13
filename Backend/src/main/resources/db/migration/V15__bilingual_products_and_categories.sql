-- PRAGATI NURSERY - DATABASE MIGRATION V15 (BILINGUAL CONTENT)
-- One column per ALTER so it also runs on TiDB.

-- 1. Add bilingual columns to categories table
ALTER TABLE categories ADD COLUMN name_en VARCHAR(100) NULL AFTER id;
ALTER TABLE categories ADD COLUMN name_mr VARCHAR(100) NULL AFTER name_en;
ALTER TABLE categories ADD COLUMN description_en TEXT NULL AFTER slug;
ALTER TABLE categories ADD COLUMN description_mr TEXT NULL AFTER description_en;

-- Backfill existing category data into English fields
UPDATE categories SET name_en = name WHERE name_en IS NULL AND name IS NOT NULL;
UPDATE categories SET description_en = description WHERE description_en IS NULL AND description IS NOT NULL;

-- 2. Add bilingual columns to products table
ALTER TABLE products ADD COLUMN name_en VARCHAR(150) NULL AFTER slug;
ALTER TABLE products ADD COLUMN name_mr VARCHAR(150) NULL AFTER name_en;
ALTER TABLE products ADD COLUMN description_en TEXT NULL AFTER category_id;
ALTER TABLE products ADD COLUMN description_mr TEXT NULL AFTER description_en;

-- Backfill existing product data into English fields
UPDATE products SET name_en = name WHERE name_en IS NULL AND name IS NOT NULL;
UPDATE products SET description_en = description WHERE description_en IS NULL AND description IS NOT NULL;