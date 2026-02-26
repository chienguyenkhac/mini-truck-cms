// Admin Supabase Service - Uses local Express API
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Helper for API calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
}

export const getImageUrl = (image: string | null | undefined): string => {
    if (!image) return 'https://res.cloudinary.com/dgv7d7n6q/image/upload/v1734944400/product_placeholder.png';
    if (image.startsWith('/api/image') || image.startsWith('/uploads/')) {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        return image.startsWith('/api/') ? `${API_BASE}${image.substring(4)}` : image;
    }
    if (!image.startsWith('http') && !image.startsWith('/')) {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        return `${API_BASE}/image?path=${image}`;
    }
    if (image.includes('/storage/v1/object/public/')) {
        const parts = image.split('/');
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        return `${API_BASE}/image?path=${parts[parts.length - 1]}`;
    }
    if (image.includes('cloudinary.com')) {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        return `${API_BASE}/image?url=${encodeURIComponent(image)}`;
    }
    return image;
};

// Types
export interface Product {
    id: number;
    code: string;
    name: string;
    slug?: string;
    category_id: number | null;
    category_ids?: number[];
    vehicle_ids?: number[];
    manufacturer_code?: string | null;
    image: string | null;
    thumbnail?: string | null;
    description: string | null;
    show_on_homepage?: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalPages: number;
    currentPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export interface Category {
    id: number;
    name: string;
    slug?: string;
    code?: string;
    thumbnail?: string;
    is_vehicle_name?: boolean;
    is_visible?: boolean;
    created_at: string;
    updated_at: string;
}

export interface CatalogArticle {
    id: number;
    title: string;
    slug: string;
    content: object;
    thumbnail?: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface Image {
    id: number;
    url: string;
    public_id?: string;
    created_at: string;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_id: number;
    sort_order: number;
    is_primary: boolean;
    created_at: string;
    image?: Image;
}

// Product Service
export const productService = {
    getAll: async (params?: { cursor?: number; limit?: number; category?: string; search?: string }) => {
        const query = new URLSearchParams();
        if (params?.limit) query.append('limit', String(params.limit));
        if (params?.cursor) query.append('cursor', String(params.cursor));
        if (params?.category && params.category !== 'ALL') query.append('category_id', params.category);
        if (params?.search) query.append('search', params.search);
        return fetchAPI<Product[]>(`/products?${query}`);
    },

    getById: async (id: number) => fetchAPI<Product>(`/products/${id}`),

    create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) =>
        fetchAPI<Product>('/products', { method: 'POST', body: JSON.stringify(product) }),

    update: async (id: number, product: Partial<Product>) =>
        fetchAPI<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),

    delete: async (id: number) => fetchAPI(`/products/${id}`, { method: 'DELETE' })
};

// Category Service
export const categoryService = {
    getAll: async () => fetchAPI<Category[]>('/categories'),

    create: async (category: { name: string; code?: string; thumbnail?: string; is_vehicle_name?: boolean; is_visible?: boolean }) =>
        fetchAPI<Category>('/categories', { method: 'POST', body: JSON.stringify(category) }),

    update: async (id: number, category: { name?: string; code?: string; thumbnail?: string; is_vehicle_name?: boolean; is_visible?: boolean }) =>
        fetchAPI<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) }),

    delete: async (id: number) => fetchAPI(`/categories/${id}`, { method: 'DELETE' })
};

// Catalog Article Service  
export const catalogService = {
    getAll: async (publishedOnly: boolean = false) => {
        const query = publishedOnly ? '?is_published=true' : '';
        const response = await fetchAPI<{data: CatalogArticle[], pagination: any, search: string}>(`/catalog-articles${query}`);
        return response.data;
    },

    getById: async (id: number) => fetchAPI<CatalogArticle>(`/catalog-articles/${id}`),

    getBySlug: async (slug: string) => fetchAPI<CatalogArticle>(`/catalog-articles/${slug}`),

    create: async (article: { title: string; slug: string; content: object; thumbnail?: string; is_published?: boolean }) =>
        fetchAPI<CatalogArticle>('/catalog-articles', { method: 'POST', body: JSON.stringify(article) }),

    update: async (id: number, article: { title?: string; slug?: string; content?: object; thumbnail?: string; is_published?: boolean }) =>
        fetchAPI<CatalogArticle>(`/catalog-articles/${id}`, { method: 'PUT', body: JSON.stringify({ ...article, updated_at: new Date().toISOString() }) }),

    delete: async (id: number) => fetchAPI(`/catalog-articles/${id}`, { method: 'DELETE' })
};

// Image Service
export const imageService = {
    create: async (url: string, publicId?: string) =>
        fetchAPI<Image>('/images', { method: 'POST', body: JSON.stringify({ url, public_id: publicId }) }),

    delete: async (id: number) => fetchAPI(`/images/${id}`, { method: 'DELETE' })
};

// Product Images Service
export const productImageService = {
    getByProduct: async (productId: number) => {
        const data = await fetchAPI<ProductImage[]>(`/product-images/${productId}`);
        return (data || []).map(pi => ({
            ...pi,
            image: pi.image ? { ...pi.image, url: getImageUrl(pi.image.url) } : pi.image
        }));
    },

    addToProduct: async (productId: number, imageId: number, isPrimary = false, sortOrder = 0) =>
        fetchAPI<ProductImage>('/product-images', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, image_id: imageId, is_primary: isPrimary, sort_order: sortOrder })
        }),

    removeFromProduct: async (productId: number, imageId: number) =>
        fetchAPI(`/product-images/${productId}/${imageId}`, { method: 'DELETE' }),

    setPrimary: async (productId: number, imageId: number) =>
        fetchAPI(`/product-images/${productId}/${imageId}/primary`, { method: 'PUT' }),

    updateOrder: async (productId: number, imageId: number, newOrder: number) =>
        fetchAPI(`/product-images/${productId}/${imageId}/order`, { method: 'PUT', body: JSON.stringify({ sort_order: newOrder }) })
};

// Mock supabase for backward compatibility
export const supabase = {
    from: (table: string) => ({
        select: () => {
            const doFetch = async () => {
                try {
                    const endpoint = `/${table.replace('_', '-')}`;
                    const result = await fetchAPI(endpoint);
                    return { data: result, error: null };
                } catch (error) {
                    return { data: null, error };
                }
            };
            const promise = doFetch();
            return {
                order: () => ({
                    limit: () => ({ then: (r: (value: any) => any) => promise.then(r) }),
                    then: (r: (value: any) => any) => promise.then(r)
                }),
                eq: () => ({ single: async () => ({ data: null, error: null }), then: (r: (value: any) => any) => promise.then(r) }),
                single: async () => ({ data: null, error: null }),
                then: (r: (value: any) => any) => promise.then(r)
            };
        },
        insert: (data: unknown) => {
            const doInsert = async () => {
                try {
                    const endpoint = `/${table.replace('_', '-')}`;
                    const result = await fetchAPI(endpoint, {
                        method: 'POST',
                        body: JSON.stringify(data)
                    });
                    return { data: result, error: null };
                } catch (error) {
                    return { data: null, error };
                }
            };
            // Return thenable that also has select().single() chain
            const promise = doInsert();
            return {
                then: (resolve: (value: any) => any) => promise.then(resolve),
                select: () => ({
                    single: () => promise
                })
            };
        },
        update: (data: unknown) => ({
            eq: (field: string, value: unknown) => {
                const doUpdate = async () => {
                    try {
                        const endpoint = `/${table.replace('_', '-')}`;
                        await fetchAPI(endpoint, {
                            method: 'PUT',
                            body: JSON.stringify({ [field]: value, ...data as object })
                        });
                        return { data: null, error: null };
                    } catch (error) {
                        return { data: null, error };
                    }
                };
                const promise = doUpdate();
                return {
                    then: (r: (value: any) => any) => promise.then(r),
                    select: () => ({ single: () => promise })
                };
            }
        }),
        delete: () => ({
            eq: (_field: string, value: unknown) => ({
                then: async (r: (value: any) => any) => {
                    try {
                        await fetchAPI(`/${table.replace('_', '-')}/${value}`, { method: 'DELETE' });
                        r({ error: null });
                    } catch (error) {
                        r({ error });
                    }
                }
            })
        })
    }),
    storage: {
        from: () => ({
            upload: async () => ({ data: null, error: new Error('Use /api/upload') }),
            getPublicUrl: (path: string) => ({ data: { publicUrl: `/uploads/original/${path}` } })
        })
    }
};

export default {
    products: productService,
    categories: categoryService,
    catalogs: catalogService,
    images: imageService,
    productImages: productImageService,
    supabase
};
