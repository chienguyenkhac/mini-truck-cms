# 📕 Hướng dẫn Chạy Local Dự án SINOTRUK (Dành cho Windows)

Tài liệu này hướng dẫn chi tiết cách cài đặt và chạy dự án Sinotruk trên máy tính Windows cá nhân để phục vụ việc phát triển và kiểm thử.

---

## 🛠 1. Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:
1. **Docker Desktop:** [Tải tại đây](https://www.docker.com/products/docker-desktop/) (Dùng để chạy Database).
2. **Node.js (Phiên bản 18 hoặc 20):** [Tải tại đây](https://nodejs.org/) (Dùng để chạy Web và API).
3. **Cửa sổ lệnh:** Khuyên dùng **PowerShell** hoặc **Command Prompt (CMD)**.

---

## 🚀 2. Các Bước Cài Đặt

### Bước 1: Khởi động Database (Dùng Docker)
Mở PowerShell tại thư mục `deploy/` của dự án và chạy lệnh sau:
```powershell
docker-compose up -d db
```
*Lệnh này sẽ tự động tạo một Database PostgreSQL và import dữ liệu mẫu từ file `sinotruk_full_backup.sql`.*

### Bước 2: Cấu hình và Chạy Backend (API Server)
1. Di chuyển vào thư mục server:
   ```powershell
   cd deploy/server
   ```
2. Cài đặt các thư viện cần thiết:
   ```powershell
   npm install
   ```
3. Khởi động API Server:
   ```powershell
   npm run dev
   ```
   *Lúc này Server sẽ chạy tại: `http://localhost:3001`*

### Bước 3: Cấu hình và Chạy Frontend (Trang chủ)
1. Mở một cửa sổ PowerShell **mới** tại thư mục gốc của dự án.
2. Cài đặt thư viện:
   ```powershell
   npm install
   ```
3. Khởi động Web:
   ```powershell
   npm run dev
   ```
   *Truy cập Web tại: `http://localhost:5173`*

### Bước 4: Chạy Trang Quản Trị (Admin UI)
1. Mở một cửa sổ PowerShell **mới** tại thư mục `admin_ui/`.
2. Cài đặt và chạy:
   ```powershell
   npm install
   # Dùng lệnh này để nạp file .env mà KHÔNG cần sửa code:
   node --env-file=.env index.js
   ```
   *Truy cập Admin tại: **http://localhost:3000/secret/** (Lưu ý: Bắt buộc phải có dấu `/` ở cuối)*

---

## 📝 3. Một số lưu ý quan trọng

* **Docker:** Luôn đảm bảo Docker Desktop đang bật trước khi chạy lệnh ở Bước 1.
* **Database:** Nếu muốn vào xem database trực tiếp, bạn có thể dùng các tool như **DBeaver** hoặc **pgAdmin** với thông tin:
  * Host: `localhost`
  * Port: `5433` (kiểm tra trong docker-compose.yml)
  * User: `postgres`
  * Password: `sinotruk123`
* **Lỗi Permission:** Nếu gặp lỗi khi chạy lệnh Docker trên Windows, hãy thử chạy PowerShell với quyền **Administrator**.

---
*Chúc anh/chị cài đặt thành công!*
