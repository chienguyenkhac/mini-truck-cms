
import React from 'react';

const categories = [
  {
    title: 'Xe Ben (Dump Trucks)',
    desc: 'Đa dạng tải trọng, bền bỉ mọi địa hình',
    img: 'https://images.unsplash.com/photo-1599815470591-64e030bc674f?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Xe Đầu Kéo (Tractor Units)',
    desc: 'Động cơ mạnh mẽ, tiết kiệm nhiên liệu',
    img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Xe Tải Thùng (Cargo Trucks)',
    desc: 'Vận chuyển linh hoạt, hiệu quả cao',
    img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'
  }
];

export const CategorySection: React.FC = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-10 lg:px-20">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Danh Mục Sản Phẩm</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-lg shadow-primary/40"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {categories.map((cat, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-[2rem] mb-6 shadow-2xl">
                <div className="aspect-[4/5] relative">
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
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
                <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{cat.title}</h4>
                <p className="text-gray-500 text-sm font-medium">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
