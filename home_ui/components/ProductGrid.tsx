
import React from 'react';
import { motion } from 'framer-motion';
import { useFeaturedProducts } from '../hooks/useApi';
import { Product } from '../services/api';

// Fallback products for when API is not available
const fallbackProducts = [
  {
    id: 1,
    name: 'HOWO MAX 2024',
    code: 'HOWO-MAX',
    type: 'Động cơ 460HP - Cabin MAX',
    image: 'https://images.unsplash.com/photo-1586864387917-f579ae0eadd3?auto=format&fit=crop&q=80&w=600',
    price: 0,
    price_bulk: 0,
    total: 0,
  },
  {
    id: 2,
    name: 'SITRAK G7S',
    code: 'SITRAK-G7S',
    type: 'Chuẩn Châu Âu - Bền bỉ',
    image: 'https://images.unsplash.com/photo-1591768793355-74d7af23f116?auto=format&fit=crop&q=80&w=600',
    price: 0,
    price_bulk: 0,
    total: 0,
  },
  {
    id: 3,
    name: 'HOWO TX Mixer',
    code: 'HOWO-TX',
    type: 'Bồn trộn chuyên dụng 12m3',
    image: 'https://images.unsplash.com/photo-1517524285303-d6fc683dddf8?auto=format&fit=crop&q=80&w=600',
    price: 0,
    price_bulk: 0,
    total: 0,
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

// Get image URL - handles both local and remote images
const getImageUrl = (product: Product | typeof fallbackProducts[0]): string => {
  if (!product.image) {
    return 'https://images.unsplash.com/photo-1586864387917-f579ae0eadd3?auto=format&fit=crop&q=80&w=600';
  }
  // If it's already a full URL, use it
  if (product.image.startsWith('http')) {
    return product.image;
  }
  // Otherwise, prepend the API base URL
  return `https://dongha.sinotruk-hanoi.com/${product.image}`;
};

// Format price to Vietnamese currency
const formatPrice = (price: number): string => {
  if (!price || price === 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const ProductGrid: React.FC = () => {
  const { products: apiProducts, loading, error } = useFeaturedProducts();

  // Use API products if available, otherwise use fallback
  const displayProducts = apiProducts.length > 0 ? apiProducts : fallbackProducts;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background text */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-[20vw] font-bold text-white/[0.02] select-none pointer-events-none whitespace-nowrap uppercase italic">
        Heavy Duty • Truck
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-bold tracking-[0.3em] text-sm uppercase mb-3 block">Showroom Trực Tuyến</span>
            <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tighter">Sản Phẩm <span className="text-primary italic">Nổi Bật</span></h2>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm hover:border-primary transition-all"
          >
            Tất cả sản phẩm
            <span className="material-symbols-outlined text-primary">grid_view</span>
          </motion.button>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center text-yellow-500 mb-8 text-sm">
            ⚠️ Đang hiển thị dữ liệu mẫu. {error}
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
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[40%] group-hover:grayscale-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586864387917-f579ae0eadd3?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute top-6 left-6 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    {product.code || 'Mới'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>

                  {/* 3D Visualizer Overlay Trigger */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-4 bg-primary rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                      <span className="material-symbols-outlined text-white text-3xl">view_in_ar</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-white text-2xl font-bold group-hover:text-primary transition-colors tracking-tight">{product.name}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">{product.type}</p>
                  </div>

                  <div className="space-y-3">
                    {'price' in product && product.price > 0 && (
                      <div className="flex items-center gap-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        Giá lẻ: {formatPrice(product.price)}
                      </div>
                    )}
                    {'price_bulk' in product && product.price_bulk > 0 && (
                      <div className="flex items-center gap-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        Giá sỉ: {formatPrice(product.price_bulk)}
                      </div>
                    )}
                    {'total' in product && product.total > 0 && (
                      <div className="flex items-center gap-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        Tồn kho: {product.total} sản phẩm
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-grow py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-primary/20">
                      Báo Giá
                    </button>
                    <button className="size-12 rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all">
                      <span className="material-symbols-outlined text-xl">favorite</span>
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
