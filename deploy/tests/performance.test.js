/**
 * Performance Tests for Sinotruk E-commerce
 * Tests API response times and throughput
 */

const API_BASE = process.env.API_URL || 'http://localhost:3002/api';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
    API_RESPONSE_TIME: 500,      // Max 500ms for API response
    API_RESPONSE_TIME_P95: 1000, // 95th percentile should be under 1s
    PAGE_LOAD_TIME: 3000,        // Max 3s for page load
    CONCURRENT_REQUESTS: 10      // Number of concurrent requests to test
};

// Helper: Measure API response time
async function measureAPITime(endpoint) {
    const start = performance.now();
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    const duration = performance.now() - start;
    return { duration, status: response.status, dataLength: JSON.stringify(data).length };
}

// Helper: Calculate percentiles
function percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[idx];
}

// Helper: Calculate statistics
function calculateStats(times) {
    const sum = times.reduce((a, b) => a + b, 0);
    return {
        count: times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        avg: sum / times.length,
        p50: percentile(times, 50),
        p95: percentile(times, 95),
        p99: percentile(times, 99)
    };
}

// Test results storage
const results = {
    api: {},
    summary: {
        passed: 0,
        failed: 0,
        tests: []
    }
};

// Test function wrapper
function test(name, fn) {
    return async () => {
        console.log(`\n📊 Running: ${name}`);
        try {
            const result = await fn();
            const passed = result.passed !== false;
            results.summary.tests.push({ name, passed, ...result });
            if (passed) {
                results.summary.passed++;
                console.log(`   ✅ PASSED: ${result.message || ''}`);
            } else {
                results.summary.failed++;
                console.log(`   ❌ FAILED: ${result.message || ''}`);
            }
            return result;
        } catch (error) {
            results.summary.failed++;
            results.summary.tests.push({ name, passed: false, error: error.message });
            console.log(`   ❌ ERROR: ${error.message}`);
            return { passed: false, error: error.message };
        }
    };
}

// ============================================
// API PERFORMANCE TESTS
// ============================================

const apiTests = {
    // Test: Products endpoint response time
    productsListPerformance: test('API: Products List Response Time', async () => {
        const times = [];
        for (let i = 0; i < 10; i++) {
            const { duration } = await measureAPITime('/products');
            times.push(duration);
        }
        const stats = calculateStats(times);
        results.api.products = stats;

        const passed = stats.avg < THRESHOLDS.API_RESPONSE_TIME &&
            stats.p95 < THRESHOLDS.API_RESPONSE_TIME_P95;

        return {
            passed,
            message: `Avg: ${stats.avg.toFixed(0)}ms, P95: ${stats.p95.toFixed(0)}ms, Max: ${stats.max.toFixed(0)}ms`,
            stats
        };
    }),

    // Test: Categories endpoint response time
    categoriesListPerformance: test('API: Categories List Response Time', async () => {
        const times = [];
        for (let i = 0; i < 10; i++) {
            const { duration } = await measureAPITime('/categories');
            times.push(duration);
        }
        const stats = calculateStats(times);
        results.api.categories = stats;

        const passed = stats.avg < THRESHOLDS.API_RESPONSE_TIME;

        return {
            passed,
            message: `Avg: ${stats.avg.toFixed(0)}ms, P95: ${stats.p95.toFixed(0)}ms`,
            stats
        };
    }),

    // Test: Site Settings endpoint response time
    settingsPerformance: test('API: Site Settings Response Time', async () => {
        const times = [];
        for (let i = 0; i < 10; i++) {
            const { duration } = await measureAPITime('/site-settings');
            times.push(duration);
        }
        const stats = calculateStats(times);
        results.api.settings = stats;

        const passed = stats.avg < THRESHOLDS.API_RESPONSE_TIME;

        return {
            passed,
            message: `Avg: ${stats.avg.toFixed(0)}ms, P95: ${stats.p95.toFixed(0)}ms`,
            stats
        };
    }),

    // Test: Gallery Images endpoint response time
    galleryPerformance: test('API: Gallery Images Response Time', async () => {
        const times = [];
        for (let i = 0; i < 10; i++) {
            const { duration } = await measureAPITime('/gallery-images');
            times.push(duration);
        }
        const stats = calculateStats(times);
        results.api.gallery = stats;

        const passed = stats.avg < THRESHOLDS.API_RESPONSE_TIME;

        return {
            passed,
            message: `Avg: ${stats.avg.toFixed(0)}ms, P95: ${stats.p95.toFixed(0)}ms`,
            stats
        };
    }),

    // Test: Concurrent requests handling
    concurrentRequestsPerformance: test('API: Concurrent Requests Handling', async () => {
        const concurrentRequests = THRESHOLDS.CONCURRENT_REQUESTS;
        const start = performance.now();

        const promises = [];
        for (let i = 0; i < concurrentRequests; i++) {
            promises.push(measureAPITime('/products'));
        }

        const results = await Promise.all(promises);
        const totalDuration = performance.now() - start;
        const times = results.map(r => r.duration);
        const stats = calculateStats(times);

        const allSuccessful = results.every(r => r.status === 200);
        const passed = allSuccessful && stats.max < THRESHOLDS.API_RESPONSE_TIME_P95 * 2;

        return {
            passed,
            message: `${concurrentRequests} requests in ${totalDuration.toFixed(0)}ms, Max single: ${stats.max.toFixed(0)}ms`,
            concurrentRequests,
            totalDuration,
            stats
        };
    }),

    // Test: Products with filtering
    productsFilterPerformance: test('API: Products with Category Filter', async () => {
        const times = [];
        for (let i = 0; i < 5; i++) {
            const { duration } = await measureAPITime('/products?category_id=1');
            times.push(duration);
        }
        const stats = calculateStats(times);

        const passed = stats.avg < THRESHOLDS.API_RESPONSE_TIME;

        return {
            passed,
            message: `Avg: ${stats.avg.toFixed(0)}ms, P95: ${stats.p95.toFixed(0)}ms`,
            stats
        };
    }),

    // Test: Database query performance (products count)
    databaseQueryPerformance: test('API: Database Query Performance', async () => {
        const times = [];
        for (let i = 0; i < 5; i++) {
            const start = performance.now();
            const response = await fetch(`${API_BASE}/products?limit=100`);
            await response.json();
            times.push(performance.now() - start);
        }
        const stats = calculateStats(times);

        const passed = stats.avg < THRESHOLDS.API_RESPONSE_TIME * 1.5; // Allow 50% more for large queries

        return {
            passed,
            message: `Avg: ${stats.avg.toFixed(0)}ms for 100 products query`,
            stats
        };
    })
};

// ============================================
// RUN TESTS
// ============================================

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('🚀 SINOTRUK PERFORMANCE TEST SUITE');
    console.log('='.repeat(60));
    console.log(`\n📍 API Base: ${API_BASE}`);
    console.log(`📍 Client URL: ${CLIENT_URL}`);
    console.log(`📍 Thresholds: API Response < ${THRESHOLDS.API_RESPONSE_TIME}ms`);
    console.log('');

    // Run API tests
    console.log('\n' + '─'.repeat(40));
    console.log('🔌 API PERFORMANCE TESTS');
    console.log('─'.repeat(40));

    for (const [name, testFn] of Object.entries(apiTests)) {
        await testFn();
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`📈 Total:  ${results.summary.passed + results.summary.failed}`);

    // API Response Time Summary
    console.log('\n📊 API Response Times (Average):');
    console.log('─'.repeat(40));
    for (const [endpoint, stats] of Object.entries(results.api)) {
        const status = stats.avg < THRESHOLDS.API_RESPONSE_TIME ? '✅' : '⚠️';
        console.log(`  ${status} /${endpoint}: ${stats.avg.toFixed(0)}ms (P95: ${stats.p95.toFixed(0)}ms)`);
    }

    // Exit with appropriate code
    const exitCode = results.summary.failed > 0 ? 1 : 0;
    console.log(`\n${exitCode === 0 ? '🎉 All performance tests passed!' : '⚠️ Some performance tests failed'}`);

    return results;
}

// Run tests
runAllTests().catch(console.error);
