# SINOTRUK Hà Nội - Hướng dẫn Deploy trên aaPanel

## Yêu cầu hệ thống

- **Server**: Ubuntu 20.04+ hoặc CentOS 7+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB)
- **Disk**: Tối thiểu 20GB
- **aaPanel**: Đã cài đặt và hoạt động
- **Docker**: Sẽ được cài qua aaPanel

---

## Bước 1: Cài Docker trên aaPanel

1. Đăng nhập vào **aaPanel**
2. Vào **App Store** → **Installed** → tìm **Docker Manager**
3. Nhấn **Install** để cài Docker
4. Chờ quá trình cài đặt hoàn tất

---

## Bước 2: Upload files lên server

### Cách 1: Qua aaPanel File Manager
1. Vào **Files** → điều hướng đến `/www/wwwroot/`
2. Tạo thư mục mới: `sinotruk`
3. Upload toàn bộ thư mục `deploy/` vào `/www/wwwroot/sinotruk/`

### Cách 2: Qua SSH
```bash
cd /www/wwwroot/
mkdir sinotruk
cd sinotruk
# Upload files qua SCP hoặc SFTP
```

---

## Bước 3: Upload ảnh lên server

Copy toàn bộ ảnh từ thư mục `images/` vào:
```
/www/wwwroot/sinotruk/uploads/original/
```

---

## Bước 4: Cấu hình Environment

```bash
cd /www/wwwroot/sinotruk/deploy
cp .env.example .env
nano .env
```

Chỉnh sửa:
```
DB_PASSWORD=mat_khau_postgresql_cua_ban
```

---

## Bước 5: Khởi động Docker containers

```bash
cd /www/wwwroot/sinotruk/deploy
docker-compose up -d
```

Kiểm tra containers đang chạy:
```bash
docker-compose ps
```

---

## Bước 6: Cấu hình Domain trên aaPanel

1. Vào **Website** → **Add site**
2. Nhập domain của bạn (ví dụ: `sinotruk.example.com`)
3. Chọn **PHP Version**: Pure Static
4. Sau khi tạo xong, vào **Config** → **Reverse Proxy**
5. Thêm:
   - **Target URL**: `http://127.0.0.1:80`
   - **Send Domain**: `$host`

---

## Bước 7: Cấu hình SSL (HTTPS)

1. Vào **Website** → chọn domain → **SSL**
2. Chọn **Let's Encrypt**
3. Nhấn **Apply** để lấy chứng chỉ miễn phí

---

## Các lệnh hữu ích

```bash
# Xem logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Stop tất cả
docker-compose down

# Rebuild và khởi động lại
docker-compose up -d --build

# Vào database
docker exec -it sinotruk-db psql -U postgres -d sinotruk
```

---

## Cấu trúc thư mục

```
/www/wwwroot/sinotruk/
├── deploy/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env
│   ├── nginx/
│   │   └── default.conf
│   ├── server/
│   │   ├── index.js
│   │   └── package.json
│   └── sinotruk_full_backup.sql
└── uploads/
    ├── original/     ← Ảnh gốc
    └── watermarked/  ← Ảnh đã watermark (tự động tạo)
```

---

## Troubleshooting

### Container không khởi động
```bash
docker-compose logs api
docker-compose logs db
```

### Lỗi database connection
- Kiểm tra file `.env` có đúng password
- Kiểm tra database đã import thành công: `docker exec -it sinotruk-db psql -U postgres -c "\dt"`

### Ảnh không hiển thị
- Kiểm tra ảnh đã upload vào `/uploads/original/`
- Kiểm tra permission: `chmod -R 755 uploads/`

---

## Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ đội ngũ phát triển.
