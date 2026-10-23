-- =======================================================
-- PRAGATI NURSERY — DATABASE MIGRATION V6 (ADD PERFORMANCE INDEXES)
-- =======================================================

-- Indexes for order lookup optimization
CREATE INDEX idx_orders_shipping_email ON orders(shipping_email);
CREATE INDEX idx_orders_shipping_mobile ON orders(shipping_mobile);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_orders_status ON orders(status);

-- Indexes for product catalog search optimization
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_stock_status ON products(stock_status);
