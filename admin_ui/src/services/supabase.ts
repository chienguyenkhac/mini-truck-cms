// Admin Supabase Service - connects to Supabase database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    price_bulk: number;
    total: number;
    category_id: number | null;
    category_ids?: number[];
    vehicle_ids?: number[];
    image: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    is_vehicle_name?: boolean;
    created_at: string;
    updated_at: string;
}

// Product Service
export const productService = {
    getAll: async (params?: { cursor?: number; limit?: number; category?: string; search?: string }) => {
        let query = supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

        if (params?.limit) {
            query = query.limit(params.limit);
        } else {
            query = query.limit(20);
        }

        if (params?.cursor) {
            query = query.gt('id', params.cursor);
        }

        if (params?.category && params.category !== 'ALL') {
            query = query.eq('category_id', parseInt(params.category));
        }

        if (params?.search) {
            query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getById: async (id: number) => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id: number, product: Partial<Product>) => {
        const { data, error } = await supabase
            .from('products')
            .update(product)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id: number) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// Category Service
export const categoryService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        if (error) throw error;
        return data || [];
    },

    create: async (name: string, is_vehicle_name: boolean = false) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name, is_vehicle_name }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id: number, name: string, is_vehicle_name: boolean) => {
        const { data, error } = await supabase
            .from('categories')
            .update({ name, is_vehicle_name })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id: number) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

export default {
    products: productService,
    categories: categoryService,
    supabase
};
