-- Alter orders table to store shipping email snapshot for lookups
ALTER TABLE orders ADD COLUMN shipping_email VARCHAR(150);
