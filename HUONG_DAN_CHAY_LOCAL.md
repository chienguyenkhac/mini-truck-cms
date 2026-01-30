# HƯỚNG DẪN CHẠY DỰ ÁN TRÊN MÁY LOCAL VỚI DOCKER DESKTOP

## Yêu Cầu Hệ Thống

- **Docker Desktop**: Đã cài đặt và đang chạy
- **Node.js**: Phiên bản 18 hoặc cao hơn
- **npm**: Phiên bản 8 hoặc cao hơn

## Cách 1: Khởi Chạy Nhanh (Khuyến Nghị)

### Bước 1: Khởi động và cài đặt

Mở PowerShell hoặc CMD tại thư mục gốc của dự án và chạy:

```powershell
.\start-local.bat
```

Script này sẽ tự động:
- Kiểm tra Docker Desktop đã chạy chưa
- Khởi động PostgreSQL database trong Docker
- Cài đặt tất cả dependencies cho Server, Frontend và Admin UI

### Bước 2: Khởi động các services

Sau khi setup xong, chạy:

```powershell
.\start-services.bat
```

Script này sẽ tự động mở 3 terminal windows:
- **API Server**: http://localhost:3001
- **Frontend**: http://localhost:5173
- **Admin UI**: http://localhost:5174/secret

### Bước 3: Dừng các services

Để dừng database:

```powershell
.\stop-local.bat
```

Hoặc dừng database và xóa dữ liệu:

```powershell
docker-compose -f docker-compose.local.yml down -v
```

---

## Cách 2: Khởi Chạy Thủ Công

### Bước 1: Khởi động Database (Dùng Docker)

Mở cmd tại thư mục **gốc** của dự án và chạy lệnh:

```powershell
docker-compose -f docker-compose.local.yml up -d
```

Đợi khoảng 30 giây để database khởi động hoàn tất.

### Bước 2: Cài đặt Dependencies

Cài đặt dependencies cho Server:

```powershell
cd deploy\server
npm install
cd ..\..
```

Cài đặt dependencies cho Frontend:

```powershell
npm install
```

Cài đặt dependencies cho Admin UI:

```powershell
cd admin_ui
npm install
cd ..
```

### Bước 3: Chạy Backend (API Server)

Mở terminal **mới** và chạy:

```powershell
cd deploy\server
npm run dev
```

*Server sẽ chạy tại: `http://localhost:3001`*

### Bước 4: Chạy Frontend (Client)

Mở terminal **mới** tại thư mục gốc của dự án:

```powershell
npm run dev
```

*Truy cập Web tại: `http://localhost:5173`*

### Bước 5: Chạy Trang Admin

Mở terminal **mới** tại thư mục `admin_ui/`:

```powershell
cd admin_ui
npm run dev
```

*Truy cập Admin tại: `http://localhost:5174/secret`*

---

## Thông Tin Cấu Hình

### Database (PostgreSQL trong Docker)
- **Host**: localhost
- **Port**: 5433 (để tránh conflict với PostgreSQL local nếu có)
- **Database**: sinotruk
- **Username**: postgres
- **Password**: sinotruk123

### API Endpoints
- **API Server**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Web Interfaces
- **Frontend (Customer)**: http://localhost:5173
- **Admin Panel**: http://localhost:5174/secret

---

## Khắc Phục Sự Cố

### Docker Desktop không chạy
```
[ERROR] Docker Desktop chưa được khởi động!
```
**Giải pháp**: Mở Docker Desktop và chờ nó khởi động xong, sau đó chạy lại script.

### Database chưa sẵn sàng
```
[WARNING] Database chưa sẵn sàng
```
**Giải pháp**: Đợi thêm vài giây và kiểm tra lại:
```powershell
docker ps
docker logs sinotruk-db-local
```

### Port đã được sử dụng
```
Error: Port 5433 is already allocated
```
**Giải pháp**: 
- Dừng service đang dùng port đó, hoặc
- Thay đổi port trong file `docker-compose.local.yml`

### Không thể kết nối Database từ API Server
**Giải pháp**: Kiểm tra biến môi trường DATABASE_URL trong file `deploy/server/.env` (nếu cần tạo):
```
DATABASE_URL=postgresql://postgres:sinotruk123@localhost:5433/sinotruk
```

---

## Lệnh Docker Hữu Ích

Xem các container đang chạy:
```powershell
docker ps
```

Xem logs của database:
```powershell
docker logs sinotruk-db-local
```

Dừng database:
```powershell
docker-compose -f docker-compose.local.yml down
```

Dừng và xóa tất cả dữ liệu:
```powershell
docker-compose -f docker-compose.local.yml down -v
```

Kết nối vào database để kiểm tra:
```powershell
docker exec -it sinotruk-db-local psql -U postgres -d sinotruk
```
