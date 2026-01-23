# Hướng dẫn thay đổi Frontend để không dùng Supabase

## Tổng quan

Để frontend hoạt động độc lập khỏi Supabase, bạn cần thay thế file service:

## Bước thực hiện

### 1. Thay thế file service

**Copy file mới:**
```bash
cp deploy/src/services/api.js src/services/supabase.js
```

Hoặc thay đổi import trong tất cả các file từ:
```javascript
import { supabase, getProducts } from '../services/supabase'
```

Thành:
```javascript
import { supabase, getProducts } from '../services/api'
```

### 2. Cập nhật environment variable

Trong file `.env`:
```
VITE_API_URL=/api
```

Khi deploy production sẽ là:
```
VITE_API_URL=https://your-domain.com/api
```

### 3. Build lại frontend

```bash
npm run build
cd admin_ui && npm run build
```

## Danh sách files cần check

Các file sau đang import từ `supabase.js`:

1. `src/pages/Catalog.jsx`
2. `src/pages/ProductCategory.jsx`
3. `src/pages/ImageLibrary.jsx`
4. `src/pages/About.jsx`
5. `src/pages/ProductDetail.jsx`
6. `src/pages/Products.jsx`
7. `src/components/Layout/Footer.jsx`
8. `src/components/Layout/Navbar.jsx`
9. `src/components/Home/CategoryShowcase.jsx`
10. `src/components/Home/ProductGrid.jsx`
11. `src/components/Home/VehicleShowcase.jsx`

## API Endpoints có sẵn

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/products` | GET | Danh sách sản phẩm |
| `/api/products/:id` | GET | Chi tiết sản phẩm |
| `/api/categories` | GET | Danh mục |
| `/api/site-settings` | GET | Cài đặt website |
| `/api/catalog-articles` | GET | Bài viết |
| `/api/gallery-images` | GET | Thư viện ảnh |
| `/api/product-images/:id` | GET | Ảnh sản phẩm |
| `/api/admin/login` | POST | Đăng nhập admin |
| `/api/admin/profile/:id` | GET/PUT | Profile admin |
