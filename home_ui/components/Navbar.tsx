
import React from 'react';

interface NavbarProps {
  isScrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isScrolled }) => {
  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border py-3 shadow-lg' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-10 lg:px-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 text-primary transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-4xl font-bold">local_shipping</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xl font-bold tracking-tight leading-none uppercase">Sinotruk</span>
            <span className="text-primary text-[10px] font-bold tracking-[0.2em] leading-none uppercase">Hà Nội</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          {['Trang chủ', 'Sản phẩm', 'Dịch vụ', 'Tin tức', 'Liên hệ'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-white text-sm font-medium hover:text-primary transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        <button className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
          Nhận Báo Giá
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>

        <button className="lg:hidden text-white">
          <span className="material-symbols-outlined text-3xl">menu</span>
        </button>
      </div>
    </header>
  );
};
