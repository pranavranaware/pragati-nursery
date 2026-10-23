-- PRAGATI NURSERY — PRODUCTION ORDER CLEANUP SCRIPT
-- Approved execution script to clear test order data before production deployment

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE order_items;
TRUNCATE TABLE payments;
TRUNCATE TABLE orders;

SET FOREIGN_KEY_CHECKS = 1;
