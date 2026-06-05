-- ============================================================
-- Ashmika Fashion — Product Indexing Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Core filter indexes
CREATE INDEX IF NOT EXISTS idx_products_status
  ON products (status);

CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products (featured);

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON products (category_id);

CREATE INDEX IF NOT EXISTS idx_products_subcategory_id
  ON products (subcategory_id);

CREATE INDEX IF NOT EXISTS idx_products_collection_id
  ON products (collection_id);

CREATE INDEX IF NOT EXISTS idx_products_slug
  ON products (slug);

-- Sort indexes
CREATE INDEX IF NOT EXISTS idx_products_created_at
  ON products (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_updated_at
  ON products (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_title
  ON products (title ASC);

-- Composite indexes for common admin filter combinations
CREATE INDEX IF NOT EXISTS idx_products_status_created
  ON products (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_category_status
  ON products (category_id, status);

CREATE INDEX IF NOT EXISTS idx_products_featured_status
  ON products (featured, status);

-- Full-text search index on title (for future server-side search)
CREATE INDEX IF NOT EXISTS idx_products_title_fts
  ON products USING gin (to_tsvector('english', title));

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON categories (slug);

CREATE INDEX IF NOT EXISTS idx_categories_status
  ON categories (status);

-- Subcategory indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id
  ON subcategories (category_id);

CREATE INDEX IF NOT EXISTS idx_subcategories_slug
  ON subcategories (slug);

-- Collection indexes
CREATE INDEX IF NOT EXISTS idx_collections_slug
  ON collections (slug);

CREATE INDEX IF NOT EXISTS idx_collections_status
  ON collections (status);

CREATE INDEX IF NOT EXISTS idx_collections_featured
  ON collections (featured);

-- Product images index (for join performance)
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images (product_id, display_order ASC);
