// Admin API Service - connects to Laravel backend
// Uses same API as customer website but with authentication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dongha.sinotruk-hanoi.com/api';

// Types - reuse from backend models
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
    order_pending: number;
    min: number | null;
}

export interface Customer {
    id: number;
    code: string;
    name: string;
    person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    money: number;
    bulk_customer: boolean;
    monthly_discount: number | null;
}

export interface Order {
    id: number;
    user_id: number;
    tenphieu: string;
    money: number;
    lock: boolean;
    invisible: boolean;
    completed: boolean;
    vanchuyen: number;
    tygia: number;
    loinhuan: number;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    products_count?: number;
}

// API Helper with auth token
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    });

    if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// Auth Service
export const authService = {
    login: async (username: string, password: string) => {
        // Laravel uses web routes for auth, this needs to be adapted
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, password }),
        });
        return response.json();
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    },
};

// Product Service
export const productService = {
    getAll: (params?: { page?: number; search?: string }) =>
        fetchApi<{ data: Product[]; meta: any }>(`/products${params ? `?${new URLSearchParams(params as any)}` : ''}`),

    getById: (id: number) => fetchApi<{ data: Product }>(`/products/${id}`),

    // Note: Create/Update/Delete need authenticated web routes in Laravel
};

// Customer Service  
export const customerService = {
    getAll: (params?: { page?: number; search?: string }) =>
        fetchApi<{ data: Customer[]; meta: any }>(`/customers${params ? `?${new URLSearchParams(params as any)}` : ''}`),
};

// Category Service
export const categoryService = {
    getAll: () => fetchApi<{ data: Category[] }>('/categories'),
};

export default {
    auth: authService,
    products: productService,
    customers: customerService,
    categories: categoryService,
};
