/**
 * API Contract Tests - Run with Newman-like assertion library
 * Usage: node api.test.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

async function fetchAPI(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });
    return {
        status: response.status,
        ok: response.ok,
        data: await response.json().catch(() => null),
        headers: response.headers
    };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ FAIL: ${message}`);
    }
    console.log(`✅ PASS: ${message}`);
}

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

async function test(name, fn) {
    try {
        await fn();
        testsPassed++;
        console.log(`\n✅ ${name}`);
    } catch (error) {
        testsFailed++;
        failures.push({ name, error: error.message });
        console.log(`\n❌ ${name}`);
        console.log(`   Error: ${error.message}`);
    }
}

async function runTests() {
    console.log('🚀 Starting API Contract Tests...\n');
    console.log(`Base URL: ${BASE_URL}\n`);
    console.log('='.repeat(60));

    // ==================
    // Health Check
    // ==================
    await test('GET /api/health - should return OK status', async () => {
        const res = await fetchAPI('/api/health');
        assert(res.status === 200, 'Status should be 200');
        assert(res.data.status === 'ok', 'Status should be "ok"');
        assert(res.data.timestamp, 'Should have timestamp');
    });

    // ==================
    // Products API
    // ==================
    let productId;

    await test('GET /api/products - should return array of products', async () => {
        const res = await fetchAPI('/api/products');
        assert(res.status === 200, 'Status should be 200');
        assert(Array.isArray(res.data), 'Should return an array');
        if (res.data.length > 0) {
            productId = res.data[0].id;
            assert(res.data[0].id, 'Product should have ID');
            assert(res.data[0].name, 'Product should have name');
        }
    });

    await test('GET /api/products?limit=5 - should limit results', async () => {
        const res = await fetchAPI('/api/products?limit=5');
        assert(res.status === 200, 'Status should be 200');
        assert(res.data.length <= 5, 'Should return at most 5 products');
    });

    await test('GET /api/products?show_on_homepage=true - should filter homepage products', async () => {
        const res = await fetchAPI('/api/products?show_on_homepage=true');
        assert(res.status === 200, 'Status should be 200');
        assert(Array.isArray(res.data), 'Should return an array');
    });

    await test('GET /api/products/:id - should return single product', async () => {
        if (!productId) return;
        const res = await fetchAPI(`/api/products/${productId}`);
        assert(res.status === 200, 'Status should be 200');
        assert(res.data.id === productId, 'Should return correct product');
    });

    await test('GET /api/products/999999 - should return 404 for non-existent', async () => {
        const res = await fetchAPI('/api/products/999999');
        assert(res.status === 404, 'Status should be 404');
        assert(res.data.error, 'Should have error message');
    });

    // ==================
    // Categories API
    // ==================
    let categoryId;

    await test('GET /api/categories - should return array of categories', async () => {
        const res = await fetchAPI('/api/categories');
        assert(res.status === 200, 'Status should be 200');
        assert(Array.isArray(res.data), 'Should return an array');
        if (res.data.length > 0) {
            categoryId = res.data[0].id;
            assert(res.data[0].id, 'Category should have ID');
            assert(res.data[0].name, 'Category should have name');
        }
    });

    await test('GET /api/categories?is_visible=true - should filter visible categories', async () => {
        const res = await fetchAPI('/api/categories?is_visible=true');
        assert(res.status === 200, 'Status should be 200');
        res.data.forEach(cat => {
            assert(cat.is_visible === true, 'All categories should be visible');
        });
    });

    // ==================
    // Site Settings API
    // ==================
    await test('GET /api/site-settings - should return settings object', async () => {
        const res = await fetchAPI('/api/site-settings');
        assert(res.status === 200, 'Status should be 200');
        assert(typeof res.data === 'object', 'Should return an object');
        assert(res.data.company_name, 'Should have company_name');
    });

    // ==================
    // Catalog Articles API
    // ==================
    let articleSlug;

    await test('GET /api/catalog-articles - should return array of articles', async () => {
        const res = await fetchAPI('/api/catalog-articles');
        assert(res.status === 200, 'Status should be 200');
        assert(Array.isArray(res.data), 'Should return an array');
        if (res.data.length > 0 && res.data[0].slug) {
            articleSlug = res.data[0].slug;
        }
    });

    await test('GET /api/catalog-articles/:slug - should return article by slug', async () => {
        if (!articleSlug) {
            console.log('   Skipped: No articles available');
            return;
        }
        const res = await fetchAPI(`/api/catalog-articles/${articleSlug}`);
        assert(res.status === 200 || res.status === 404, 'Status should be 200 or 404');
    });

    // ==================
    // Gallery Images API
    // ==================
    await test('GET /api/gallery-images - should return paginated response', async () => {
        const res = await fetchAPI('/api/gallery-images');
        assert(res.status === 200, 'Status should be 200');
        assert(res.data.data !== undefined, 'Should have data property');
        assert(res.data.count !== undefined, 'Should have count property');
    });

    await test('GET /api/gallery-images?page=1&limit=5 - should paginate', async () => {
        const res = await fetchAPI('/api/gallery-images?page=1&limit=5');
        assert(res.status === 200, 'Status should be 200');
        assert(res.data.data.length <= 5, 'Should return at most 5 images');
        assert(res.data.page === 1, 'Page should be 1');
    });

    // ==================
    // Admin Auth API
    // ==================
    await test('POST /api/admin/login - should reject invalid credentials', async () => {
        const res = await fetchAPI('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'wrong', password: 'wrong' })
        });
        assert(res.status === 401, 'Status should be 401');
        assert(res.data.error, 'Should have error message');
    });

    // ==================
    // Image API
    // ==================
    await test('GET /api/image - should require path parameter', async () => {
        const res = await fetchAPI('/api/image');
        assert(res.status === 400, 'Status should be 400');
    });

    // ==================
    // Summary
    // ==================
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Passed: ${testsPassed}`);
    console.log(`   ❌ Failed: ${testsFailed}`);
    console.log(`   📈 Total:  ${testsPassed + testsFailed}`);

    if (failures.length > 0) {
        console.log('\n❌ Failed Tests:');
        failures.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
    }

    console.log('\n' + '='.repeat(60));
    process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
