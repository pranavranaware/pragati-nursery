-- Add guest_token column to orders table for secure guest order ownership
ALTER TABLE orders ADD COLUMN guest_token VARCHAR(100) NULL;
