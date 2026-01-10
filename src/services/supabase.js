import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProducts = async (limit = 12, onlyHomepage = false, options = {}) => {
    const { orderBy = 'created_at', ascending = false } = options;

    let query = supabase
        .from('products')
        .select('*')
        .order(orderBy, { ascending })
        .limit(limit);

    // Filter by show_on_homepage if requested
    if (onlyHomepage) {
        query = query.eq('show_on_homepage', true);
    }

    const { data, error } = await query;

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
        .eq('is_visible', true)
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data || [];
};

// Get images for a specific product
export const getProductImages = async (productId) => {
    const { data, error } = await supabase
        .from('product_images')
        .select(`
            *,
            image:images(*)
        `)
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching product images:', error);
        return [];
    }

    // Extract image URLs
    return (data || []).map(pi => pi.image?.url).filter(Boolean);
};

// Get published catalog articles
export const getCatalogArticles = async () => {
    const { data, error } = await supabase
        .from('catalog_articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching catalog articles:', error);
        return [];
    }
    return data || [];
};

// Get single catalog article by slug
export const getCatalogBySlug = async (slug) => {
    const { data, error } = await supabase
        .from('catalog_articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    if (error) {
        console.error('Error fetching catalog:', error);
        return null;
    }
    return data;
};

// (Legacy - keep for backward compatibility)
export const getCatalogs = async () => {
    return getCatalogArticles();
};
