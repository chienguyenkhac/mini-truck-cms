-- =====================================================
-- SINOTRUK Admin Updates - Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create catalog_articles table for EditorJS content
CREATE TABLE IF NOT EXISTS catalog_articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  content JSONB, -- EditorJS content stored as JSON
  thumbnail VARCHAR(500),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Update products table
-- Remove price/stock fields, add homepage visibility and thumbnail
ALTER TABLE products 
  DROP COLUMN IF EXISTS price,
  DROP COLUMN IF EXISTS wholesale_price,
  DROP COLUMN IF EXISTS stock;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500);

-- 3. Update categories table
-- Add code, thumbnail, visibility
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500),
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 4. Enable RLS policies for catalog_articles
ALTER TABLE catalog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for published articles" ON catalog_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Allow all for authenticated" ON catalog_articles
  FOR ALL USING (true);

-- =====================================================
-- 5. Multi-Image Support for Products
-- Structure: product (1) <-> (N) product_images (N) <-> (1) images
-- =====================================================

-- Images table - stores all images (can be reused across products)
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  url VARCHAR(1000) NOT NULL,
  public_id VARCHAR(255), -- Cloudinary public_id for deletion
  created_at TIMESTAMP DEFAULT NOW()
);

-- Junction table - links products to images with ordering
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, image_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_image ON product_images(image_id);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read images" ON images FOR SELECT USING (true);
CREATE POLICY "Allow all for authenticated images" ON images FOR ALL USING (true);

CREATE POLICY "Allow public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow all for authenticated product_images" ON product_images FOR ALL USING (true);

-- Done!
SELECT 'Schema updated successfully with multi-image support!' as status;
