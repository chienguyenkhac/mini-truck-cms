
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a0f0f] border-t border-border pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="size-10 text-primary">
                <span className="material-symbols-outlined text-4xl font-bold">local_shipping</span>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed text-sm max-w-sm">
              Đơn vị ủy quyền chính thức phân phối các dòng xe tải nặng Sinotruk tại Việt Nam. Cam kết chất lượng cao, phụ tùng chính hãng và dịch vụ 24/7.
            </p>

            <div className="flex gap-4">
              {['public', 'mail', 'location_on'].map((icon, i) => (
                <a key={i} href="#" className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-10">
            <div>
              <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-widest text-sm">Sản Phẩm</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                {['Xe Ben HOWO', 'Xe Đầu Kéo SITRAK', 'Xe Trộn Bê Tông', 'Sơ Mi Rơ Moóc'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-primary transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-widest text-sm">Hỗ Trợ</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                {['Dịch vụ bảo hành', 'Phụ tùng chính hãng', 'Tư vấn tài chính', 'Liên hệ'].map((link) => (
                  <li key={link}><a href="#" className="hover:text-primary transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-white font-bold text-lg uppercase tracking-widest text-sm">Đăng Ký Nhận Tin</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-grow bg-white/5 border border-border rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-primary transition-all"
              />
              <button className="bg-primary hover:bg-red-600 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-lg shadow-primary/20">
                Gửi
              </button>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
              <span className="material-symbols-outlined text-primary text-3xl">call</span>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Hotline 24/7</p>
                <p className="text-white font-bold text-lg">0988.xxx.xxx</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-sm">© 2024 Phụ Tùng Chính Hãng.</p>
          <div className="flex gap-10 text-xs text-gray-600 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-white transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
