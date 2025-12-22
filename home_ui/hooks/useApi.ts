// Custom React hooks for API data fetching
import { useState, useEffect, useCallback } from 'react';
import { productService, categoryService, Product, Category, PaginationMeta } from '../services/api';

// Hook for fetching products with pagination
export const useProducts = (initialParams?: {
    page?: number;
    per_page?: number;
    category_id?: number;
    search?: string;
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (params = initialParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productService.getAll(params);
            if (response.success) {
                setProducts(response.data);
                setMeta(response.meta || null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, meta, loading, error, refetch: fetchProducts };
};

// Hook for featured products
export const useFeaturedProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await productService.getFeatured();
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    return { products, loading, error };
};

// Hook for categories
export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll();
                if (response.success) {
                    setCategories(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
};

// Hook for single product
export const useProduct = (id: number) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productService.getById(id);
                if (response.success) {
                    setProduct(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Product not found');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    return { product, loading, error };
};
