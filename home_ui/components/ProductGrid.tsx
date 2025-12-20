
import React from 'react';
import { motion } from 'framer-motion';

const products = [
  {
    name: 'HOWO MAX 2024',
    subtitle: 'Động cơ 460HP - Cabin MAX',
    tag: 'Flagship',
    tagColor: 'bg-primary',
    image: 'https://images.unsplash.com/photo-1586864387917-f579ae0eadd3?auto=format&fit=crop&q=80&w=600',
    features: ['Hệ thống treo khí nén', 'Ghế massage hiện đại']
  },
  {
    name: 'SITRAK G7S',
    subtitle: 'Chuẩn Châu Âu - Bền bỉ',
    tag: 'Premium',
    tagColor: 'bg-blue-600',
    image: 'https://images.unsplash.com/photo-1591768793355-74d7af23f116?auto=format&fit=crop&q=80&w=600',
    features: ['Phanh đĩa EBS/ESC', 'Tiết kiệm 5% dầu']
  },
  {
    name: 'HOWO TX Mixer',
    subtitle: 'Bồn trộn chuyên dụng 12m3',
    tag: 'Reliable',
    tagColor: 'bg-green-600',
    image: 'https://images.unsplash.com/photo-1517524285303-d6fc683dddf8?auto=format&fit=crop&q=80&w=600',
    features: ['Thép cường lực K400', 'Bơm thủy lực Eaton']
  }
];

export const ProductGrid: React.FC = () => {
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
            <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tighter">Bảng Giá <span className="text-primary italic">Xe Tải Nặng</span></h2>
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

        <div className="grid md:grid-cols-3 gap-10">
          {products.map((p, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative bg-surface/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/40 transition-all duration-500 shadow-2xl"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[40%] group-hover:grayscale-0"
                />
                <div className={`absolute top-6 left-6 ${p.tagColor} text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {p.tag}
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
                  <h3 className="text-white text-2xl font-bold group-hover:text-primary transition-colors tracking-tight">{p.name}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">{p.subtitle}</p>
                </div>
                
                <div className="space-y-3">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-400 text-xs font-medium uppercase tracking-wider">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      {f}
                    </div>
                  ))}
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
      </div>
    </section>
  );
};
