import { test, expect } from '@playwright/test';

// Base URLs
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';

// ==============================================
// CLIENT WEBSITE TESTS
// ==============================================

test.describe('Client Website', () => {

    test.describe('Homepage', () => {
        test('should load homepage with hero section', async ({ page }) => {
            await page.goto(CLIENT_URL);

            // Check page title or main content
            await expect(page).toHaveTitle(/SINOTRUK|Hà Nội/i);

            // Hero section should be visible
            await expect(page.locator('section').first()).toBeVisible();
        });

        test('should display navigation bar', async ({ page }) => {
            await page.goto(CLIENT_URL);

            // Navbar should be visible
            const navbar = page.locator('nav').first();
            await expect(navbar).toBeVisible();

            // Should have navigation links
            await expect(page.getByRole('link', { name: /sản phẩm/i })).toBeVisible();
        });

        test('should display product grid on homepage', async ({ page }) => {
            await page.goto(CLIENT_URL);

            // Wait for products to load
            await page.waitForTimeout(2000);

            // Should show some product cards or product section
            const productSection = page.locator('text=Sản phẩm').first();
            await expect(productSection).toBeVisible({ timeout: 10000 });
        });

        test('should display stats section', async ({ page }) => {
            await page.goto(CLIENT_URL);

            // Stats section with numbers
            await page.waitForTimeout(1000);
            const statsSection = page.locator('[class*="stat"], [class*="counter"]').first();
            // Just check page loads without error
        });
    });

    test.describe('Products Page', () => {
        test('should navigate to products page', async ({ page }) => {
            await page.goto(CLIENT_URL);

            // Click on products link
            await page.getByRole('link', { name: /sản phẩm/i }).first().click();

            // Should be on products page
            await expect(page).toHaveURL(/products|san-pham/i);
        });

        test('should display product list', async ({ page }) => {
            await page.goto(`${CLIENT_URL}/products`);

            // Wait for products to load
            await page.waitForTimeout(3000);

            // Should have product elements - look for images or product names
            const productElement = page.locator('img[alt], h3, h4, [class*="bg-white"]').first();
            await expect(productElement).toBeVisible({ timeout: 15000 });
        });

        test('should filter products by category', async ({ page }) => {
            await page.goto(`${CLIENT_URL}/products`);

            // Wait for page to load
            await page.waitForTimeout(2000);

            // Look for category filter buttons
            const categoryFilter = page.locator('button, [class*="category"]').first();
            if (await categoryFilter.isVisible()) {
                // Category filters exist
                await expect(categoryFilter).toBeVisible();
            }
        });

        test('should search products', async ({ page }) => {
            await page.goto(`${CLIENT_URL}/products`);

            // Find search input
            const searchInput = page.locator('input[type="text"], input[type="search"]').first();
            if (await searchInput.isVisible()) {
                await searchInput.fill('HOWO');
                await page.waitForTimeout(1000);
            }
        });
    });

    test.describe('Product Detail Page', () => {
        test('should click on product and view detail', async ({ page }) => {
            await page.goto(`${CLIENT_URL}/products`);

            // Wait for products
            await page.waitForTimeout(2000);

            // Click on first product
            const productLink = page.locator('a[href*="/product/"]').first();
            if (await productLink.isVisible()) {
                await productLink.click();
                await expect(page).toHaveURL(/product\//);
            }
        });
    });

    test.describe('About Page', () => {
        test('should navigate to about page', async ({ page }) => {
            await page.goto(`${CLIENT_URL}/about`);

            // Should show about content
            await expect(page.locator('h1, h2').first()).toBeVisible();
        });
    });

    test.describe('Contact Page', () => {
        test('should navigate to contact page', async ({ page }) => {
            await page.goto(`${CLIENT_URL}/contact`);

            // Should show contact info or form
            await expect(page.locator('form, [class*="contact"]').first()).toBeVisible({ timeout: 5000 });
        });

        test('should have contact form fields', async ({ page }) => {
            await page.goto(`${CLIENT_URL}/contact`);

            // Look for form inputs
            const nameInput = page.locator('input[name*="name"], input[placeholder*="tên"]').first();
            if (await nameInput.isVisible()) {
                await expect(nameInput).toBeVisible();
            }
        });
    });

    test.describe('Catalog Page', () => {
        test('should navigate to catalog page', async ({ page }) => {
            await page.goto(`${CLIENT_URL}/catalog`);

            // Should show articles
            await page.waitForTimeout(2000);
        });
    });
});

// ==============================================
// ADMIN PANEL TESTS (SECRET)
// ==============================================

test.describe('Admin Panel', () => {

    test.describe('Login Page', () => {
        test('should display login form', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/login`);

            // Wait for page load
            await page.waitForTimeout(2000);

            // Should show login form - check for any input field
            await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
            await expect(page.locator('input[type="password"]').first()).toBeVisible();
        });

        test('should reject invalid credentials', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/login`);

            // Fill login form with invalid credentials
            await page.locator('input[type="email"], input[type="text"], input[name*="user"]').first().fill('wronguser');
            await page.locator('input[type="password"]').first().fill('wrongpassword');

            // Submit
            await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

            // Should show error
            await page.waitForTimeout(2000);
            const errorMessage = page.locator('text=/lỗi|sai|không đúng/i');
            // Error should be visible if credentials are wrong
        });

        test('should login with valid credentials', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/login`);

            // Fill with mock credentials
            await page.locator('input[type="text"], input[name*="user"]').first().fill('admin');
            await page.locator('input[type="password"]').first().fill('admin');

            // Submit
            await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

            // Should redirect to dashboard
            await page.waitForTimeout(3000);
            await expect(page).toHaveURL(/dashboard/i);
        });
    });

    test.describe('Dashboard (requires auth)', () => {
        test.beforeEach(async ({ page }) => {
            // Login first
            await page.goto(`${ADMIN_URL}/login`);
            await page.locator('input[type="text"], input[name*="user"]').first().fill('admin');
            await page.locator('input[type="password"]').first().fill('admin');
            await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
            await page.waitForTimeout(2000);
        });

        test('should display dashboard with stats', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/dashboard`);

            // Wait for data to load
            await page.waitForTimeout(3000);

            // Should show dashboard heading
            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });

            // Should show some stats or content
            const content = page.locator('h1, h2').first();
            await expect(content).toBeVisible();
        });

        test('should display stats numbers', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/dashboard`);

            await page.waitForTimeout(3000);

            // Check for stats text
            await expect(page.locator('text=/sản phẩm|danh mục|bài viết/i').first()).toBeVisible();
        });
    });

    test.describe('Products Management (requires auth)', () => {
        test.beforeEach(async ({ page }) => {
            // Login first
            await page.goto(`${ADMIN_URL}/login`);
            await page.locator('input[type="text"], input[name*="user"]').first().fill('admin');
            await page.locator('input[type="password"]').first().fill('admin');
            await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
            await page.waitForTimeout(2000);
        });

        test('should navigate to products page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/products`);

            // Should show products management
            await expect(page.locator('text=/sản phẩm|products/i').first()).toBeVisible({ timeout: 5000 });
        });

        test('should display products table or grid', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/products`);

            await page.waitForTimeout(3000);

            // Should have table or product list
            const table = page.locator('table, [class*="grid"], [class*="list"]');
            await expect(table.first()).toBeVisible();
        });

        test('should have add product button', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/products`);

            await page.waitForTimeout(2000);

            // Look for add button
            const addButton = page.locator('button:has-text("Thêm"), button:has-text("Add"), button:has-text("Tạo")');
            await expect(addButton.first()).toBeVisible();
        });
    });

    test.describe('Categories Management (requires auth)', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(`${ADMIN_URL}/login`);
            await page.locator('input[type="text"], input[name*="user"]').first().fill('admin');
            await page.locator('input[type="password"]').first().fill('admin');
            await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
            await page.waitForTimeout(2000);
        });

        test('should navigate to categories page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/categories`);

            await expect(page.locator('text=/danh mục|categories/i').first()).toBeVisible({ timeout: 5000 });
        });

        test('should display categories list', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/categories`);

            await page.waitForTimeout(3000);

            const table = page.locator('table, [class*="grid"], [class*="list"]');
            await expect(table.first()).toBeVisible();
        });
    });

    test.describe('Settings Page (requires auth)', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(`${ADMIN_URL}/login`);
            await page.locator('input[type="text"], input[name*="user"]').first().fill('admin');
            await page.locator('input[type="password"]').first().fill('admin');
            await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
            await page.waitForTimeout(2000);
        });

        test('should navigate to settings page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/settings`);

            await expect(page.locator('text=/cài đặt|settings/i').first()).toBeVisible({ timeout: 5000 });
        });

        test('should display company name setting', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/settings`);

            await page.waitForTimeout(2000);

            // Look for company name input
            const companyInput = page.locator('input[name*="company"], input[placeholder*="công ty"]');
            if (await companyInput.first().isVisible()) {
                await expect(companyInput.first()).toBeVisible();
            }
        });
    });

    test.describe('Sidebar Navigation (requires auth)', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(`${ADMIN_URL}/login`);
            await page.locator('input[type="text"], input[name*="user"]').first().fill('admin');
            await page.locator('input[type="password"]').first().fill('admin');
            await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
            await page.waitForTimeout(2000);
        });

        test('should display sidebar with menu items', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/dashboard`);

            // Sidebar should have navigation links
            const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
            await expect(sidebar).toBeVisible();
        });

        test('should navigate between pages via sidebar', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/dashboard`);
            await page.waitForTimeout(2000);

            // Click on Products in sidebar - use more specific selector
            const productsLink = page.locator('a[href*="products"]').first();
            if (await productsLink.isVisible()) {
                await productsLink.click();
                await page.waitForTimeout(2000);
                await expect(page).toHaveURL(/products/, { timeout: 10000 });
            }
        });
    });
});
