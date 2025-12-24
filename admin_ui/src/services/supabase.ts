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
    category_id: number | null;
    category_ids?: number[];
    vehicle_ids?: number[];
    image: string | null;
    thumbnail?: string | null;
    description: string | null;
    show_on_homepage?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
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
    content: object; // EditorJS JSON
    thumbnail?: string;
    is_published: boolean;
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

    create: async (category: { name: string; code?: string; thumbnail?: string; is_vehicle_name?: boolean; is_visible?: boolean }) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id: number, category: { name?: string; code?: string; thumbnail?: string; is_vehicle_name?: boolean; is_visible?: boolean }) => {
        const { data, error } = await supabase
            .from('categories')
            .update(category)
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

// Catalog Article Service
export const catalogService = {
    getAll: async (publishedOnly: boolean = false) => {
        let query = supabase
            .from('catalog_articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (publishedOnly) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getById: async (id: number) => {
        const { data, error } = await supabase
            .from('catalog_articles')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    getBySlug: async (slug: string) => {
        const { data, error } = await supabase
            .from('catalog_articles')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) throw error;
        return data;
    },

    create: async (article: { title: string; slug: string; content: object; thumbnail?: string; is_published?: boolean }) => {
        const { data, error } = await supabase
            .from('catalog_articles')
            .insert([article])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id: number, article: { title?: string; slug?: string; content?: object; thumbnail?: string; is_published?: boolean }) => {
        const { data, error } = await supabase
            .from('catalog_articles')
            .update({ ...article, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id: number) => {
        const { error } = await supabase
            .from('catalog_articles')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// Image interface
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
    image?: Image; // Joined data
}

// Image Service
export const imageService = {
    create: async (url: string, publicId?: string) => {
        const { data, error } = await supabase
            .from('images')
            .insert([{ url, public_id: publicId }])
            .select()
            .single();
        if (error) throw error;
        return data as Image;
    },

    delete: async (id: number) => {
        const { error } = await supabase
            .from('images')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// Product Images Service (junction table)
export const productImageService = {
    // Get all images for a product
    getByProduct: async (productId: number) => {
        const { data, error } = await supabase
            .from('product_images')
            .select(`
                *,
                image:images(*)
            `)
            .eq('product_id', productId)
            .order('sort_order', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Add image to product
    addToProduct: async (productId: number, imageId: number, isPrimary = false, sortOrder = 0) => {
        const { data, error } = await supabase
            .from('product_images')
            .insert([{
                product_id: productId,
                image_id: imageId,
                is_primary: isPrimary,
                sort_order: sortOrder
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Remove image from product
    removeFromProduct: async (productId: number, imageId: number) => {
        const { error } = await supabase
            .from('product_images')
            .delete()
            .eq('product_id', productId)
            .eq('image_id', imageId);
        if (error) throw error;
    },

    // Set primary image
    setPrimary: async (productId: number, imageId: number) => {
        // First, unset all primary for this product
        await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_id', productId);

        // Then set the new primary
        const { error } = await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('product_id', productId)
            .eq('image_id', imageId);
        if (error) throw error;
    },

    // Reorder images
    updateOrder: async (productId: number, imageId: number, newOrder: number) => {
        const { error } = await supabase
            .from('product_images')
            .update({ sort_order: newOrder })
            .eq('product_id', productId)
            .eq('image_id', imageId);
        if (error) throw error;
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
