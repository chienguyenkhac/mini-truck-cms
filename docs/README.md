# Tài liệu Hệ thống SINOTRUK Hà Nội

## 📌 Giới thiệu chung
Đây là tài liệu chi tiết về mã nguồn của hệ thống E-commerce SINOTRUK Hà Nội. Hệ thống được thiết kế để quản lý và phân phối phụ tùng xe tải (HOWO, SITRAK, v.v.) với các công nghệ hiện đại.

## 📂 Mục lục tài liệu
1. [**Frontend UI Components**](frontend_ui.md): Phân tích chi tiết các thành phần giao diện khách hàng, hiệu ứng 3D và animation.
2. [**Admin Dashboard**](admin_ui.md): Chi tiết về hệ thống quản lý sản phẩm, đơn hàng và cài đặt.
3. [**Backend API & Database**](backend_api.md): Cấu trúc Express server và schema PostgreSQL.
4. [**Deployment & Infrastructure**](deployment.md): Cấu hình Docker, Nginx và quy trình triển khai trên VPS (aaPanel).

## 🚀 Kiến trúc tổng quát
- **Frontend**: React (JSX/TSX), Vite, Tailwind CSS, GSAP, Framer Motion, Three.js (Fiber/Drei).
- **Backend**: Node.js, Express, Multer, Sharp (Image processing), PostgreSQL (pg).
- **Phân phối**: Nginx Reverse Proxy, Docker Compose.
