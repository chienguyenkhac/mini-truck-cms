# 🚀 Hướng Dẫn Deploy Sinotruk lên VPS

## Yêu Cầu

- VPS CentOS 7+ với aaPanel
- Docker đã cài đặt
- Domain đã trỏ về IP VPS

---

## Bước 1: Upload Files

1. Mở **aaPanel** → **Files**
2. Tạo folder `/www/wwwroot/sinotruk`
3. Upload toàn bộ folder `deploy/` lên

---

## Bước 2: Cài Docker (nếu chưa có)

Trong aaPanel:
1. Click **Docker** ở sidebar
2. Click **Install** nếu chưa cài

Hoặc Terminal:
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

---

## Bước 3: Chạy Docker Compose

Mở **Terminal** trong aaPanel hoặc SSH:

```bash
cd /www/wwwroot/sinotruk

# Copy env file
cp .env.production .env

# Chỉnh sửa domain trong nginx config
nano nginx/nginx.prod.conf

# Chạy Docker
docker-compose -f docker-compose.prod.yml up -d

# Kiểm tra containers
docker ps
```

---

## Bước 4: Setup Domain trong aaPanel

1. Click **Website** → **Add Site**
2. Nhập domain: `sinotruk-hanoi.vn`
3. PHP: **Pure Static**
4. Sau đó **Delete site** vừa tạo (chỉ cần DNS setup)

Hoặc cấu hình Nginx proxy:
1. Click **Website** → **Nginx** → **Config**
2. Thêm cấu hình reverse proxy

---

## Bước 5: SSL Certificate

Trong aaPanel:
1. Click **Website** → Click site → **SSL**
2. Chọn **Let's Encrypt**
3. Click **Apply**

Hoặc dùng certbot:
```bash
docker run -it --rm -v /www/wwwroot/sinotruk/certbot/conf:/etc/letsencrypt \
  -v /www/wwwroot/sinotruk/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d sinotruk-hanoi.vn -d www.sinotruk-hanoi.vn
```

---

## Bước 6: Kiểm Tra

```bash
# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Test API
curl http://localhost:3002/api/products

# Test website
curl http://localhost/
```

---

## URLs Sau Deploy

| URL | Mô tả |
|-----|-------|
| https://sinotruk-hanoi.vn | Website chính |
| https://sinotruk-hanoi.vn/secret | Admin Panel |
| https://sinotruk-hanoi.vn/api | API |

---

## Troubleshooting

### Container không start:
```bash
docker-compose -f docker-compose.prod.yml logs
```

### Database connection error:
```bash
docker exec -it sinotruk-db psql -U postgres
```

### Nginx error:
```bash
docker exec -it sinotruk-nginx nginx -t
```

### Restart all:
```bash
docker-compose -f docker-compose.prod.yml restart
```
