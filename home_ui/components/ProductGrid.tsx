// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProducts, Product } from '../services/supabase';

// Fallback products for spare parts
const fallbackProducts: Product[] = [
  {
    id: 1,
    name: 'Lọc dầu động cơ HOWO A7',
    code: 'LDDC-A7',
    price: 350000,
    price_bulk: 300000,
    total: 50,
    category_id: 2,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600',
    description: 'Phụ tùng động cơ',
  },
  {
    id: 2,
    name: 'Má phanh SITRAK G7',
    code: 'MPH-G7S',
    price: 850000,
    price_bulk: 750000,
    total: 30,
    category_id: 5,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600',
    description: 'Phụ tùng phanh',
  },
  {
    id: 3,
    name: 'Bơm thủy lực cabin HOWO',
    code: 'BTL-HW',
    price: 2500000,
    price_bulk: 2200000,
    total: 15,
    category_id: 1,
    image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=600',
    description: 'Phụ tùng cabin',
  },
  {
    id: 4,
    name: 'Đĩa ly hợp SITRAK C7H',
    code: 'DLH-C7H',
    price: 1800000,
    price_bulk: 1600000,
    total: 25,
    category_id: 3,
    image: 'https://images.unsplash.com/photo-1635784440093-7b2f0c4a6b69?auto=format&fit=crop&q=80&w=600',
    description: 'Phụ tùng ly hợp',
  },
  {
    id: 5,
    name: 'Gương chiếu hậu HOWO TX',
    code: 'GCH-TX',
    price: 650000,
    price_bulk: 550000,
    total: 40,
    category_id: 1,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=600',
    description: 'Phụ tùng cabin',
  },
  {
    id: 6,
    name: 'Bộ lọc gió động cơ',
    code: 'BLG-DC',
    price: 280000,
    price_bulk: 240000,
    total: 80,
    category_id: 2,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600',
    description: 'Phụ tùng động cơ',
  }
];

// Loading skeleton component
const ProductSkeleton: React.FC = () => (
  <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-gray-700" />
    <div className="p-8 space-y-6">
      <div>
        <div className="h-7 bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-700 rounded w-2/3" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
      </div>
      <div className="h-12 bg-gray-700 rounded-2xl" />
    </div>
  </div>
);

// Get image URL
const getImageUrl = (product: Product): string => {
  if (!product.image) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600';
  }
  if (product.image.startsWith('http')) {
    return product.image;
  }
  return `https://irncljhvsjtohiqllnsv.supabase.co/storage/v1/object/public/products/${product.image}`;
};

// Format price to Vietnamese currency
const formatPrice = (price: number): string => {
  if (!price || price === 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

export const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.length > 0 ? data : fallbackProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Không thể tải sản phẩm');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background text */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-[20vw] font-bold text-white/[0.02] select-none pointer-events-none whitespace-nowrap uppercase italic">
        Spare Parts • Phụ Tùng
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-bold tracking-[0.3em] text-sm uppercase mb-3 block">Danh Mục Phụ Tùng</span>
            <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tighter">Sản Phẩm <span className="text-primary italic">Bán Chạy</span></h2>
          </motion.div>
          {/* @ts-ignore */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm hover:border-primary transition-all"
          >
            Tất cả phụ tùng
            <span className="material-symbols-outlined text-primary">grid_view</span>
          </motion.button>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center text-yellow-500 mb-8 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            {displayProducts.slice(0, 6).map((product, idx) => (
              // @ts-ignore
              <motion.div
                key={product.id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group relative bg-surface/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/40 transition-all duration-500 shadow-2xl"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute top-6 left-6 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    {product.code || 'Mới'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-white text-xl font-bold group-hover:text-primary transition-colors tracking-tight">{product.name}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">{product.description || 'Phụ tùng chính hãng'}</p>
                  </div>

                  <div className="space-y-3">
                    {product.price > 0 && (
                      <div className="flex items-center gap-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        Giá lẻ: <span className="text-white font-bold">{formatPrice(product.price)}</span>
                      </div>
                    )}
                    {product.price_bulk > 0 && (
                      <div className="flex items-center gap-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        Giá sỉ: <span className="text-green-400 font-bold">{formatPrice(product.price_bulk)}</span>
                      </div>
                    )}
                    {product.total > 0 && (
                      <div className="flex items-center gap-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        Còn: {product.total} sản phẩm
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-grow py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-primary/20">
                      Đặt Hàng
                    </button>
                    <button className="size-12 rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all">
                      <span className="material-symbols-outlined text-xl">call</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
