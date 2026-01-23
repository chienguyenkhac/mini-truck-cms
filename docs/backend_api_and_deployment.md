# Cấu trúc Backend API & Database

Backend được viết bằng Node.js Express, đóng vai trò thay thế hoàn toàn cho Supabase gốc, cung cấp khả năng tùy biến cao hơn cho xử lý ảnh và bảo mật.

## 🚀 Server (`deploy/server/index.js`)
- **Công nghệ**: Express.js, Multer (Upload), Sharp (Image processing), PG (PostgreSQL client).
- **Tính năng đặc biệt: Watermark Proxy**:
    - Endpoint `/api/image` nhận các tham số `path` (ảnh cục bộ) hoặc `url` (ảnh từ Cloudinary/Supabase).
    - Sử dụng thư viện **Sharp** để composite logo lên ảnh.
    - Logo được xử lý: độ mờ 30%, xoay -45 độ, lặp lại dạng Grid trên toàn bộ ảnh.
    - Có cơ chế cache ảnh đã gắn watermark tại `uploads/watermarked` để tăng tốc cho các yêu cầu sau.

## 🔌 Hệ thống API Endpoints
- **Sản phẩm**: CRUD đầy đủ, hỗ trợ filter phức tạp ngay tại câu lệnh SQL (ILIKE, Array contains).
- **Danh mục**: Quản lý `categories` với phân loại `is_vehicle_name`.
- **Bài viết**: Hệ thống article cho Blog/Catalog.
- **Hình ảnh**: Quản lý bản ghi ảnh trong DB và file thực tế trên đĩa.
- **Admin**: Login/Profile đơn giản (hiện tại so sánh text trực tiếp trong DB).

## 🗄️ Database Schema (`deploy/sinotruk_full_backup.sql`)
Các bảng chính bao gồm:
1. `products`: Lưu thông tin chi tiết phụ tùng.
2. `categories`: Danh mục sản phẩm và hãng xe.
3. `images`: Quản lý đường dẫn ảnh.
4. `product_images`: Bảng trung gian hỗ trợ 1 sản phẩm có nhiều ảnh.
5. `site_settings`: Lưu cấu hình hệ thống dạng Key-Value.
6. `catalog_articles`: Lưu nội dung bài viết định dạng JSONB.
7. `admin_users`: Quản lý tài khoản quản trị.

---

# Quy trình Triển khai (Deployment)

## 🐳 Docker Orchestration (`deploy/docker-compose.yml`)
Sử dụng 3 container chính:
1. **db**: PostgreSQL 16. Tự động init database từ file backup khi khởi chạy lần đầu.
2. **api**: Node.js server. Chạy ứng dụng Express và phục vụ các build static của frontend.
3. **nginx**: Hoạt động như một cổng vào (Ingress), điều phối traffic.

## 🛠️ Dockerfile (`deploy/Dockerfile`)
- **Multi-stage build**:
    - **Stage 1 (frontend-builder)**: Cài đặt deps và build cả `src` (client) và `admin_ui` (admin).
    - **Stage 2 (production)**: Chỉ cài đặt production dependencies cho server, sau đó copy các build static từ Stage 1 vào.
- Build cuối cùng rất nhẹ và chỉ chứa những gì cần thiết để chạy.

## 🌐 Nginx Config (`deploy/nginx/default.conf`)
- Route `/`: Phục vụ Customer website.
- Route `/secret`: Phục vụ Admin panel (alias).
- Route `/api`: Proxy đến container `api`.
- Route `/uploads`: Phục vụ trực tiếp ảnh từ volume chung.
- Tích hợp Gzip compression và cấu hình Cache-Control cho static assets.
