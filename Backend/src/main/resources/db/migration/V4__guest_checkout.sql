-- Alter orders table to support guest checkout without creating user/address rows
ALTER TABLE orders MODIFY user_id BIGINT NULL;
ALTER TABLE orders MODIFY address_id BIGINT NULL;
