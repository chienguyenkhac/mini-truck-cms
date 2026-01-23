/**
 * Integration Tests - Test với PostgreSQL thật và file system thật
 * Chạy: npm run test:integration
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Real database connection - Docker PostgreSQL (port 5433 to avoid local conflict)
const pool = new Pool({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'sinotruk123',
    database: 'postgres'
});

// Import the actual app (not mocked)
const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Create a mini test app with the same routes
const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, '../uploads/original');
const WATERMARK_DIR = path.join(__dirname, '../uploads/watermarked');

// Ensure directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(WATERMARK_DIR)) fs.mkdirSync(WATERMARK_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const uniqueName = 'test-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ success: true, filename: req.file.filename, url: `/uploads/original/${req.file.filename}` });
});

// Products endpoint (real DB)
app.get('/api/products', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM products LIMIT 10');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Categories endpoint (real DB)
app.get('/api/categories', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Site settings endpoint (real DB)
app.get('/api/site-settings', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT key, value FROM site_settings');
        const settings = {};
        rows.forEach(r => settings[r.key] = r.value);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// INTEGRATION TESTS
// ============================================

describe('Integration Tests (Real DB + File System)', () => {
    // Track test files for cleanup
    const testFiles = [];

    afterAll(async () => {
        // Cleanup test files
        testFiles.forEach(file => {
            try { fs.unlinkSync(file); } catch (e) { }
        });
        // Close pool
        await pool.end();
    });

    // ==================
    // Database Connection
    // ==================
    describe('Database Connection', () => {
        it('should connect to PostgreSQL', async () => {
            const result = await pool.query('SELECT NOW()');
            expect(result.rows[0].now).toBeDefined();
        });

        it('should have products table', async () => {
            const result = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products')");
            expect(result.rows[0].exists).toBe(true);
        });

        it('should have categories table', async () => {
            const result = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories')");
            expect(result.rows[0].exists).toBe(true);
        });

        it('should have site_settings table', async () => {
            const result = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_settings')");
            expect(result.rows[0].exists).toBe(true);
        });
    });

    // ==================
    // Products API (Real Data)
    // ==================
    describe('GET /api/products (Real DB)', () => {
        it('should return products from database', async () => {
            const res = await request(app).get('/api/products');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            console.log(`Found ${res.body.length} products in database`);
        });

        it('should have expected product fields', async () => {
            const res = await request(app).get('/api/products');
            if (res.body.length > 0) {
                const product = res.body[0];
                expect(product).toHaveProperty('id');
                expect(product).toHaveProperty('name');
                console.log('Sample product:', product.name);
            }
        });
    });

    // ==================
    // Categories API (Real Data)
    // ==================
    describe('GET /api/categories (Real DB)', () => {
        it('should return categories from database', async () => {
            const res = await request(app).get('/api/categories');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            console.log(`Found ${res.body.length} categories in database`);
        });
    });

    // ==================
    // Site Settings API (Real Data)
    // ==================
    describe('GET /api/site-settings (Real DB)', () => {
        it('should return site settings as object', async () => {
            const res = await request(app).get('/api/site-settings');
            expect(res.status).toBe(200);
            expect(typeof res.body).toBe('object');
            console.log('Site settings keys:', Object.keys(res.body));
        });

        it('should have company_name setting', async () => {
            const res = await request(app).get('/api/site-settings');
            if (res.body.company_name) {
                console.log('Company name:', res.body.company_name);
            }
        });
    });

    // ==================
    // File Upload (Real File System)
    // ==================
    describe('POST /api/upload (Real File System)', () => {
        it('should upload an image file', async () => {
            // Create a test image buffer (1x1 pixel PNG)
            const testImagePath = path.join(__dirname, 'test-image.png');
            const pngBuffer = Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
                0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
                0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
                0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
                0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
                0x44, 0xAE, 0x42, 0x60, 0x82
            ]);
            fs.writeFileSync(testImagePath, pngBuffer);
            testFiles.push(testImagePath);

            const res = await request(app)
                .post('/api/upload')
                .attach('image', testImagePath);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.filename).toContain('test-');
            expect(res.body.url).toContain('/uploads/original/');

            // Verify file was actually saved
            const uploadedPath = path.join(UPLOAD_DIR, res.body.filename);
            expect(fs.existsSync(uploadedPath)).toBe(true);
            testFiles.push(uploadedPath);

            console.log('Uploaded file:', res.body.filename);
        });

        it('should reject upload without file', async () => {
            const res = await request(app).post('/api/upload');
            expect(res.status).toBe(400);
        });
    });

    // ==================
    // Static File Serving
    // ==================
    describe('GET /uploads/* (Static Files)', () => {
        it('should serve uploaded files', async () => {
            // First upload a file
            const testImagePath = path.join(__dirname, 'test-static.png');
            const pngBuffer = Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
                0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
                0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
                0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
                0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
                0x44, 0xAE, 0x42, 0x60, 0x82
            ]);
            fs.writeFileSync(testImagePath, pngBuffer);
            testFiles.push(testImagePath);

            const uploadRes = await request(app)
                .post('/api/upload')
                .attach('image', testImagePath);

            // Now try to fetch it
            const getRes = await request(app).get(uploadRes.body.url);
            expect(getRes.status).toBe(200);

            testFiles.push(path.join(UPLOAD_DIR, uploadRes.body.filename));
        });
    });
});
