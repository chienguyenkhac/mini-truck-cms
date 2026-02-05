-- Migration: Add brand column to categories table
-- Date: 2026-01-31
-- Description: Add brand field to support vehicle brand information

-- Add brand column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'brand'
    ) THEN
        ALTER TABLE categories ADD COLUMN brand VARCHAR(100);
        RAISE NOTICE 'Column brand added to categories table';
    ELSE
        RAISE NOTICE 'Column brand already exists in categories table';
    END IF;
END $$;

-- Optional: Add index for brand column for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_brand ON categories(brand);

-- Optional: Add comment to document the column
COMMENT ON COLUMN categories.brand IS 'Brand name for vehicle categories (e.g., HOWO, SINOTRUK)';







