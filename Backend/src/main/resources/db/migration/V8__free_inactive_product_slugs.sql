-- Migration V8: Ensure inactive products do not block original slug/SKU reuse
UPDATE products
SET slug = CONCAT(slug, '-deleted-', id),
    sku = CONCAT(sku, '-DELETED-', id)
WHERE active = FALSE
  AND slug NOT LIKE '%-deleted-%';
