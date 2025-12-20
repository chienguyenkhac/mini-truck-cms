
import React from 'react';

export const VideoSection: React.FC = () => {
  return (
    <section className="py-24 bg-surface/50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-10 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-primary font-bold tracking-[0.3em] uppercase text-sm">
              <span className="w-12 h-[2px] bg-primary"></span>
              Video Giới Thiệu
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.1]">
              Trải Nghiệm Sức Mạnh <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">Không Giới Hạn</span>
            </h2>
            
            <p className="text-gray-400 text-xl leading-relaxed">
              Tận mắt chứng kiến khả năng vận hành vượt trội của các dòng xe tải hạng nặng Sinotruk trên mọi địa hình hiểm trở nhất.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'Chất Lượng 4K', desc: 'Hình ảnh sắc nét chân thực', icon: 'hd' },
                { title: 'Góc Nhìn 360', desc: 'Chi tiết mọi bộ phận', icon: '360' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary rounded-xl text-white font-bold transition-all group w-fit">
              Khám Phá Kênh Youtube
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">open_in_new</span>
            </button>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/30 transition-all"></div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-black/40 cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=1200" 
                alt="Truck cinematic" 
                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
                  <button className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl transform transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-5xl ml-1 fill-1">play_arrow</span>
                  </button>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between text-white/60 text-xs font-bold uppercase tracking-widest">
                  <span>Showcase 2024</span>
                  <span>04:20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
