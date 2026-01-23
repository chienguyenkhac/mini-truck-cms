# Chi tiết Admin Dashboard (Admin UI)

Hệ thống Admin quản trị được viết bằng **React + TypeScript**, tập trung vào tính năng quản lý dữ liệu mạnh mẽ và tiện dụng.

## 🔐 Cơ chế bảo mật & Routing
- **App.tsx**: Sử dụng `ProtectedRoute` và `PublicRoute` để kiểm soát truy cập dựa trên `localStorage` (isAuthenticated).
- **Layout**: Cung cấp cấu trúc sidebar/header thống nhất cho tất cả các trang quản trị.

## 📦 Quản lý Sản phẩm (`admin_ui/src/pages/Products.tsx`)
Đây là module quan trọng nhất với các tính năng:
- **Cursor Pagination**: Phân trang dựa trên Cursor (GT/LT ID) thay vì Offset, giúp tối ưu hóa khi dữ liệu lớn.
- **Filters**: Lọc nhanh theo Loại xe, Loại phụ tùng và Mã nhà sản xuất.
- **Bulk Actions**:
    - **Export Excel**: Sử dụng thư viện `xlsx` để xuất toàn bộ sản phẩm ra file Excel.
    - **Import Excel**: Hỗ trợ nhập hàng loạt sản phẩm từ file Excel (thông qua `ImportExcelModal`).
- **Product Operations**:
    - Thêm/Sửa sản phẩm với giao diện Modal (`AddProductModal`, `EditProductModal`).
    - Bật/Tắt hiển thị trên trang chủ (Show on Homepage) bằng Toggle switch.
    - Sao chép nhanh liên kết sản phẩm phía khách hàng.

## 📂 Thư viện ảnh (`admin_ui/src/pages/ImageLibrary.tsx`)
- Quản lý tập trung mọi hình ảnh được tải lên.
- Tích hợp phân trang và xem trước ảnh lớn.

## ⚙️ Cài đặt hệ thống (`admin_ui/src/pages/Settings.tsx`)
- Quản lý các thông tin cấu hình (`site_settings` table):
    - Tên công ty, Hotline, Địa chỉ.
    - Logo công ty.
    - Cài đặt Watermark (Bật/Tắt).

## 🧩 Shared Components
- **Notification Provider**: Hệ thống thông báo toast (success, error, info) toàn cục.
- **ConfirmDeleteModal**: Thành phần dùng chung để xác nhận trước khi xóa dữ liệu quan trọng.
- **Modals**: Tất cả các hành động CRUD đều được thực hiện qua Modal để giữ người dùng ở lại trang hiện tại.

## 🔌 API Service (`admin_ui/src/services/supabase.ts`)
- Mặc dù file đặt tên là `supabase`, thực tế nó là một lớp trừu tượng (service layer) gọi đến Express API server.
- Hỗ trợ đầy đủ các hàm CRUD: `.getAll()`, `.getById()`, `.create()`, `.update()`, `.delete()`.
