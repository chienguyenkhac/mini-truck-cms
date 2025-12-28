// @ts-nocheck
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { AbstractTruckScene } from './ThreeDModels';

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full h-screen min-h-[800px] flex items-center overflow-hidden bg-background">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Canvas shadows camera={{ position: [0, 2, 8], fov: 35 }}>
          <Suspense fallback={null}>
            <AbstractTruckScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlays to ensure text readability */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-r from-background via-background/60 to-transparent"></div>
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent"></div>

      <div className="relative z-10 container mx-auto px-4 md:px-10 lg:px-20 py-20">
        <div className="max-w-3xl space-y-8">
          {/* @ts-ignore */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm fill-1">verified</span>
            Phụ tùng chính hãng 100%
          </motion.div>

          {/* @ts-ignore */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-5xl md:text-8xl font-bold leading-[0.9] tracking-tighter"
          >
            SINOTRUK <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400 text-glow">
              HÀ NỘI
            </span>
          </motion.h1>

          {/* @ts-ignore */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed font-light"
          >
            Chuyên cung cấp phụ tùng chính hãng cho xe tải HOWO & SITRAK.
            Đầy đủ linh kiện từ động cơ, hộp số, phanh đến các chi tiết nhỏ nhất.
            Cam kết giá tốt nhất thị trường.
          </motion.p>

          {/* @ts-ignore */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap gap-5 pt-4"
          >
            <button className="flex items-center justify-center h-14 px-10 bg-primary hover:bg-red-600 rounded-xl text-white font-bold transition-all transform hover:-translate-y-1 shadow-2xl shadow-primary/40 group">
              Xem Phụ Tùng
              <span className="material-symbols-outlined ml-2 group-hover:rotate-[360deg] transition-transform duration-700">settings</span>
            </button>
            <button className="flex items-center justify-center h-14 px-10 border border-white/10 hover:border-white hover:bg-white/5 rounded-xl text-white font-bold transition-all group">
              Liên Hệ Ngay
              <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">call</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Floating Interactive hint */}
      {/* @ts-ignore */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-10 bottom-20 hidden xl:block z-20"
      >
        <div className="w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hỗ trợ 24/7</span>
          </div>
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Hotline: 0382.890.990</h4>
          <p className="text-gray-500 text-[10px] leading-tight">Tư vấn miễn phí, giao hàng toàn quốc. Bảo hành chính hãng.</p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Cuộn xuống</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"></div>
      </div>
    </section>
  );
};
