// Admin API Service - connects to Laravel backend
// Uses same API as customer website but with authentication

// Types - reuse from backend models
export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
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


export interface Category {
    id: number;
    name: string;
    products_count?: number;
}

import api from '../lib/axios';

// API Helper with auth token
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('auth_token');

    try {
        const response = await api({
            url: endpoint,
            method: options?.method || 'GET',
            data: options?.body ? JSON.parse(options.body as string) : undefined,
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...(options?.headers as any),
            }
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.error || error.response.data.message || 'API Error');
        }
        throw error;
    }
}

// Auth Service
export const authService = {
    login: async (username: string, password: string) => {
        try {
            const response = await api.post('/login', { username, password });
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.error || 'Login failed');
            }
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        const loginPath = import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}login`.replace('//', '/') : '/secret/login';
        window.location.href = loginPath;
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
