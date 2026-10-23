-- V10: Align Default Delivery Fee to 50.00 for Subtotals Below 999
UPDATE business_settings
SET delivery_fee = 50.00
WHERE id = 1 AND delivery_fee = 80.00;
