
import React from 'react';
import { useCategories } from '../hooks/useApi';

// Fallback categories for when API is not available
const fallbackCategories = [
  {
    id: 1,
    name: 'Xe Ben (Dump Trucks)',
    products_count: 0,
    img: 'https://images.unsplash.com/photo-1599815470591-64e030bc674f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    name: 'Xe Đầu Kéo (Tractor Units)',
    products_count: 0,
    img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    name: 'Xe Tải Thùng (Cargo Trucks)',
    products_count: 0,
    img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'
  }
];

// Loading skeleton
const CategorySkeleton: React.FC = () => (
  <div className="group cursor-pointer animate-pulse">
    <div className="relative overflow-hidden rounded-[2rem] mb-6 shadow-2xl">
      <div className="aspect-[4/5] bg-gray-700" />
    </div>
    <div className="text-center px-4">
      <div className="h-7 bg-gray-700 rounded w-3/4 mx-auto mb-2" />
      <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto" />
    </div>
  </div>
);

export const CategorySection: React.FC = () => {
  const { categories: apiCategories, loading, error } = useCategories();

  // Use API categories if available, otherwise use fallback
  const displayCategories = apiCategories.length > 0
    ? apiCategories.map((cat, i) => ({
      ...cat,
      img: fallbackCategories[i]?.img || fallbackCategories[0].img
    }))
    : fallbackCategories;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-10 lg:px-20">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Danh Mục Sản Phẩm</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-lg shadow-primary/40"></div>
        </div>

        {error && (
          <div className="text-center text-yellow-500 mb-8 text-sm">
            ⚠️ Đang hiển thị danh mục mẫu
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => <CategorySkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {displayCategories.slice(0, 6).map((cat) => (
              <div key={cat.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-[2rem] mb-6 shadow-2xl">
                  <div className="aspect-[4/5] relative">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                        Khám Phá Ngay
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-center px-4">
                  <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{cat.name}</h4>
                  <p className="text-gray-500 text-sm font-medium">
                    {cat.products_count ? `${cat.products_count} sản phẩm` : 'Xem sản phẩm'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
