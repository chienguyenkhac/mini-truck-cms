-- Mini Truck CMS Database Initialization
-- Simple version for deployment

-- Set PostgreSQL configuration
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

-- Create database schema
CREATE SCHEMA IF NOT EXISTS public;

-- =============================================
-- TABLE: admin_users
-- =============================================
CREATE TABLE public.admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT 'Admin' NOT NULL,
    phone VARCHAR(50),
    avatar TEXT,
    is_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: categories
-- =============================================
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    is_vehicle_name BOOLEAN DEFAULT false,
    code VARCHAR(50),
    thumbnail VARCHAR(500),
    is_visible BOOLEAN DEFAULT true,
    brand VARCHAR(100),
    slug VARCHAR(255) UNIQUE
);

-- =============================================
-- TABLE: products
-- =============================================
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES public.categories(id),
    image TEXT,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    vehicle_ids INTEGER[] DEFAULT '{}',
    show_on_homepage BOOLEAN DEFAULT true,
    thumbnail VARCHAR(500),
    manufacturer_code VARCHAR(100)
);

-- =============================================
-- TABLE: images
-- =============================================
CREATE TABLE public.images (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: product_images
-- =============================================
CREATE TABLE public.product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    image_id INTEGER REFERENCES public.images(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: gallery_images
-- =============================================
CREATE TABLE public.gallery_images (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: catalog_articles
-- =============================================
CREATE TABLE public.catalog_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    slug VARCHAR(255) UNIQUE,
    is_published BOOLEAN DEFAULT false,
    featured_image TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: site_settings
-- =============================================
CREATE TABLE public.site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SAMPLE DATA: admin_users
-- =============================================
INSERT INTO public.admin_users (username, password, full_name, phone, is_admin) VALUES
('admin', '$2b$10$U1/jNEU7FelY8AFDbBnv0ed480uggKu8YwyJzCdupGBBCdWYHSDQ6', 'Administrator', '0382.890.990', true),

-- Note: Default password for both users is "123456"

-- =============================================
-- SAMPLE DATA: categories
-- =============================================
INSERT INTO public.categories (name, code, slug, is_visible) VALUES
('Cabin & Thân vỏ', 'CABIN', 'cabin-than-vo', true),
('Động cơ', 'ENGINE', 'dong-co', true),
('Hộp số', 'GEARBOX', 'hop-so', true),
('Hệ thống cầu', 'AXLE_SYS', 'he-thong-cau', true),
('Ly hợp', 'CLUTCH', 'ly-hop', true),
('Giằng treo', 'SUSPENSION', 'giang-treo', true),
('Truyền động', 'DRIVETRAIN', 'truyen-dong', true),
('Hệ thống lái', 'STEERING', 'he-thong-lai', true),
('Hệ thống hút xả', 'EXHAUST', 'he-thong-hut-xa', true),
('Hệ thống làm mát', 'COOLING', 'he-thong-lam-mat', true),
('Hệ thống phanh', 'BRAKE', 'he-thong-phanh', true),
('Điện & Điện tử', 'ELECTRICAL', 'dien-dien-tu', true),
('Phụ tùng khác', 'OTHERS', 'phu-tung-khac', true);

-- =============================================
-- SAMPLE DATA: products
-- =============================================
INSERT INTO public.products (code, name, category_id, description, slug, show_on_homepage) VALUES
('CB001', 'Cabin Driver Side Door', 1, 'Cửa cabin bên tài xế cho xe tải nhỏ', 'cabin-driver-side-door', true),
('CB002', 'Front Bumper Assembly', 1, 'Cụm cản trước hoàn chỉnh', 'front-bumper-assembly', true),
('EG001', 'Engine Block 4JB1', 2, 'Khối động cơ 4JB1 dành cho xe tải Isuzu', 'engine-block-4jb1', true),
('EG002', 'Cylinder Head', 2, 'Nắp máy động cơ', 'cylinder-head', true),
('GB001', 'Manual Transmission 5-Speed', 3, 'Hộp số sàn 5 cấp', 'manual-transmission-5-speed', true),
('AX001', 'Front Axle Assembly', 4, 'Cụm cầu trước hoàn chỉnh', 'front-axle-assembly', true),
('CL001', 'Clutch Disc', 5, 'Đĩa ly hợp', 'clutch-disc', true),
('SP001', 'Front Shock Absorber', 6, 'Giảm xóc trước', 'front-shock-absorber', true),
('DT001', 'Drive Shaft', 7, 'Trục truyền', 'drive-shaft', true),
('ST001', 'Steering Wheel', 8, 'Vô lăng', 'steering-wheel', true);

-- =============================================
-- SAMPLE DATA: site_settings
-- =============================================
INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', 'SINOTRUK HÀ NỘI', 'Tên website'),
('site_description', 'Hệ thống quản lý phụ tùng xe tải nhỏ', 'Mô tả website'),
('contact_phone', '0382.890.990', 'Số điện thoại liên hệ'),
('contact_email', 'info@minitruck.com', 'Email liên hệ'),
('address', '123 Đường ABC, Quận XYZ, TP.HCM', 'Địa chỉ công ty'),
('facebook_url', 'https://facebook.com/minitruck', 'Link Facebook'),
('zalo_url', 'https://zalo.me/minitruck', 'Link Zalo'),
('products_per_page', '12', 'Số sản phẩm hiển thị trên mỗi trang'),
('enable_registration', 'false', 'Cho phép đăng ký tài khoản mới'),
('maintenance_mode', 'false', 'Chế độ bảo trì website');

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_visible ON public.categories(is_visible);
CREATE INDEX idx_products_show_on_homepage ON public.products(show_on_homepage);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_site_settings_key ON public.site_settings(key);

-- =============================================
-- UPDATE SEQUENCES
-- =============================================
SELECT setval('public.admin_users_id_seq', (SELECT MAX(id) FROM public.admin_users));
SELECT setval('public.categories_id_seq', (SELECT MAX(id) FROM public.categories));
SELECT setval('public.products_id_seq', (SELECT MAX(id) FROM public.products));
SELECT setval('public.site_settings_id_seq', (SELECT MAX(id) FROM public.site_settings));

-- =============================================
-- GRANT PERMISSIONS (Optional - adjust as needed)
-- =============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT;

-- Database initialization completed successfully!