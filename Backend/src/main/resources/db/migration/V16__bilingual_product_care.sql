-- PRAGATI NURSERY - DATABASE MIGRATION V16 (BILINGUAL PLANT CARE)
-- One column per ALTER so it also runs on TiDB.

ALTER TABLE product_cares ADD COLUMN label_en VARCHAR(100) NULL AFTER label;
ALTER TABLE product_cares ADD COLUMN label_mr VARCHAR(100) NULL AFTER label_en;
ALTER TABLE product_cares ADD COLUMN value_en VARCHAR(255) NULL AFTER label_mr;
ALTER TABLE product_cares ADD COLUMN value_mr VARCHAR(255) NULL AFTER value_en;

-- Backfill existing product care data into English fields
UPDATE product_cares SET label_en = label WHERE label_en IS NULL AND label IS NOT NULL;
UPDATE product_cares SET value_en = value WHERE value_en IS NULL AND value IS NOT NULL;