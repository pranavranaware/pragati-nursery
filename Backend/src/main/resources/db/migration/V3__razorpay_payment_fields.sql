-- =======================================================
-- PRAGATI NURSERY — DATABASE MIGRATION V3 (RAZORPAY PAYMENT FIELDS)
-- =======================================================

ALTER TABLE payments ADD COLUMN paid_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN failure_reason VARCHAR(255);
