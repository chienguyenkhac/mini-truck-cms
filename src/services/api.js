// API Client - Replaces Supabase direct calls
// Uses local Express API server

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
export async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// Image URL helper
export const getImageUrl = (image) => {
    if (!image) return 'https://res.cloudinary.com/dgv7d7n6q/image/upload/v1734944400/product_placeholder.png';

    // If already proxied or is an upload path
    if (image.startsWith('/api/image') || image.startsWith('/uploads/')) return image;

    // If it's a relative path (filename only)
    if (!image.startsWith('http') && !image.startsWith('/')) {
        return `/api/image?path=${image}`;
    }

    // If it's a full URL from Supabase storage
    if (image.includes('/storage/v1/object/public/')) {
        const parts = image.split('/');
        const filename = parts[parts.length - 1];
        return `/api/image?path=${filename}`;
    }

    // External URLs - proxy them
    if (image.startsWith('http')) {
        return `/api/image?url=${encodeURIComponent(image)}`;
    }

    return image;
};

// Products
export const getProducts = async (limit = 12, onlyHomepage = false, options = {}) => {
    try {
        const params = new URLSearchParams({ limit });
        if (onlyHomepage) params.append('show_on_homepage', 'true');
        if (options.search) params.append('search', options.search);
        if (options.manufacturer_code) params.append('manufacturer_code', options.manufacturer_code);
        if (options.category_id) params.append('category_id', options.category_id);
        if (options.category) params.append('category', options.category);

        return await fetchAPI(`/products?${params}`);
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const getProductById = async (identifier) => {
    try {
        return await fetchAPI(`/products/${identifier}`);
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};

// Alias for backward compatibility
export const getProductBySlug = getProductById;

// Categories
export const getCategories = async (options = {}) => {
    try {
        const params = new URLSearchParams();
        if (options.is_visible) params.append('is_visible', 'true');
        if (options.is_vehicle_name !== undefined) {
            params.append('is_vehicle_name', options.is_vehicle_name);
        }

        const query = params.toString() ? `?${params}` : '';
        return await fetchAPI(`/categories${query}`);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const getCategoryById = async (id) => {
    try {
        return await fetchAPI(`/categories/${id}`);
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
};

// Site Settings
export const getSiteSettings = async () => {
    try {
        return await fetchAPI('/site-settings');
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return {};
    }
};

// Catalog Articles
export const getCatalogArticles = async () => {
    try {
        return await fetchAPI('/catalog-articles');
    } catch (error) {
        console.error('Error fetching catalog articles:', error);
        return [];
    }
};

export const getCatalogBySlug = async (slug) => {
    try {
        return await fetchAPI(`/catalog-articles/${slug}`);
    } catch (error) {
        console.error('Error fetching catalog:', error);
        return null;
    }
};

// Legacy alias
export const getCatalogs = getCatalogArticles;

// Gallery Images
export const getGalleryImages = async (page = 1, limit = 20) => {
    try {
        return await fetchAPI(`/gallery-images?page=${page}&limit=${limit}`);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return { data: [], count: 0 };
    }
};

// Product Images
export const getProductImages = async (productId) => {
    try {
        const data = await fetchAPI(`/product-images/${productId}`);
        return (data || []).map(pi => getImageUrl(pi.image_url)).filter(Boolean);
    } catch (error) {
        console.error('Error fetching product images:', error);
        return [];
    }
};

// Admin Auth
export const loginUser = async (username, password) => {
    try {
        return await fetchAPI('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
};

export const getProfile = async (userId) => {
    try {
        return await fetchAPI(`/admin/profile/${userId}`);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
};

export const updateProfile = async (userId, updates) => {
    try {
        return await fetchAPI(`/admin/profile/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return null;
    }
};

// For backward compatibility - create a mock supabase object
// This allows minimal changes to existing code
export const supabase = {
    from: (table) => ({
        select: (columns = '*') => ({
            _table: table,
            _columns: columns,
            _filters: [],
            _order: null,
            _limit: null,

            eq: function (col, val) { this._filters.push({ type: 'eq', col, val }); return this; },
            neq: function (col, val) { this._filters.push({ type: 'neq', col, val }); return this; },
            ilike: function (col, val) { this._filters.push({ type: 'ilike', col, val }); return this; },
            or: function (conditions) { this._filters.push({ type: 'or', conditions }); return this; },
            order: function (col, opts) { this._order = { col, ...opts }; return this; },
            limit: function (n) { this._limit = n; return this; },
            range: function (from, to) { this._range = { from, to }; return this; },
            single: function () { this._single = true; return this; },

            then: async function (resolve, reject) {
                try {
                    // Build query params from filters
                    const params = new URLSearchParams();
                    if (this._limit) params.append('limit', this._limit);
                    
                    // Handle filters
                    for (const filter of this._filters) {
                        if (filter.type === 'eq') {
                            params.append(filter.col, filter.val);
                        }
                    }

                    // Map table to API endpoint
                    const endpoints = {
                        'products': '/products',
                        'categories': '/categories',
                        'site_settings': '/site-settings',
                        'catalog_articles': '/catalog-articles',
                        'gallery_images': '/gallery-images'
                    };

                    const endpoint = endpoints[this._table] || `/${this._table}`;
                    const query = params.toString() ? `?${params}` : '';

                    const data = await fetchAPI(`${endpoint}${query}`);

                    if (this._single) {
                        resolve({ data: Array.isArray(data) ? data[0] : data, error: null });
                    } else {
                        resolve({ data, error: null, count: Array.isArray(data) ? data.length : 0 });
                    }
                } catch (error) {
                    if (reject) reject({ data: null, error });
                    else resolve({ data: null, error });
                }
            }
        })
    })
};
