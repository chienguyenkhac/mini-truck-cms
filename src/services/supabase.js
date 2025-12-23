import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProducts = async (limit = 12) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
        .limit(limit);

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data || [];
};

export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data || [];
};
