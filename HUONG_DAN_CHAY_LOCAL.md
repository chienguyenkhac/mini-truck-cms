### Bước 1: Khởi động Database (Dùng Docker)

Mở cmd tại thư mục `deploy/` của dự án và chạy lệnh:

```powershell
docker-compose up -d db
```

### Bước 2: Cấu hình và Chạy Backend (API Server)

1. Di chuyển vào thư mục server:

   ```powershell
   cd deploy/server
   ```
2. Khởi động API Server:

   ```powershell
   npm run dev
   ```

   *Server sẽ chạy tại: `http://localhost:3001`*

### Bước 3: Cấu hình và Chạy Frontend (Client)

1. Mở một cửa sổ cmd **mới** tại thư mục gốc của dự án.
2. Khởi động Web:

   ```powershell
   npm run dev
   ```

   *Truy cập Web tại: `http://localhost:5173`*

### Bước 4: Chạy Trang Admin

1. Mở một cửa sổ cmd **mới** tại thư mục `admin_ui/`.
2. Cài đặt và chạy:

   ```powershell
   # Dùng lệnh này để nạp file .env mà KHÔNG cần sửa code:
   node --env-file=.env index.js
   ```
   *Truy cập Admin tại: **http://localhost:3000/secret/** (Lưu ý: Bắt buộc phải có dấu `/` ở cuối)*
