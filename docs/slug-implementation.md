# Hướng dẫn sử dụng Slug cho Categories

## Tổng quan

Hệ thống đã được cập nhật để sử dụng **slug** thay vì ID cho các URL danh mục sản phẩm. Điều này giúp:
- URL thân thiện với SEO hơn
- Dễ đọc và dễ nhớ hơn
- Tốt hơn cho trải nghiệm người dùng

## Ví dụ

### Trước (dùng ID):
```
http://localhost:5173/products?category=10
```

### Sau (dùng slug):
```
http://localhost:5173/products/dong-co
http://localhost:5173/products/hop-so
http://localhost:5173/products/he-thong-cau
```

## Cài đặt

### 1. Chạy Migration

Chạy file migration để thêm trường `slug` vào bảng `categories`:

**Windows:**
```bash
run-slug-migration.bat
```

**Linux/Mac hoặc thủ công:**
```bash
psql YOUR_DATABASE_URL -f deploy/server/migrations/add_slug_to_categories.sql
```

### 2. Migration sẽ:

1. ✅ Thêm cột `slug` vào bảng `categories`
2. ✅ Tạo function `generate_slug()` để chuyển đổi tiếng Việt có dấu sang slug
3. ✅ Tạo trigger tự động tạo slug khi thêm/sửa category
4. ✅ Tạo index cho trường `slug` để tăng tốc độ tìm kiếm
5. ✅ Cập nhật slug cho các danh mục hiện có

## Cách hoạt động

### Tự động tạo slug

Khi bạn thêm hoặc sửa category trong Admin UI, slug sẽ được tự động tạo từ tên:

```
"Động cơ"          → "dong-co"
"Hộp số"           → "hop-so"
"Hệ thống cầu"     → "he-thong-cau"
"Ly hợp"           → "ly-hop"
```

### Ưu tiên tìm kiếm trong ProductCategory

File `src/pages/ProductCategory.jsx` sẽ tìm category theo thứ tự:

1. **Slug** (ưu tiên): `/products/dong-co`
2. **ID** (fallback): `/products/2`
3. **Name** (fallback): Tìm theo tên gần đúng

## Cập nhật trong Code

### 1. CategorySection (Trang chủ)

```jsx
// Trước
<Link to="/products?category=2">Động cơ</Link>

// Sau
<Link to="/products/dong-co">Động cơ</Link>
```

### 2. Footer

```jsx
// Trước
{ label: 'Động cơ', path: '/products?category=2' }

// Sau
{ label: 'Động cơ', path: '/products/dong-co' }
```

### 3. Database Categories

Component `CategorySection` bây giờ load categories từ database và tự động sử dụng slug:

```jsx
const { data } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_vehicle_name', false)
    .eq('is_visible', true)

// Tạo link: /products/{slug}
```

## Quản lý Slug trong Admin UI

### Tự động

- Khi tạo category mới, slug được tự động tạo
- Khi sửa tên category, slug được tự động cập nhật

### Thủ công (nếu cần)

Bạn có thể cập nhật slug trực tiếp trong database nếu cần slug tùy chỉnh:

```sql
UPDATE categories 
SET slug = 'slug-tuy-chinh' 
WHERE id = 10;
```

## TypeScript Interfaces

Đã cập nhật interface trong `admin_ui/src/services/supabase.ts`:

```typescript
export interface Category {
    id: number;
    name: string;
    slug?: string;  // ← Added
    code?: string;
    thumbnail?: string;
    is_vehicle_name?: boolean;
    is_visible?: boolean;
    created_at: string;
    updated_at: string;
}
```

## Kiểm tra

### Test URLs:

1. `/products/dong-co` - Động cơ
2. `/products/hop-so` - Hộp số
3. `/products/he-thong-cau` - Hệ thống cầu
4. `/products/ly-hop` - Ly hợp

### Fallback:

Nếu slug không tồn tại, hệ thống vẫn hỗ trợ:
- `/products?category=2` (query param với ID)
- `/products/2` (route param với ID)

## Lợi ích

✅ **SEO**: URL có ý nghĩa, dễ index bởi Google
✅ **UX**: URL dễ đọc, dễ nhớ
✅ **Bảo trì**: Dễ debug và theo dõi
✅ **Tương thích ngược**: Vẫn hoạt động với ID cũ
✅ **Tự động**: Không cần nhập slug thủ công

## Troubleshooting

### Slug bị trùng

Nếu có 2 category cùng tên, database sẽ báo lỗi unique constraint. Cần đặt tên khác hoặc thêm số vào slug:

```sql
-- Nếu cần
UPDATE categories SET slug = 'dong-co-2' WHERE id = X;
```

### Slug không chính xác

Cập nhật lại slug:

```sql
UPDATE categories SET slug = NULL WHERE id = X;
-- Trigger sẽ tự động tạo lại slug từ name
```

### Migration lỗi

Kiểm tra:
1. Database connection string trong `.env`
2. Quyền user database (cần CREATE, UPDATE)
3. PostgreSQL version (khuyến nghị >= 12)

