// API Service Layer for Sinotruk Customer Website
// Connects home_ui frontend to Laravel backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dongha.sinotruk-hanoi.com/api';

// Types
export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    price_bulk: number;
    total: number;
    type: string;
    image: string | null;
    mansx: string | null;
    category_id: number | null;
    weight: number | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    categories?: Category[];
}

export interface Category {
    id: number;
    name: string;
    products_count?: number;
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: PaginationMeta;
    message?: string;
}

export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

// API Helper
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// Product Service
export const productService = {
    // Get all products with pagination and filters
    getAll: async (params?: {
        page?: number;
        per_page?: number;
        category_id?: number;
        search?: string;
        type?: string;
    }): Promise<ApiResponse<Product[]>> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
        if (params?.category_id) searchParams.set('category_id', params.category_id.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.type) searchParams.set('type', params.type);

        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return fetchApi<ApiResponse<Product[]>>(`/products${query}`);
    },

    // Get single product by ID
    getById: async (id: number): Promise<ApiResponse<Product>> => {
        return fetchApi<ApiResponse<Product>>(`/products/${id}`);
    },

    // Get featured products
    getFeatured: async (): Promise<ApiResponse<Product[]>> => {
        return fetchApi<ApiResponse<Product[]>>('/products/featured');
    },

    // Get products by category
    getByCategory: async (categoryId: number, page = 1): Promise<ApiResponse<Product[]>> => {
        return fetchApi<ApiResponse<Product[]>>(`/categories/${categoryId}/products?page=${page}`);
    },
};

// Category Service
export const categoryService = {
    // Get all categories
    getAll: async (): Promise<ApiResponse<Category[]>> => {
        return fetchApi<ApiResponse<Category[]>>('/categories');
    },

    // Get single category
    getById: async (id: number): Promise<ApiResponse<Category>> => {
        return fetchApi<ApiResponse<Category>>(`/categories/${id}`);
    },
};

// Contact Service
export const contactService = {
    // Submit contact form
    submit: async (data: ContactFormData): Promise<ApiResponse<null>> => {
        return fetchApi<ApiResponse<null>>('/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
    return fetchApi('/health');
};

export default {
    products: productService,
    categories: categoryService,
    contact: contactService,
    healthCheck,
};
