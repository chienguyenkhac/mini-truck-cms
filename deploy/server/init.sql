--
-- File init đơn giản hóa từ init-goc.sql
-- Chứa đầy đủ 8 bảng chính: admin_users, catalog_articles, categories, gallery_images, images, product_images, products, site_settings
-- Với dữ liệu mẫu cơ bản
--

-- Thiết lập cơ bản
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Xóa các bảng nếu đã tồn tại
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.catalog_articles CASCADE;
DROP TABLE IF EXISTS public.gallery_images CASCADE;
DROP TABLE IF EXISTS public.images CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Tạo bảng admin_users (quản trị viên)
CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(255) DEFAULT 'Admin'::character varying NOT NULL,
    phone character varying(50),
    avatar text,
    is_admin boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- Tạo sequence cho admin_users
CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;
ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);

-- Tạo bảng catalog_articles (bài viết catalog)
CREATE TABLE public.catalog_articles (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255),
    content jsonb,
    thumbnail character varying(500),
    is_published boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- Tạo sequence cho catalog_articles
CREATE SEQUENCE public.catalog_articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.catalog_articles_id_seq OWNED BY public.catalog_articles.id;
ALTER TABLE ONLY public.catalog_articles ALTER COLUMN id SET DEFAULT nextval('public.catalog_articles_id_seq'::regclass);

-- Tạo bảng categories (danh mục)
CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_vehicle_name boolean DEFAULT false,
    code character varying(50),
    thumbnail character varying(500),
    is_visible boolean DEFAULT true,
    brand character varying(100),
    slug character varying(255)
);

-- Tạo sequence cho categories
CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);

-- Tạo bảng gallery_images (hình ảnh gallery)
CREATE TABLE public.gallery_images (
    id integer NOT NULL,
    title character varying(255),
    image_path text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- Tạo sequence cho gallery_images
CREATE SEQUENCE public.gallery_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.gallery_images_id_seq OWNED BY public.gallery_images.id;
ALTER TABLE ONLY public.gallery_images ALTER COLUMN id SET DEFAULT nextval('public.gallery_images_id_seq'::regclass);

-- Tạo bảng images (quản lý hình ảnh)
CREATE TABLE public.images (
    id integer NOT NULL,
    url character varying(1000) NOT NULL,
    public_id character varying(255),
    created_at timestamp without time zone DEFAULT now()
);

-- Tạo sequence cho images
CREATE SEQUENCE public.images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;
ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);

-- Tạo bảng product_images (liên kết sản phẩm với hình ảnh)
CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer,
    image_id integer,
    sort_order integer DEFAULT 0,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);

-- Tạo sequence cho product_images
CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;
ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);

-- Tạo bảng products (sản phẩm)
CREATE TABLE public.products (
    id integer NOT NULL,
    code character varying(255),
    name character varying(255) NOT NULL,
    category_id integer,
    image text,
    description text,
    slug character varying(255) UNIQUE,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    vehicle_ids integer[] DEFAULT '{}'::integer[],
    show_on_homepage boolean DEFAULT true,
    thumbnail character varying(500),
    manufacturer_code character varying(100)
);

-- Tạo sequence cho products
CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);

-- Tạo bảng site_settings (cài đặt website)
CREATE TABLE public.site_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    type character varying(50) DEFAULT 'text'::character varying,
    description character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- Tạo sequence cho site_settings
CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;
ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);

-- Thêm primary keys
ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.catalog_articles
    ADD CONSTRAINT catalog_articles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);

-- Thêm unique constraints
ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);

ALTER TABLE ONLY public.catalog_articles
    ADD CONSTRAINT catalog_articles_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_key UNIQUE (key);

-- Thêm foreign keys
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.images(id) ON DELETE CASCADE;

-- Tạo indexes
CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);
CREATE UNIQUE INDEX idx_products_slug ON public.products USING btree (slug);
CREATE INDEX idx_products_manufacturer_code ON public.products USING btree (manufacturer_code);
CREATE INDEX idx_products_vehicle_ids ON public.products USING gin (vehicle_ids);
CREATE INDEX idx_product_images_product ON public.product_images USING btree (product_id);
CREATE INDEX idx_product_images_image ON public.product_images USING btree (image_id);

-- Chèn dữ liệu mẫu

-- Dữ liệu admin_users (1 tài khoản admin)
INSERT INTO public.admin_users (id, username, password, full_name, phone, avatar, is_admin, created_at, updated_at) VALUES 
(1, 'admin', '$2b$10$U1/jNEU7FelY8AFDbBnv0ed480uggKu8YwyJzCdupGBBCdWYHSDQ6', 'Administrator', '0382.890.990', NULL, true, now(), now());

-- Dữ liệu catalog_articles (bài viết mẫu)
INSERT INTO public.catalog_articles (id, title, slug, content, thumbnail, is_published, created_at, updated_at) VALUES 
(1, 'Giới thiệu sản phẩm SINOTRUK', 'gioi-thieu-san-pham-sinotruk', '{"content": "Bài viết giới thiệu về các sản phẩm SINOTRUK chất lượng cao"}', NULL, true, now(), now()),
(2, 'Hướng dẫn bảo dưỡng xe tải', 'huong-dan-bao-duong-xe-tai', '{"content": "Hướng dẫn chi tiết về cách bảo dưỡng xe tải SINOTRUK"}', NULL, true, now(), now());

-- Dữ liệu categories (danh mục sản phẩm)
INSERT INTO public.categories (id, name, created_at, updated_at, is_vehicle_name, code, thumbnail, is_visible, brand, slug) VALUES 
(1, 'Cabin & Thân vỏ', now(), now(), false, NULL, NULL, true, NULL, 'cabin-than-vo'),
(2, 'Động cơ', now(), now(), false, NULL, NULL, true, NULL, 'dong-co'),
(3, 'Hộp số', now(), now(), false, NULL, NULL, true, NULL, 'hop-so'),
(4, 'Hệ thống cầu', now(), now(), false, NULL, NULL, true, NULL, 'he-thong-cau'),
(5, 'Ly hợp', now(), now(), false, NULL, NULL, true, NULL, 'ly-hop'),
(6, 'Giằng treo', now(), now(), false, NULL, NULL, true, NULL, 'giang-treo'),
(7, 'Truyền động', now(), now(), false, NULL, NULL, true, NULL, 'truyen-dong'),
(8, 'Hệ thống lái', now(), now(), false, NULL, NULL, true, NULL, 'he-thong-lai'),
(9, 'Hệ thống hút xả', now(), now(), false, NULL, NULL, true, NULL, 'he-thong-hut-xa'),
(10, 'Hệ thống làm mát', now(), now(), false, NULL, NULL, true, NULL, 'he-thong-lam-mat');

-- Dữ liệu gallery_images (hình ảnh gallery mẫu)
INSERT INTO public.gallery_images (id, title, image_path, created_at, updated_at) VALUES 
(1, 'Showroom SINOTRUK', '/images/gallery/showroom-1.jpg', now(), now()),
(2, 'Kho phụ tùng', '/images/gallery/warehouse-1.jpg', now(), now()),
(3, 'Đội ngũ kỹ thuật', '/images/gallery/team-1.jpg', now(), now());

-- Dữ liệu images mẫu
INSERT INTO public.images (id, url, public_id, created_at) VALUES 
(1, 'https://res.cloudinary.com/dbschdcyq/image/upload/v1766587954/sinotruk_products/zwogslk9trmry4sazut5.jpg', NULL, now()),
(2, 'https://res.cloudinary.com/dbschdcyq/image/upload/v1766587960/sinotruk_products/jojbw8od9nwyjazplw5c.jpg', NULL, now()),
(3, 'https://res.cloudinary.com/dbschdcyq/image/upload/v1766587967/sinotruk_products/ygpdbigcuxax9mgmf5b7.jpg', NULL, now()),
(4, 'https://res.cloudinary.com/dbschdcyq/image/upload/v1766953968/sinotruk_products/h8itrokzpvuoftbvwfo0.jpg', NULL, now()),
(5, 'https://res.cloudinary.com/dbschdcyq/image/upload/v1767394995/sinotruk_products/mf5dzexa38rs8rdmyypf.jpg', NULL, now());

-- Dữ liệu products mẫu
INSERT INTO public.products (id, code, name, category_id, image, description, slug, created_at, updated_at, vehicle_ids, show_on_homepage, thumbnail, manufacturer_code) VALUES 
(1, 'SP001', 'Cabin xe tải HOWO', 1, NULL, 'Cabin xe tải HOWO chất lượng cao, phù hợp cho các dòng xe tải hạng nặng', 'cabin-xe-tai-howo', now(), now(), '{}', false, NULL, 'HOWO-CAB-001'),
(2, 'SP002', 'Động cơ Weichai WP10', 2, NULL, 'Động cơ Weichai WP10 công suất 336HP, tiết kiệm nhiên liệu', 'dong-co-weichai-wp10', now(), now(), '{}', true, NULL, 'WC-WP10-336'),
(3, 'SP003', 'Hộp số Fast Gear 12JS160T', 3, NULL, 'Hộp số Fast Gear 12 cấp, truyền lực mạnh mẽ', 'hop-so-fast-gear-12js160t', now(), now(), '{}', false, NULL, 'FG-12JS160T'),
(4, 'SP004', 'Cầu sau HANDE 13T', 4, NULL, 'Cầu sau HANDE tải trọng 13 tấn, độ bền cao', 'cau-sau-hande-13t', now(), now(), '{}', true, NULL, 'HD-REAR-13T'),
(5, 'SP005', 'Ly hợp SACHS 430mm', 5, NULL, 'Ly hợp SACHS đường kính 430mm, chất lượng Đức', 'ly-hop-sachs-430mm', now(), now(), '{}', false, NULL, 'SACHS-430');

-- Dữ liệu product_images mẫu (liên kết sản phẩm với hình ảnh)
INSERT INTO public.product_images (id, product_id, image_id, sort_order, is_primary, created_at) VALUES 
(1, 1, 1, 0, true, now()),
(2, 2, 2, 0, true, now()),
(3, 3, 3, 0, true, now()),
(4, 4, 4, 0, true, now()),
(5, 5, 5, 0, true, now());

-- Dữ liệu site_settings (cài đặt website mẫu)
INSERT INTO public.site_settings (id, key, value, type, description, created_at, updated_at) VALUES 
(1, 'site_name', 'SINOTRUK Vietnam', 'text', 'Tên website', now(), now()),
(2, 'site_description', 'Phụ tùng xe tải SINOTRUK chính hãng', 'text', 'Mô tả website', now(), now()),
(3, 'contact_phone', '0382.890.990', 'text', 'Số điện thoại liên hệ', now(), now()),
(4, 'contact_email', 'info@sinotruk.vn', 'email', 'Email liên hệ', now(), now()),
(5, 'show_homepage_products', 'true', 'boolean', 'Hiển thị sản phẩm trên trang chủ', now(), now()),
(6, 'site_logo', '', 'text', 'Logo website', now(), now());

-- Cập nhật sequences
SELECT setval('public.admin_users_id_seq', (SELECT MAX(id) FROM public.admin_users));
SELECT setval('public.catalog_articles_id_seq', (SELECT MAX(id) FROM public.catalog_articles));
SELECT setval('public.categories_id_seq', (SELECT MAX(id) FROM public.categories));
SELECT setval('public.gallery_images_id_seq', (SELECT MAX(id) FROM public.gallery_images));
SELECT setval('public.images_id_seq', (SELECT MAX(id) FROM public.images));
SELECT setval('public.product_images_id_seq', (SELECT MAX(id) FROM public.product_images));
SELECT setval('public.products_id_seq', (SELECT MAX(id) FROM public.products));
SELECT setval('public.site_settings_id_seq', (SELECT MAX(id) FROM public.site_settings));

-- Tạo functions cập nhật timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo triggers tự động cập nhật updated_at
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON public.admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_articles_updated_at 
    BEFORE UPDATE ON public.catalog_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at 
    BEFORE UPDATE ON public.gallery_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON public.site_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Hoàn thành
COMMIT;
