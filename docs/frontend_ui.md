# Chi tiết Giao diện Khách hàng (Frontend UI)

Giao diện khách hàng được xây dựng với mục tiêu mang lại trải nghiệm "premium", sử dụng nhiều hiệu ứng 3D và animation hiện đại.

## 🎨 Phong cách thiết kế
- **Màu sắc chủ đạo**: Primary (#1e9ba8 - Teal), Secondary (#800c0b - Red), Gray/Slate.
- **Typography**: Sử dụng font hiện đại, phân cấp rõ ràng.
- **Glassmorphism**: Sử dụng hiệu ứng mờ nhám cho các thành phần UI (Navbar, Cards).

## 🧩 Các Component tiêu biểu

### 1. Hero Section (`src/components/Home/Hero.jsx`)
- **Hiệu ứng Slidshow**: Sử dụng `framer-motion` (`AnimatePresence`) để chuyển đổi banner mượt mà.
- **Hiệu ứng Chữ**: Sử dụng `gsap` để tách chữ và animate từng ký tự khi trang tải.
- **Magnetic Buttons**: Hook `useMagnetic` kết hợp với `gsap` tạo hiệu ứng nút "hút" theo con trỏ chuột.
- **3D Overlay**: Tích hợp `Canvas` từ `@react-three/fiber` để hiển thị mô hình xe tải trừu tượng.

### 2. Mô hình 3D (`src/components/ThreeDModels.jsx`, `AboutSection.jsx`)
- Sử dụng **Three.js** qua thư viện **Fiber** và **Drei**.
- **FloatingSphere**: Các khối cầu chuyển động tự do với `MeshDistortMaterial`, tạo cảm giác công nghệ cao.
- **StylizedTruck**: Mô hình xe tải được dựng bằng code (Box/Cylinder Geometry), tối ưu hóa hiệu suất thay vì tải file 3D nặng.
- **PresentationControls**: Cho phép người dùng xoay/tương tác với mô hình 3D.

### 3. Product Grid & Cards (`src/components/Home/ProductGrid.jsx`)
- **TiltCard Effect**: Sử dụng `requestAnimationFrame` và `transform: perspective` để tạo hiệu ứng nghiêng 3D khi di chuột qua.
- **Animation**: Sử dụng `IntersectionObserver` và `gsap` để trigger animation của các card sản phẩm khi người dùng cuộn tới.

### 4. Vehicle Showcase (`src/components/Home/VehicleShowcase.jsx`)
- Hiển thị danh sách dòng xe (phân loại theo Category).
- Có tính năng lọc nhanh theo thương hiệu (HOWO, SITRAK).
- Tích hợp Carousel tự chế với animation mượt mà.

### 5. Navbar (`src/components/Layout/Navbar.jsx`)
- Tự động thay đổi kiểu dáng (scrolled state) khi cuộn trang.
- Menu đa cấp (Mega menu đơn giản) hỗ trợ cả Desktop và Mobile.
- Logo được animate "lung lay" nhẹ nhàng bằng `gsap` khi di chuột.

### 6. Bảo vệ hình ảnh (`src/components/ImageProtection.jsx`)
- Chặn chuột phải trực tiếp trên các ảnh có proxy `/api/image`.
- Thay thế menu mặc định của trình duyệt bằng menu tùy chỉnh, buộc người dùng phải tải xuống bản có **Watermark**.

## 🛠️ Thư viện Animation chính
- **GSAP**: Dùng cho các hiệu ứng phức tạp về vị trí, xoay và stagger.
- **Framer Motion**: Dùng cho layout transitions, modals, và các hiệu ứng đơn giản.
- **React Three Fiber (R3F)**: Render mô hình 3D real-time.
