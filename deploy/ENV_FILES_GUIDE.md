# Hướng dẫn phân biệt file .env trong dự án SINOTRUK

## Tổng quan

Dự án SINOTRUK sử dụng nhiều file môi trường (environment) khác nhau tùy thuộc vào vị trí và mục đích sử dụng. Tài liệu này sẽ giải thích sự khác biệt giữa các file `.env` trong các thư mục khác nhau.

---

## 1. File .env trong thư mục `deploy/`

### 📍 Vị trí
```
deploy/
├── .env                    ← File này
├── docker-compose.yml
├── server/
└── ...
```

### 🎯 Mục đích
File `.env` này được sử dụng bởi **Docker Compose** để cấu hình các biến môi trường cho toàn bộ hệ thống container.

### 📋 Nội dung chính
```env
# Database Configuration cho Docker Compose
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=sinotruk

# API Configuration
API_PORT=3001

# Other Docker-level configurations
```

### 🔧 Được sử dụng bởi
- `docker-compose.yml` - để thiết lập các biến môi trường cho containers
- Database container (PostgreSQL)
- API container (Node.js)
- Nginx container

### 📝 Ví dụ sử dụng trong docker-compose.yml
```yaml
services:
  db:
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME:-postgres}
  
  api:
    environment:
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD}@db:5432/${DB_NAME:-postgres}
      PORT: ${API_PORT:-3001}
```

---

## 2. File .env trong thư mục `deploy/server/`

### 📍 Vị trí
```
deploy/server/
├── .env                    ← File này
├── index.js
├── package.json
├── env.development.template
├── env.production.template
└── README-ENV.md
```

### 🎯 Mục đích
File `.env` này được sử dụng trực tiếp bởi **ứng dụng Node.js API server** để cấu hình runtime của ứng dụng.

### 📋 Nội dung chính
```env
# Environment
NODE_ENV=production

# Server Configuration
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://postgres:password@db:5432/sinotruk

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
```

### 🔧 Được sử dụng bởi
- Node.js application (`index.js`)
- API routes và middleware
- Database connection logic
- File upload handlers
- Logging system

### 📝 Ví dụ sử dụng trong Node.js
```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
```

---

## 3. So sánh chi tiết

| Khía cạnh | `deploy/.env` | `deploy/server/.env` |
|-----------|---------------|---------------------|
| **Phạm vi** | Toàn bộ Docker stack | Chỉ Node.js application |
| **Được đọc bởi** | Docker Compose | Node.js runtime |
| **Mục đích chính** | Container orchestration | Application configuration |
| **Biến điển hình** | `DB_PASSWORD`, `API_PORT` | `NODE_ENV`, `CORS_ORIGIN`, `LOG_LEVEL` |
| **Khi nào cần** | Khi deploy với Docker | Khi chạy Node.js app |
| **Template** | Không có | `env.development.template`, `env.production.template` |

---

## 4. Quy trình thiết lập

### 🐳 Cho Docker Deployment (Production)

1. **Tạo file `deploy/.env`:**
```bash
cd deploy/
cp .env.example .env  # Nếu có template
# Hoặc tạo mới với nội dung:
```
```env
DB_PASSWORD=your_secure_password_here
DB_USER=postgres
DB_NAME=sinotruk
API_PORT=3001
```

2. **Tạo file `deploy/server/.env`:**
```bash
cd deploy/server/
cp env.production.template .env
# Chỉnh sửa các giá trị cần thiết
```

### 💻 Cho Local Development

1. **Không cần `deploy/.env`** (vì không dùng Docker Compose)

2. **Chỉ cần `deploy/server/.env`:**
```bash
cd deploy/server/
cp env.development.template .env
```

---

## 5. Lưu ý quan trọng

### ⚠️ Bảo mật
- **KHÔNG BAO GIỜ** commit file `.env` vào Git
- Luôn sử dụng `.env.example` hoặc `.env.template` cho việc chia sẻ
- Sử dụng mật khẩu mạnh cho production

### 🔄 Đồng bộ hóa
- Đảm bảo `DATABASE_URL` trong `deploy/server/.env` khớp với thông tin database từ `deploy/.env`
- Port trong `deploy/server/.env` phải khớp với `API_PORT` trong `deploy/.env`

### 📁 Gitignore
Đảm bảo `.gitignore` có:
```gitignore
.env
*.env
!*.env.example
!*.env.template
```

---

## 6. Troubleshooting

### ❌ Lỗi thường gặp

1. **"Database connection failed"**
   - Kiểm tra `DATABASE_URL` trong `deploy/server/.env`
   - Đảm bảo database credentials khớp với `deploy/.env`

2. **"Port already in use"**
   - Kiểm tra `PORT` trong `deploy/server/.env`
   - Đảm bảo khớp với `API_PORT` trong `deploy/.env`

3. **"CORS error"**
   - Kiểm tra `CORS_ORIGIN` trong `deploy/server/.env`
   - Đảm bảo domain frontend được liệt kê

### ✅ Cách kiểm tra

```bash
# Kiểm tra Docker Compose có đọc được biến không
docker-compose config

# Kiểm tra Node.js app có đọc được biến không
cd deploy/server/
node -e "require('dotenv').config(); console.log(process.env.NODE_ENV)"
```

---

## 7. Kết luận

- **`deploy/.env`**: Dành cho Docker Compose, quản lý infrastructure
- **`deploy/server/.env`**: Dành cho Node.js application, quản lý business logic

Hiểu rõ sự khác biệt này sẽ giúp bạn debug và maintain dự án hiệu quả hơn.
