const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Load environment variables
require('dotenv').config();

const app = express();

// Configuration from environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default

// Database connection
if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not found in environment variables. Using default for development.');
    console.warn('   Please create .env file in deploy/server/ directory.');
    console.warn('   Copy from: env.development.template');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('   Check your DATABASE_URL in .env file');
        console.error('   Expected format: postgresql://user:password@host:port/database');
    } else {
        console.log('✅ Database connected successfully');
        release();
    }
});

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, UPLOAD_DIR, 'original');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// Helper: Get site settings from database
async function getSiteSettings() {
    try {
        const { rows } = await pool.query('SELECT key, value FROM site_settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        return settings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {};
    }
}

// API: Upload image (supports both multipart/form-data and JSON base64)
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        // Handle multipart/form-data upload
        if (req.file) {
            const fileUrl = `/uploads/original/${req.file.filename}`;
            return res.json({
                success: true,
                url: fileUrl,
                filename: req.file.filename
            });
        }

        // Handle JSON base64 upload
        if (req.body && req.body.image) {
            const base64Data = req.body.image;
            const fileName = req.body.fileName || Date.now().toString();

            // Extract base64 data
            const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches) {
                return res.status(400).json({ error: 'Invalid base64 image format' });
            }

            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;

            const uploadDir = path.join(__dirname, './uploads/original');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, uniqueName);
            fs.writeFileSync(filePath, buffer);

            const fileUrl = `/uploads/original/${uniqueName}`;
            return res.json({
                success: true,
                url: fileUrl,
                filename: uniqueName
            });
        }

        return res.status(400).json({ error: 'No file uploaded' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// POST /api/images - Save image record to database
app.post('/api/images', async (req, res) => {
    try {
        const { url, public_id } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO images (url, public_id, created_at) VALUES ($1, $2, NOW()) RETURNING *`,
            [url, public_id || null]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error saving image:', error);
        res.status(500).json({ error: 'Failed to save image' });
    }
});

// GET /api/images - Get all images
app.get('/api/images', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM images ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// DELETE /api/images/:id - Delete image
app.delete('/api/images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM images WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Image not found' });
        res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// API: Get image (with optional watermark)
app.get('/api/image', async (req, res) => {
    const { path: imagePath, url: externalUrl, watermark } = req.query;
    const applyWatermark = watermark === 'true';

    // Handle external URL proxy (for Cloudinary, etc.)
    if (externalUrl) {
        try {
            const response = await fetch(externalUrl);
            if (!response.ok) {
                return res.status(response.status).send('Failed to fetch external image');
            }
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            const buffer = Buffer.from(await response.arrayBuffer());

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(buffer);
        } catch (error) {
            console.error('Error proxying external URL:', error);
            return res.status(500).send('Failed to proxy image');
        }
    }

    if (!imagePath) {
        return res.status(400).send('Image path is required');
    }

    try {
        // Check for cached watermarked version
        const baseName = path.basename(imagePath);
        const watermarkedPath = path.join(__dirname, './uploads/watermarked', `wm_${baseName}`);
        const originalPath = path.join(__dirname, './uploads/original', baseName);

        if (applyWatermark && fs.existsSync(watermarkedPath)) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
            return res.sendFile(watermarkedPath);
        }

        if (!fs.existsSync(originalPath)) {
            return res.status(404).send('Image not found');
        }

        // No watermark needed
        if (!applyWatermark) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(originalPath);
        }

        // Apply watermark
        const settings = await getSiteSettings();
        const isEnabled = settings.watermark_enabled !== 'false';
        const logoUrl = settings.company_logo || '';

        let finalBuffer = fs.readFileSync(originalPath);

        if (isEnabled && logoUrl) {
            const metadata = await sharp(finalBuffer).metadata();
            const width = metadata.width || 800;
            const height = metadata.height || 600;

            try {
                // Fetch logo (could be external URL or local path)
                let logoBuffer;
                if (logoUrl.startsWith('http')) {
                    const response = await fetch(logoUrl);
                    logoBuffer = Buffer.from(await response.arrayBuffer());
                } else {
                    const logoPath = path.join(__dirname, '..', logoUrl);
                    if (fs.existsSync(logoPath)) {
                        logoBuffer = fs.readFileSync(logoPath);
                    }
                }

                if (logoBuffer) {
                    const logoSize = Math.floor(Math.min(width, height) * 0.15);
                    const fixedOpacity = 0.30;

                    const resizedLogo = await sharp(logoBuffer)
                        .resize(logoSize, logoSize, { fit: 'inside' })
                        .ensureAlpha()
                        .composite([{
                            input: Buffer.from([255, 255, 255, Math.floor(255 * fixedOpacity)]),
                            raw: { width: 1, height: 1, channels: 4 },
                            tile: true,
                            blend: 'dest-in'
                        }])
                        .png()
                        .toBuffer();

                    const rotatedLogo = await sharp(resizedLogo)
                        .rotate(-45, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .png()
                        .toBuffer();

                    const rotatedMeta = await sharp(rotatedLogo).metadata();
                    const rotatedW = rotatedMeta.width || logoSize;
                    const rotatedH = rotatedMeta.height || logoSize;

                    const composites = [];
                    const gridSize = 5;
                    const spacingX = width / gridSize;
                    const spacingY = height / gridSize;

                    for (let row = 0; row < gridSize; row++) {
                        for (let col = 0; col < gridSize; col++) {
                            const x = Math.floor(col * spacingX + (spacingX - rotatedW) / 2);
                            const y = Math.floor(row * spacingY + (spacingY - rotatedH) / 2);
                            composites.push({
                                input: rotatedLogo,
                                top: Math.max(0, y),
                                left: Math.max(0, x),
                            });
                        }
                    }

                    finalBuffer = await sharp(finalBuffer)
                        .composite(composites)
                        .jpeg({ quality: 90 })
                        .toBuffer();
                }
            } catch (logoError) {
                console.error('Watermark error:', logoError);
            }
        }

        // Cache the watermarked image
        const watermarkDir = path.join(__dirname, './uploads/watermarked');
        if (!fs.existsSync(watermarkDir)) {
            fs.mkdirSync(watermarkDir, { recursive: true });
        }
        fs.writeFileSync(watermarkedPath, finalBuffer);

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
        res.send(finalBuffer);

    } catch (error) {
        console.error('Image API error:', error);
        res.status(500).send('Internal server error');
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Function to generate slug from product name
function generateSlug(name) {
    if (!name) return '';
    
    return name
        .toLowerCase()
        .trim()
        // Replace Vietnamese characters
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
        .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
        .replace(/đ/g, 'd')
        // Replace special characters with hyphens
        .replace(/[^a-z0-9]+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
        // Replace multiple hyphens with single hyphen
        .replace(/-+/g, '-');
}

// Function to ensure unique slug
async function ensureUniqueSlug(baseSlug, productId = null) {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
        let query = 'SELECT id FROM products WHERE slug = $1';
        let params = [slug];
        
        // If updating existing product, exclude current product from check
        if (productId) {
            query += ' AND id != $2';
            params.push(productId);
        }
        
        const { rows } = await pool.query(query, params);
        
        if (rows.length === 0) {
            return slug; // Slug is unique
        }
        
        // Generate new slug with counter
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

// ============================================
// DATABASE API ROUTES (Replace Supabase calls)
// ============================================

// GET /api/products - Get products with optional filters
app.get('/api/products', async (req, res) => {
    try {
        const { limit = 50, category_id, category, show_on_homepage, search, manufacturer_code, slug } = req.query;

        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        // Handle category filtering by ID or slug
        if (category_id) {
            query += ` AND category_id = $${paramIndex++}`;
            params.push(category_id);
        } else if (category) {
            // First try to find category by slug, then by ID (if numeric)
            let categoryQuery = 'SELECT id, is_vehicle_name FROM categories WHERE slug = $1';
            let categoryParams = [category];
            
            // If category is numeric, also check by ID
            if (!isNaN(category)) {
                categoryQuery = 'SELECT id, is_vehicle_name FROM categories WHERE slug = $1 OR id = $2';
                categoryParams = [category, parseInt(category)];
            }
            
            const { rows: categoryRows } = await pool.query(categoryQuery, categoryParams);
            
            if (categoryRows.length > 0) {
                const cat = categoryRows[0];
                if (cat.is_vehicle_name) {
                    // For vehicle categories, filter by vehicle_ids array (PostgreSQL array contains)
                    query += ` AND $${paramIndex++} = ANY(vehicle_ids)`;
                    params.push(cat.id);
                } else {
                    // For regular categories, filter by category_id
                    query += ` AND category_id = $${paramIndex++}`;
                    params.push(cat.id);
                }
            }
        }

        if (show_on_homepage === 'true') {
            query += ' AND show_on_homepage = true';
        }

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex} OR manufacturer_code ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (manufacturer_code) {
            query += ` AND manufacturer_code ILIKE $${paramIndex++}`;
            params.push(`%${manufacturer_code}%`);
        }

        if (slug) {
            query += ` AND slug = $${paramIndex++}`;
            params.push(slug);
        }

        query += ' ORDER BY created_at DESC';
        query += ` LIMIT $${paramIndex}`;
        params.push(parseInt(limit));

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:identifier - Get single product by ID or slug
app.get('/api/products/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Try to find by slug first, then by ID if it's numeric
        let query = 'SELECT * FROM products WHERE slug = $1';
        let params = [identifier];
        
        // If identifier is numeric, also try to find by ID
        if (!isNaN(identifier)) {
            query = 'SELECT * FROM products WHERE slug = $1 OR id = $2';
            params = [identifier, parseInt(identifier)];
        }
        
        const { rows } = await pool.query(query, params);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST /api/products - Create new product
app.post('/api/products', async (req, res) => {
    try {
        const {
            code, name, category_id, image, description,
            vehicle_ids, show_on_homepage, thumbnail, manufacturer_code
        } = req.body;

        // Generate unique slug from product name
        const baseSlug = generateSlug(name);
        const slug = await ensureUniqueSlug(baseSlug);

        const { rows } = await pool.query(
            `INSERT INTO products (code, name, category_id, image, description, slug, vehicle_ids, show_on_homepage, thumbnail, manufacturer_code, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
             RETURNING *`,
            [code, name, category_id, image, description, slug, vehicle_ids || [], show_on_homepage || true, thumbnail, manufacturer_code]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code, name, category_id, image, description,
            vehicle_ids, show_on_homepage, thumbnail, manufacturer_code
        } = req.body;

        // If name is being updated, generate new slug
        let slug = undefined;
        if (name) {
            const baseSlug = generateSlug(name);
            slug = await ensureUniqueSlug(baseSlug, id);
        }

        const { rows } = await pool.query(
            `UPDATE products SET
                code = COALESCE($1, code),
                name = COALESCE($2, name),
                category_id = COALESCE($3, category_id),
                image = COALESCE($4, image),
                description = COALESCE($5, description),
                slug = COALESCE($6, slug),
                vehicle_ids = COALESCE($7, vehicle_ids),
                show_on_homepage = COALESCE($8, show_on_homepage),
                thumbnail = COALESCE($9, thumbnail),
                manufacturer_code = COALESCE($10, manufacturer_code),
                updated_at = NOW()
             WHERE id = $11
             RETURNING *`,
            [code, name, category_id, image, description, slug, vehicle_ids, show_on_homepage, thumbnail, manufacturer_code, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// GET /api/categories - Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const { is_visible, is_vehicle_name, slug } = req.query;

        let query = 'SELECT * FROM categories WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (is_visible === 'true') {
            query += ' AND is_visible = true';
        }

        if (is_vehicle_name !== undefined) {
            query += ` AND is_vehicle_name = $${paramIndex++}`;
            params.push(is_vehicle_name === 'true');
        }

        // Add slug filter support
        if (slug) {
            query += ` AND slug = $${paramIndex++}`;
            params.push(slug);
        }

        query += ' ORDER BY name';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/categories/:id - Get single category
app.get('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// POST /api/categories - Create category
app.post('/api/categories', async (req, res) => {
    try {
        const { name, code, thumbnail, is_visible, is_vehicle_name, brand } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO categories (name, code, thumbnail, is_visible, is_vehicle_name, brand, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
            [name, code, thumbnail, is_visible ?? true, is_vehicle_name ?? false, brand]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/categories/:id - Update category
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, thumbnail, is_visible, is_vehicle_name, brand } = req.body;
        const { rows } = await pool.query(
            `UPDATE categories SET name = COALESCE($1, name), code = COALESCE($2, code), 
             thumbnail = COALESCE($3, thumbnail), is_visible = COALESCE($4, is_visible),
             is_vehicle_name = COALESCE($5, is_vehicle_name), brand = COALESCE($6, brand), updated_at = NOW()
             WHERE id = $7 RETURNING *`,
            [name, code, thumbnail, is_visible, is_vehicle_name, brand, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id - Delete category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First, check how many products belong to this category
        const { rows: productCheck } = await pool.query(
            'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
            [id]
        );
        const productCount = parseInt(productCheck[0].count);
        
        // Set category_id to NULL for all products in this category
        if (productCount > 0) {
            await pool.query(
                'UPDATE products SET category_id = NULL WHERE category_id = $1',
                [id]
            );
        }
        
        // Now delete the category
        const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Category not found' });
        
        res.json({ 
            success: true, 
            message: 'Category deleted',
            productsAffected: productCount 
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// GET /api/site-settings - Get all site settings
app.get('/api/site-settings', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM site_settings ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ error: 'Failed to fetch site settings' });
    }
});

// PUT /api/site-settings - Update site settings  
app.put('/api/site-settings', async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            await pool.query(
                `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW())
                 ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
                [key, value]
            );
        }
        const settings = await getSiteSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ error: 'Failed to update site settings' });
    }
});


// GET /api/catalog-articles - Get catalog articles with search and pagination
app.get('/api/catalog-articles', async (req, res) => {
    try {
        const { 
            is_published, 
            limit = 20, 
            offset = 0, 
            search = '',
            page 
        } = req.query;
        
        // Calculate offset from page if provided
        const actualOffset = page ? (parseInt(page) - 1) * parseInt(limit) : parseInt(offset);
        
        // Build WHERE conditions
        const whereConditions = [];
        const params = [];
        let paramIndex = 1;

        // Published filter
        if (is_published !== undefined) {
            whereConditions.push(`is_published = $${paramIndex}`);
            params.push(is_published === 'true');
            paramIndex++;
        }

        // Search filter (title and content)
        if (search && search.trim()) {
            whereConditions.push(`(title ILIKE $${paramIndex} OR content::text ILIKE $${paramIndex})`);
            params.push(`%${search.trim()}%`);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '';

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM catalog_articles${whereClause}`;
        const { rows: countRows } = await pool.query(countQuery, params);
        const total = parseInt(countRows[0].total);

        // Get data with pagination
        const dataQuery = `SELECT * FROM catalog_articles${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        const dataParams = [...params, parseInt(limit), actualOffset];
        const { rows } = await pool.query(dataQuery, dataParams);
        
        // Return paginated response
        res.json({
            data: rows,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: actualOffset,
                page: page ? parseInt(page) : Math.floor(actualOffset / parseInt(limit)) + 1,
                totalPages: Math.ceil(total / parseInt(limit)),
                hasNext: actualOffset + parseInt(limit) < total,
                hasPrev: actualOffset > 0
            },
            search: search || ''
        });
    } catch (error) {
        console.error('Error fetching catalog articles:', error);
        res.status(500).json({ error: 'Failed to fetch catalog articles' });
    }
});

// GET /api/catalog-articles/:slug - Get article by slug
app.get('/api/catalog-articles/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { rows } = await pool.query(
            'SELECT * FROM catalog_articles WHERE slug = $1 AND is_published = true',
            [slug]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// POST /api/catalog-articles - Create article
app.post('/api/catalog-articles', async (req, res) => {
    try {
        const { title, slug, content, thumbnail, is_published } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO catalog_articles (title, slug, content, thumbnail, is_published, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
            [title, slug, content, thumbnail, is_published ?? true]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Failed to create article' });
    }
});

// PUT /api/catalog-articles/:id - Update article
app.put('/api/catalog-articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, content, thumbnail, is_published } = req.body;
        const { rows } = await pool.query(
            `UPDATE catalog_articles SET title = COALESCE($1, title), slug = COALESCE($2, slug),
             content = COALESCE($3, content), thumbnail = COALESCE($4, thumbnail),
             is_published = COALESCE($5, is_published), updated_at = NOW()
             WHERE id = $6 RETURNING *`,
            [title, slug, content, thumbnail, is_published, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Article not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'Failed to update article' });
    }
});

// DELETE /api/catalog-articles/:id - Delete article
app.delete('/api/catalog-articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM catalog_articles WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Article not found' });
        res.json({ success: true, message: 'Article deleted' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

// GET /api/gallery-images - Get gallery images with pagination
app.get('/api/gallery-images', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const countResult = await pool.query('SELECT COUNT(*) FROM gallery_images');
        const totalCount = parseInt(countResult.rows[0].count);

        const { rows } = await pool.query(
            'SELECT * FROM gallery_images ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [parseInt(limit), offset]
        );

        res.json({
            data: rows,
            count: totalCount,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit))
        });
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({ error: 'Failed to fetch gallery images' });
    }
});

// POST /api/gallery-images - Add image to gallery
app.post('/api/gallery-images', async (req, res) => {
    try {
        const { title, image_path } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO gallery_images (title, image_path, created_at) VALUES ($1, $2, NOW()) RETURNING *`,
            [title || 'Untitled', image_path]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error adding gallery image:', error);
        res.status(500).json({ error: 'Failed to add gallery image' });
    }
});

// DELETE /api/gallery-images/:id - Delete gallery image
app.delete('/api/gallery-images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM gallery_images WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Image not found' });
        res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        res.status(500).json({ error: 'Failed to delete gallery image' });
    }
});

// GET /api/product-images/:productId - Get images for a product
app.get('/api/product-images/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { rows } = await pool.query(`
            SELECT pi.id, pi.product_id, pi.image_id, pi.sort_order, pi.is_primary, pi.created_at,
                   json_build_object('id', i.id, 'url', i.url, 'public_id', i.public_id, 'created_at', i.created_at) as image
            FROM product_images pi 
            LEFT JOIN images i ON pi.image_id = i.id 
            WHERE pi.product_id = $1 
            ORDER BY pi.sort_order
        `, [productId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching product images:', error);
        res.status(500).json({ error: 'Failed to fetch product images' });
    }
});

// POST /api/product-images - Link image to product
app.post('/api/product-images', async (req, res) => {
    try {
        const { product_id, image_id, sort_order, is_primary } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO product_images (product_id, image_id, sort_order, is_primary, created_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [product_id, image_id, sort_order || 0, is_primary || false]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error linking image to product:', error);
        res.status(500).json({ error: 'Failed to link image to product' });
    }
});

// DELETE /api/product-images/:id - Remove image link from product
app.delete('/api/product-images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM product_images WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Link not found' });
        res.json({ success: true, message: 'Image unlinked from product' });
    } catch (error) {
        console.error('Error unlinking image:', error);
        res.status(500).json({ error: 'Failed to unlink image' });
    }
});

// DELETE /api/product-images/:productId/:imageId - Remove image link from product by productId and imageId
app.delete('/api/product-images/:productId/:imageId', async (req, res) => {
    try {
        const { productId, imageId } = req.params;
        const { rowCount } = await pool.query(
            'DELETE FROM product_images WHERE product_id = $1 AND image_id = $2',
            [productId, imageId]
        );
        if (rowCount === 0) return res.status(404).json({ error: 'Link not found' });
        res.json({ success: true, message: 'Image unlinked from product' });
    } catch (error) {
        console.error('Error unlinking image:', error);
        res.status(500).json({ error: 'Failed to unlink image' });
    }
});

// PUT /api/product-images/:productId/:imageId/order - Update image sort order
app.put('/api/product-images/:productId/:imageId/order', async (req, res) => {
    try {
        const { productId, imageId } = req.params;
        const { sort_order } = req.body;
        
        const { rows } = await pool.query(
            'UPDATE product_images SET sort_order = $1 WHERE product_id = $2 AND image_id = $3 RETURNING *',
            [sort_order, productId, imageId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product image link not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating image order:', error);
        res.status(500).json({ error: 'Failed to update image order' });
    }
});

// PUT /api/product-images/:productId/:imageId/primary - Set image as primary
app.put('/api/product-images/:productId/:imageId/primary', async (req, res) => {
    try {
        const { productId, imageId } = req.params;
        
        // First, set all images for this product to not primary
        await pool.query(
            'UPDATE product_images SET is_primary = false WHERE product_id = $1',
            [productId]
        );
        
        // Then set the specified image as primary
        const { rows } = await pool.query(
            'UPDATE product_images SET is_primary = true WHERE product_id = $1 AND image_id = $2 RETURNING *',
            [productId, imageId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product image link not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error setting primary image:', error);
        res.status(500).json({ error: 'Failed to set primary image' });
    }
});

// POST /api/admin/login - Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Get user with password hash
        const { rows } = await pool.query(
            'SELECT id, username, password, full_name, avatar, is_admin FROM admin_users WHERE username = $1',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        
        // Compare password with hash
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Don't send password hash to client
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/admin/profile/:userId - Get admin profile
app.get('/api/admin/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { rows } = await pool.query(
            'SELECT id, username, full_name, phone, avatar, is_admin FROM admin_users WHERE id = $1',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/admin/profile/:userId - Update admin profile
app.put('/api/admin/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { full_name, username, password, avatar } = req.body;

        let query = 'UPDATE admin_users SET ';
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (full_name) {
            updates.push(`full_name = $${paramIndex++}`);
            params.push(full_name);
        }
        if (username) {
            updates.push(`username = $${paramIndex++}`);
            params.push(username);
        }
        if (password) {
            // Hash password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${paramIndex++}`);
            params.push(hashedPassword);
        }
        if (avatar !== undefined) {
            updates.push(`avatar = $${paramIndex++}`);
            params.push(avatar);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        query += updates.join(', ');
        query += ` WHERE id = $${paramIndex} RETURNING id, username, full_name, avatar`;
        params.push(userId);

        const { rows } = await pool.query(query, params);
        res.json(rows[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST /api/upload-avatar - Upload avatar image
app.post('/api/upload-avatar', async (req, res) => {
    try {
        const { image, userId } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Handle base64 upload
        const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ error: 'Invalid image format' });
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const uniqueName = `avatar-${Date.now()}.${ext}`;

        const uploadDir = path.join(__dirname, './uploads/avatars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(filePath, buffer);

        const avatarUrl = `/uploads/avatars/${uniqueName}`;

        // Update user avatar if userId provided
        if (userId) {
            await pool.query('UPDATE admin_users SET avatar = $1 WHERE id = $2', [avatarUrl, userId]);
        }

        res.json({ success: true, url: avatarUrl });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
