// API Client for Admin UI - Replaces Supabase
// Uses local Express API server

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

// Types
export interface AdminUser {
    id: number;
    username: string;
    full_name: string;
    phone: string;
    avatar: string | null;
    is_admin: boolean;
    password?: string;
}

export interface Category {
    id: number;
    name: string;
    is_visible?: boolean;
    is_vehicle_name?: boolean;
}

export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    category_id: number;
    image: string | null;
    description: string | null;
    manufacturer_code?: string;
    show_on_homepage?: boolean;
}

export interface SiteSettings {
    company_logo: string | null;
    company_name: string | null;
    hotline?: string;
    address?: string;
    watermark_enabled?: boolean;
    watermark_text?: string;
    watermark_opacity?: number;
    [key: string]: string | boolean | number | null | undefined;
}

// Auth functions
export const loginUser = async (username: string, password: string): Promise<AdminUser | null> => {
    try {
        return await fetchAPI<AdminUser>('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
};

// Profile functions
export const getProfile = async (userId: number): Promise<AdminUser | null> => {
    try {
        return await fetchAPI<AdminUser>(`/admin/profile/${userId}`);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
};

export const updateProfile = async (userId: number, updates: Partial<AdminUser>): Promise<AdminUser | null> => {
    try {
        return await fetchAPI<AdminUser>(`/admin/profile/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return null;
    }
};

// Category functions
export const getCategories = async (): Promise<Category[]> => {
    try {
        return await fetchAPI<Category[]>('/categories');
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const createCategory = async (category: Partial<Category>): Promise<Category | null> => {
    try {
        return await fetchAPI<Category>('/categories', {
            method: 'POST',
            body: JSON.stringify(category)
        });
    } catch (error) {
        console.error('Error creating category:', error);
        return null;
    }
};

export const updateCategory = async (id: number, updates: Partial<Category>): Promise<Category | null> => {
    try {
        return await fetchAPI<Category>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    } catch (error) {
        console.error('Error updating category:', error);
        return null;
    }
};

export const deleteCategory = async (id: number): Promise<boolean> => {
    try {
        await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        return false;
    }
};

// Site Settings functions
export const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
        const rows = await fetchAPI<Array<{ key: string; value: string | null }>>('/site-settings');
        // Transform array to object
        const settings: SiteSettings = { company_logo: null, company_name: null };
        if (Array.isArray(rows)) {
            rows.forEach(row => {
                if (row.key === 'company_logo') settings.company_logo = row.value;
                if (row.key === 'company_name') settings.company_name = row.value;
            });
        }
        return settings;
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return { company_logo: null, company_name: null };
    }
};

export const updateSiteSetting = async (key: string, value: string): Promise<boolean> => {
    try {
        await fetchAPI('/site-settings', {
            method: 'PUT',
            body: JSON.stringify({ key, value })
        });
        return true;
    } catch (error) {
        console.error('Error updating site setting:', error);
        return false;
    }
};

// Mock supabase object for backward compatibility
export const supabase = {
    from: (table: string) => ({
        select: (columns = '*') => {
            const state = {
                _table: table,
                _filters: [] as { type: string; col: string; val: unknown }[],
                _order: null as { col: string; ascending: boolean } | null,
                _limit: null as number | null,
                _single: false,

                eq(col: string, val: unknown) { this._filters.push({ type: 'eq', col, val }); return this; },
                neq(col: string, val: unknown) { this._filters.push({ type: 'neq', col, val }); return this; },
                order(col: string, opts: { ascending: boolean } = { ascending: true }) { this._order = { col, ...opts }; return this; },
                limit(n: number) { this._limit = n; return this; },
                single() { this._single = true; return this; },

                async then(resolve: (result: { data: unknown; error: unknown; count?: number }) => void) {
                    try {
                        const endpoints: Record<string, string> = {
                            'products': '/products',
                            'categories': '/categories',
                            'site_settings': '/site-settings',
                            'catalog_articles': '/catalog-articles',
                            'gallery_images': '/gallery-images',
                            'admin_users': '/admin/users'
                        };

                        const params = new URLSearchParams();
                        if (this._limit) params.append('limit', String(this._limit));

                        // Add filters as query params
                        this._filters.forEach(f => {
                            if (f.type === 'eq') params.append(f.col, String(f.val));
                        });

                        const endpoint = endpoints[this._table] || `/${this._table}`;
                        const query = params.toString() ? `?${params}` : '';
                        const data = await fetchAPI<unknown>(`${endpoint}${query}`);

                        if (this._single) {
                            resolve({ data: Array.isArray(data) ? data[0] : data, error: null });
                        } else {
                            resolve({ data, error: null, count: Array.isArray(data) ? data.length : 0 });
                        }
                    } catch (error) {
                        resolve({ data: null, error });
                    }
                }
            };
            return state;
        },
        insert: (data: unknown) => ({
            select: () => ({
                single: async () => {
                    try {
                        const endpoints: Record<string, string> = {
                            'products': '/products',
                            'categories': '/categories',
                            'catalog_articles': '/catalog-articles',
                            'gallery_images': '/gallery-images'
                        };
                        const endpoint = endpoints[table] || `/${table}`;
                        const result = await fetchAPI(endpoint, {
                            method: 'POST',
                            body: JSON.stringify(data)
                        });
                        return { data: result, error: null };
                    } catch (error) {
                        return { data: null, error };
                    }
                }
            })
        }),
        update: (data: unknown) => ({
            _id: null as number | null,
            eq(col: string, val: number) { if (col === 'id') this._id = val; return this; },
            select: function () {
                const id = this._id;
                return {
                    single: async () => {
                        try {
                            const endpoints: Record<string, string> = {
                                'products': '/products',
                                'categories': '/categories',
                                'admin_users': '/admin/profile'
                            };
                            const endpoint = endpoints[table] || `/${table}`;
                            const result = await fetchAPI(`${endpoint}/${id}`, {
                                method: 'PUT',
                                body: JSON.stringify(data)
                            });
                            return { data: result, error: null };
                        } catch (error) {
                            return { data: null, error };
                        }
                    }
                };
            }
        }),
        delete: () => ({
            _id: null as number | null,
            eq(col: string, val: number) { if (col === 'id') this._id = val; return this; },
            async then(resolve: (result: { error: unknown }) => void) {
                try {
                    const endpoints: Record<string, string> = {
                        'products': '/products',
                        'categories': '/categories',
                        'catalog_articles': '/catalog-articles'
                    };
                    const endpoint = endpoints[table] || `/${table}`;
                    await fetchAPI(`${endpoint}/${this._id}`, { method: 'DELETE' });
                    resolve({ error: null });
                } catch (error) {
                    resolve({ error });
                }
            }
        })
    }),
    storage: {
        from: () => ({
            upload: async () => ({ data: null, error: new Error('Use /api/upload instead') }),
            getPublicUrl: (path: string) => ({ data: { publicUrl: `/uploads/original/${path}` } })
        })
    }
};
