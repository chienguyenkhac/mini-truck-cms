# Hướng dẫn Import Database với Slug

## ⚠️ Quan trọng: Backup trước khi import

Trước khi import lại database, hãy backup dữ liệu hiện tại!

## Cách 1: Sử dụng script có sẵn (Khuyến nghị)

```bash
# Windows
import-database.bat
```

Script này sẽ:
1. Đọc DATABASE_URL từ `deploy/server/.env`
2. Import file `deploy/server/init.sql`
3. Tạo lại toàn bộ database với cột slug

## Cách 2: Import thủ công

### Nếu dùng Supabase:

1. Vào Supabase Dashboard → SQL Editor
2. Chạy lệnh này để backup categories hiện tại:

```sql
-- Backup categories trước khi thay đổi
CREATE TABLE categories_backup AS SELECT * FROM categories;
```

3. Thêm cột slug vào bảng categories:

```sql
-- Add slug column
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
```

4. Tạo function generate_slug:

```sql
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
```

5. Tạo trigger function:

```sql
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
```

6. Tạo trigger:

```sql
-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_category_slug ON categories;
CREATE TRIGGER trigger_auto_generate_category_slug
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_category_slug();
```

7. Update slug cho các categories hiện có:

```sql
-- Generate slugs for existing categories
UPDATE categories SET slug = generate_slug(name);

-- Or manually set specific slugs
UPDATE categories SET slug = 'cabin-than-vo' WHERE id = 1;
UPDATE categories SET slug = 'dong-co' WHERE id = 2;
UPDATE categories SET slug = 'hop-so' WHERE id = 3;
UPDATE categories SET slug = 'he-thong-cau' WHERE id = 4;
UPDATE categories SET slug = 'ly-hop' WHERE id = 5;
UPDATE categories SET slug = 'giang-treo' WHERE id = 6;
UPDATE categories SET slug = 'truyen-dong' WHERE id = 7;
UPDATE categories SET slug = 'he-thong-lai' WHERE id = 8;
UPDATE categories SET slug = 'he-thong-hut-xa' WHERE id = 9;
UPDATE categories SET slug = 'he-thong-lam-mat' WHERE id = 10;
UPDATE categories SET slug = 'he-thong-dien' WHERE id = 11;
UPDATE categories SET slug = 'he-thong-nhien-lieu' WHERE id = 12;
UPDATE categories SET slug = 'he-thong-moay-o' WHERE id = 13;
UPDATE categories SET slug = 'he-thong-phanh' WHERE id = 14;
```

8. Tạo index:

```sql
-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
```

## Kiểm tra kết quả

Sau khi import/update, kiểm tra:

```sql
-- Xem tất cả categories với slug
SELECT id, name, slug FROM categories ORDER BY id;
```

Kết quả mong đợi:
```
 id |        name         |         slug          
----+---------------------+-----------------------
  1 | Cabin & Thân vỏ     | cabin-than-vo
  2 | Động cơ             | dong-co
  3 | Hộp số              | hop-so
  4 | Hệ thống cầu        | he-thong-cau
  5 | Ly hợp              | ly-hop
  ...
```

## Test URLs

Sau khi database đã có slug, test các URL:

✅ http://localhost:5173/products/dong-co
✅ http://localhost:5173/products/hop-so
✅ http://localhost:5173/products/he-thong-cau
✅ http://localhost:5173/products/ly-hop

## Troubleshooting

### Lỗi: column "slug" does not exist

➡️ Bạn chưa thêm cột slug. Chạy lại bước 3.

### Lỗi: duplicate key value violates unique constraint

➡️ Có 2 categories cùng slug. Kiểm tra:
```sql
SELECT slug, COUNT(*) FROM categories GROUP BY slug HAVING COUNT(*) > 1;
```

### Trang vẫn không hiển thị sản phẩm

➡️ Kiểm tra:
1. Database đã có slug chưa
2. Browser console có lỗi gì không
3. Network tab: request có đúng không
4. Categories có products không: `SELECT category_id, COUNT(*) FROM products GROUP BY category_id;`

