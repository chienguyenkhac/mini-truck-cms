-- Add slug field to categories table
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Create function to generate slug from Vietnamese text
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT) 
RETURNS TEXT AS $$
DECLARE
    slug_output TEXT;
BEGIN
    slug_output := LOWER(TRIM(text_input));
    
    -- Replace Vietnamese characters
    slug_output := TRANSLATE(slug_output,
        'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
        'aaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooouuuuuuuuuuuyyyyyd'
    );
    
    -- Replace spaces and special characters with hyphens
    slug_output := REGEXP_REPLACE(slug_output, '[^a-z0-9]+', '-', 'g');
    
    -- Remove leading/trailing hyphens
    slug_output := TRIM(BOTH '-' FROM slug_output);
    
    RETURN slug_output;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to auto-generate slug
CREATE OR REPLACE FUNCTION auto_generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate slug if it's not provided or empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_category_slug ON categories;
CREATE TRIGGER trigger_auto_generate_category_slug
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_category_slug();

-- Generate slugs for existing categories
UPDATE categories SET slug = NULL WHERE slug IS NULL OR slug = '';

-- Manual slug updates for specific categories based on CategorySection
-- These will override auto-generated slugs for better SEO
UPDATE categories SET slug = 'cabin-than-vo' WHERE name ILIKE '%cabin%' OR name ILIKE '%thân vỏ%';
UPDATE categories SET slug = 'dong-co' WHERE name ILIKE '%động cơ%' OR name = 'ĐỘNG CƠ';
UPDATE categories SET slug = 'hop-so' WHERE name ILIKE '%hộp số%' OR name = 'HỘP SỐ';
UPDATE categories SET slug = 'he-thong-cau' WHERE name ILIKE '%hệ thống cầu%' OR name ILIKE '%cầu%';
UPDATE categories SET slug = 'ly-hop' WHERE name ILIKE '%ly hợp%' OR name = 'LY HỢP';
UPDATE categories SET slug = 'he-thong-giang-treo' WHERE name ILIKE '%giằng treo%' OR name ILIKE '%treo%';
UPDATE categories SET slug = 'he-thong-truyen-dong' WHERE name ILIKE '%truyền động%';
UPDATE categories SET slug = 'he-thong-lai' WHERE name ILIKE '%lái%';
UPDATE categories SET slug = 'he-thong-hut-xa' WHERE name ILIKE '%hút xả%' OR name ILIKE '%xả%';
UPDATE categories SET slug = 'he-thong-lam-mat' WHERE name ILIKE '%làm mát%' OR name ILIKE '%mát%';
UPDATE categories SET slug = 'he-thong-dien' WHERE name ILIKE '%điện%' OR name = 'ĐIỆN';
UPDATE categories SET slug = 'he-thong-nhien-lieu' WHERE name ILIKE '%nhiên liệu%';
UPDATE categories SET slug = 'he-thong-moay-o' WHERE name ILIKE '%moay%';
UPDATE categories SET slug = 'he-thong-phanh' WHERE name ILIKE '%phanh%' OR name = 'PHANH';

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

