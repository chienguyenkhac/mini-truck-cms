
import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000")' }}>
      <div className="absolute inset-0 bg-black/85"></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <h2 className="text-primary font-bold text-lg mb-6 tracking-[0.4em] uppercase">Về Chúng Tôi</h2>
        <h3 className="text-white text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">Tiên Phong Công Nghệ <br/> Dẫn Lối Thành Công</h3>
        <p className="text-gray-300 text-lg md:text-xl mb-16 leading-relaxed">
          Với hơn 15 năm hình thành và phát triển, SINOTRUK HÀ NỘI tự hào là đơn vị phân phối hàng đầu các dòng xe tải nặng. Chúng tôi cam kết mang đến giải pháp vận tải tối ưu, tiết kiệm chi phí và dịch vụ hậu mãi chuyên nghiệp nhất.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {[
            { label: 'Chính Hãng 100%', icon: 'verified_user' },
            { label: 'Bảo Hành Uy Tín', icon: 'handyman' },
            { label: 'Giá Cạnh Tranh', icon: 'savings' }
          ].map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/30 text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-primary/40 group-hover:-translate-y-2">
                <span className="material-symbols-outlined text-4xl">{item.icon}</span>
              </div>
              <p className="text-white font-bold text-lg">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic background element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
};
