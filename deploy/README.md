# SINOTRUK Hà Nội - Deploy Đơn Giản

## 🚀 Chỉ Cần 1 Lệnh!

### Bước 1: Upload Files
```bash
# Upload thư mục deploy lên server
scp -r deploy/ user@your-server:/www/wwwroot/sinotruk/

# SSH vào server
ssh user@your-server
cd /www/wwwroot/sinotruk
chmod +x deploy.sh
```

### Bước 2: Chạy 1 Lệnh Duy Nhất
```bash
# Deploy tự động tất cả (install + setup + deploy)
sudo ./deploy.sh auto
```

**🎉 Xong! Chỉ 1 lệnh duy nhất!**

---

## 🛠 Quản Lý Đơn Giản

### Tất Cả Trong 1 Script
```bash
./deploy.sh auto       # Deploy tự động tất cả
./deploy.sh status     # Kiểm tra trạng thái
./deploy.sh logs       # Xem logs
./deploy.sh health     # Kiểm tra sức khỏe
./deploy.sh start      # Khởi động
./deploy.sh stop       # Dừng
./deploy.sh restart    # Khởi động lại
./deploy.sh backup     # Backup
./deploy.sh cleanup    # Dọn dẹp
```

### Các Lệnh Từng Bước (Nếu Cần)
```bash
sudo ./deploy.sh install    # Chỉ cài đặt dependencies
./deploy.sh setup           # Chỉ setup environment  
sudo ./deploy.sh deploy     # Chỉ deploy ứng dụng
```

---

## 🔧 Cấu Hình aaPanel (Sau khi deploy)

### 1. Tạo Website
1. **Website** → **Add site**
2. Domain: `yourdomain.com`
3. PHP Version: **Pure Static**

### 2. Cấu Hình Reverse Proxy
1. **Website** → Chọn domain → **Config** → **Reverse Proxy**
2. **Target URL**: `http://127.0.0.1:80`
3. **Send Domain**: `$host`

### 3. Cài SSL Certificate
1. **Website** → Chọn domain → **SSL**
2. **Let's Encrypt** → **Apply**

---

## 🚨 Khắc Phục Sự Cố

### Kiểm Tra & Sửa Lỗi
```bash
./deploy.sh health     # Kiểm tra tổng thể
./deploy.sh logs       # Xem logs lỗi
./deploy.sh restart    # Khởi động lại
./deploy.sh cleanup    # Dọn dẹp nếu lỗi
```

### Lỗi Thường Gặp
```bash
# Container không chạy
./deploy.sh restart

# API lỗi  
curl http://localhost:3001/api/health

# Disk đầy
./deploy.sh cleanup
```

---

## 🔒 Security & Performance

### Tự Động Được Cấu Hình
- ✅ Firewall rules
- ✅ SSL certificate support  
- ✅ Secure passwords generation
- ✅ File permissions
- ✅ System optimization
- ✅ Log rotation
- ✅ Health monitoring

### Cần Cấu Hình Thủ Công
- Domain DNS settings
- aaPanel reverse proxy
- SSL certificate installation
- Regular backups schedule

---

## 📁 Cấu Trúc Đơn Giản

```
/www/wwwroot/sinotruk/
├── deploy.sh            # Script chính duy nhất
├── commands/            # Các module nhỏ
│   ├── install.sh       # Cài đặt
│   ├── setup.sh         # Thiết lập
│   ├── deploy-app.sh    # Deploy
│   └── ...              # Các lệnh khác
├── docker-compose.yml   # Docker config
├── server/              # Backend API
├── client/              # Frontend  
├── admin/               # Admin panel
└── uploads/             # Ảnh upload
```

---

## 🚨 Emergency Commands

```bash
# Dừng tất cả services
./manage.sh stop

# Khôi phục từ backup
./manage.sh restore

# Rebuild hoàn toàn
docker-compose down -v
sudo ./auto-deploy.sh

# Kiểm tra logs lỗi
./manage.sh logs | grep -i error
```

---

## 📞 Support

---

**🎉 Đơn giản vậy thôi!**

Xem file `GUIDE.md` để có hướng dẫn chi tiết hơn.
