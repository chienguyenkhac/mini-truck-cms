const request = require('supertest');

// Mock pg Pool
jest.mock('pg', () => {
    const mockPool = {
        query: jest.fn()
    };
    return { Pool: jest.fn(() => mockPool) };
});

// Mock fs
jest.mock('fs', () => ({
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn(() => Buffer.from('test image')),
    writeFileSync: jest.fn()
}));

// Mock sharp
jest.mock('sharp', () => {
    return jest.fn(() => ({
        metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 }),
        resize: jest.fn().mockReturnThis(),
        ensureAlpha: jest.fn().mockReturnThis(),
        composite: jest.fn().mockReturnThis(),
        rotate: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed image'))
    }));
});

const { Pool } = require('pg');
const app = require('./index');

describe('API Endpoints', () => {
    let mockPool;

    beforeEach(() => {
        mockPool = new Pool();
        jest.clearAllMocks();
    });

    // ==================
    // Health Check
    // ==================
    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.timestamp).toBeDefined();
        });
    });

    // ==================
    // Products API
    // ==================
    describe('GET /api/products', () => {
        it('should return list of products', async () => {
            const mockProducts = [
                { id: 1, name: 'Product 1', price: 1000 },
                { id: 2, name: 'Product 2', price: 2000 }
            ];
            mockPool.query.mockResolvedValue({ rows: mockProducts });

            const res = await request(app).get('/api/products');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockProducts);
        });

        it('should filter by show_on_homepage', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await request(app).get('/api/products?show_on_homepage=true');

            const query = mockPool.query.mock.calls[0][0];
            expect(query).toContain('show_on_homepage = true');
        });

        it('should filter by search term', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await request(app).get('/api/products?search=test');

            const query = mockPool.query.mock.calls[0][0];
            expect(query).toContain('ILIKE');
        });

        it('should handle database errors', async () => {
            mockPool.query.mockRejectedValue(new Error('DB Error'));

            const res = await request(app).get('/api/products');
            expect(res.status).toBe(500);
            expect(res.body.error).toBeDefined();
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return single product', async () => {
            const mockProduct = { id: 1, name: 'Product 1' };
            mockPool.query.mockResolvedValue({ rows: [mockProduct] });

            const res = await request(app).get('/api/products/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockProduct);
        });

        it('should return 404 for non-existent product', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            const res = await request(app).get('/api/products/999');
            expect(res.status).toBe(404);
        });
    });

    // ==================
    // Categories API
    // ==================
    describe('GET /api/categories', () => {
        it('should return list of categories', async () => {
            const mockCategories = [
                { id: 1, name: 'Category 1' },
                { id: 2, name: 'Category 2' }
            ];
            mockPool.query.mockResolvedValue({ rows: mockCategories });

            const res = await request(app).get('/api/categories');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockCategories);
        });

        it('should filter by is_visible', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await request(app).get('/api/categories?is_visible=true');

            const query = mockPool.query.mock.calls[0][0];
            expect(query).toContain('is_visible = true');
        });
    });

    // ==================
    // Site Settings API
    // ==================
    describe('GET /api/site-settings', () => {
        it('should return site settings as object', async () => {
            const mockSettings = [
                { key: 'company_name', value: 'Sinotruk' },
                { key: 'company_logo', value: 'logo.png' }
            ];
            mockPool.query.mockResolvedValue({ rows: mockSettings });

            const res = await request(app).get('/api/site-settings');
            expect(res.status).toBe(200);
            expect(res.body.company_name).toBe('Sinotruk');
            expect(res.body.company_logo).toBe('logo.png');
        });
    });

    // ==================
    // Catalog Articles API
    // ==================
    describe('GET /api/catalog-articles', () => {
        it('should return published articles', async () => {
            const mockArticles = [
                { id: 1, title: 'Article 1', is_published: true }
            ];
            mockPool.query.mockResolvedValue({ rows: mockArticles });

            const res = await request(app).get('/api/catalog-articles');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockArticles);
        });
    });

    describe('GET /api/catalog-articles/:slug', () => {
        it('should return article by slug', async () => {
            const mockArticle = { id: 1, title: 'Article 1', slug: 'article-1' };
            mockPool.query.mockResolvedValue({ rows: [mockArticle] });

            const res = await request(app).get('/api/catalog-articles/article-1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockArticle);
        });

        it('should return 404 for non-existent article', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            const res = await request(app).get('/api/catalog-articles/not-found');
            expect(res.status).toBe(404);
        });
    });

    // ==================
    // Gallery Images API
    // ==================
    describe('GET /api/gallery-images', () => {
        it('should return paginated gallery images', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ count: '50' }] })
                .mockResolvedValueOnce({ rows: [{ id: 1, url: 'image.jpg' }] });

            const res = await request(app).get('/api/gallery-images?page=1&limit=20');
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
            expect(res.body.count).toBe(50);
            expect(res.body.totalPages).toBe(3);
        });
    });

    // ==================
    // Admin Login API
    // ==================
    describe('POST /api/admin/login', () => {
        it('should login with valid credentials', async () => {
            const mockUser = { id: 1, username: 'admin', full_name: 'Admin' };
            mockPool.query.mockResolvedValue({ rows: [mockUser] });

            const res = await request(app)
                .post('/api/admin/login')
                .send({ username: 'admin', password: 'password' });

            expect(res.status).toBe(200);
            expect(res.body.username).toBe('admin');
        });

        it('should reject invalid credentials', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .post('/api/admin/login')
                .send({ username: 'wrong', password: 'wrong' });

            expect(res.status).toBe(401);
        });
    });

    // ==================
    // Admin Profile API
    // ==================
    describe('GET /api/admin/profile/:userId', () => {
        it('should return admin profile', async () => {
            const mockProfile = { id: 1, username: 'admin', full_name: 'Admin User' };
            mockPool.query.mockResolvedValue({ rows: [mockProfile] });

            const res = await request(app).get('/api/admin/profile/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockProfile);
        });
    });

    describe('PUT /api/admin/profile/:userId', () => {
        it('should update admin profile', async () => {
            const updatedProfile = { id: 1, username: 'newname', full_name: 'New Name' };
            mockPool.query.mockResolvedValue({ rows: [updatedProfile] });

            const res = await request(app)
                .put('/api/admin/profile/1')
                .send({ full_name: 'New Name', username: 'newname' });

            expect(res.status).toBe(200);
            expect(res.body.full_name).toBe('New Name');
        });

        it('should reject empty update', async () => {
            const res = await request(app)
                .put('/api/admin/profile/1')
                .send({});

            expect(res.status).toBe(400);
        });
    });
});
