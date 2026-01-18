import { createClient } from '@supabase/supabase-js';

// For Vite, env vars need VITE_ prefix. For Vercel, they don't.
// This handles both cases
const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.SUPABASE_URL || 'https://irncljhvsjtohiqllnsv.supabase.co') as string;
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.SUPABASE_ANON_KEY || '') as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
}

export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    price_bulk: number;
    total: number;
    category_id: number;
    image: string | null;
    description: string | null;
}

// Auth functions
export const loginUser = async (username: string, password: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (error || !data) return null;
    return data as AdminUser;
};

// Profile functions
export const getProfile = async (userId: number): Promise<AdminUser | null> => {
    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !data) return null;
    return data as AdminUser;
};

export const updateProfile = async (userId: number, updates: Partial<AdminUser>): Promise<AdminUser | null> => {
    const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error || !data) return null;
    return data as AdminUser;
};

// Category functions
export const getSupabaseCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) return [];
    return data as Category[];
};

export const addSupabaseCategory = async (name: string): Promise<Category | null> => {
    const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();

    if (error) return null;
    return data as Category;
};

export const deleteSupabaseCategory = async (id: number): Promise<boolean> => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    return !error;
};

// Product functions  
export const getSupabaseProducts = async (categoryId?: number): Promise<Product[]> => {
    let query = supabase.from('products').select('*').order('name');

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) return [];
    return data as Product[];
};

export const addSupabaseProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) return null;
    return data as Product;
};

export const updateSupabaseProduct = async (id: number, updates: Partial<Product>): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return null;
    return data as Product;
};

export const deleteSupabaseProduct = async (id: number): Promise<boolean> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    return !error;
};
