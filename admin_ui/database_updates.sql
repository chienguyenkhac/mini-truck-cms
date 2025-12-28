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
-- Add code, thumbnail, visibility, and vehicle type flag
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500),
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_vehicle_name BOOLEAN DEFAULT false;

-- =====================================================
-- 6. Phase 1 Updates - Separate Categories and Vehicle Types
-- =====================================================

-- Add vehicle_ids array to products for multi-vehicle support
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS vehicle_ids BIGINT[] DEFAULT '{}';

-- Create index for vehicle_ids array search
CREATE INDEX IF NOT EXISTS idx_products_vehicle_ids ON products USING GIN(vehicle_ids);

-- Update existing vehicle categories (examples - adjust based on actual data)
-- Mark categories that are vehicle types (HOWO, SITRAK, etc.)
UPDATE categories SET is_vehicle_name = true 
WHERE name ILIKE '%HOWO%' OR name ILIKE '%SITRAK%' OR name ILIKE '%BEN%' 
   OR name ILIKE '%A7%' OR name ILIKE '%T7H%';

-- =====================================================
-- 7. Phase 2 Updates - Manufacturer Code
-- =====================================================

-- Add manufacturer_code field to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS manufacturer_code VARCHAR(100);

-- Create index for faster manufacturer code lookups
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_code ON products(manufacturer_code);

-- 4. Enable RLS for catalog_articles
ALTER TABLE catalog_articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Allow public read for published articles" ON catalog_articles;
DROP POLICY IF EXISTS "Allow all for authenticated" ON catalog_articles;

-- Recreate policies
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

-- Index for faster lookups (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_image ON product_images(image_id);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read images" ON images;
DROP POLICY IF EXISTS "Allow all for authenticated images" ON images;
DROP POLICY IF EXISTS "Allow public read product_images" ON product_images;
DROP POLICY IF EXISTS "Allow all for authenticated product_images" ON product_images;

-- Recreate policies
CREATE POLICY "Allow public read images" ON images FOR SELECT USING (true);
CREATE POLICY "Allow all for authenticated images" ON images FOR ALL USING (true);

CREATE POLICY "Allow public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow all for authenticated product_images" ON product_images FOR ALL USING (true);

-- =====================================================
-- 8. Phase 3 Updates - Site Settings & Watermark
-- =====================================================

-- Site settings table for admin configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(50) DEFAULT 'text', -- text, image, json
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value, type, description) VALUES
  ('company_name', 'SINOTRUK Hà Nội', 'text', 'Tên công ty'),
  ('company_logo', NULL, 'image', 'Logo công ty'),
  ('hotline', '0382890990', 'text', 'Số hotline'),
  ('address', 'Hà Nội, Việt Nam', 'text', 'Địa chỉ công ty'),
  ('watermark_enabled', 'true', 'text', 'Bật/tắt watermark'),
  ('watermark_text', 'SINOTRUK Hà Nội', 'text', 'Text watermark'),
  ('watermark_opacity', '40', 'text', 'Độ trong suốt watermark (0-100)')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow all for authenticated site_settings" ON site_settings;

CREATE POLICY "Allow public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow all for authenticated site_settings" ON site_settings FOR ALL USING (true);

-- Done!
SELECT 'Schema updated with Phase 3 settings support!' as status;
