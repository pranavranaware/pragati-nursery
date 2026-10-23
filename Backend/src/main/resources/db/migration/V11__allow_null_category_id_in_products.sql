-- V11: Allow NULL values for products.category_id to support unlinking soft-deleted products upon category deletion
ALTER TABLE products MODIFY COLUMN category_id BIGINT NULL;
