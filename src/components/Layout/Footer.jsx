import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-200 border-t border-gray-300 pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 text-primary">
                <span className="material-symbols-outlined text-4xl font-bold">local_shipping</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-800 text-2xl font-bold leading-none uppercase">Sinotruk</span>
                <span className="text-primary text-xs font-bold tracking-[0.2em] leading-none uppercase">Hà Nội</span>
              </div>
            </Link>

            <p className="text-slate-500 leading-relaxed text-sm max-w-sm">
              Đơn vị ủy quyền chính thức phân phối các dòng xe tải nặng Sinotruk tại Việt Nam. Cam kết chất lượng cao, phụ tùng chính hãng và dịch vụ 24/7.
            </p>

            <div className="flex gap-4">
              {['public', 'mail', 'location_on'].map((icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-10">
            <div>
              <h4 className="text-slate-800 font-bold mb-8 uppercase tracking-widest text-sm">Sản Phẩm</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                {[
                  { label: 'HOWO A7', path: '/products/howo-a7' },
                  { label: 'HOWO BEN', path: '/products/howo-ben' },
                  { label: 'SITRAK T7H', path: '/products/sitrak' },
                  { label: 'Sơ Mi Rơ Moóc', path: '/products/so-mi-ro-moc' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-slate-800 font-bold mb-8 uppercase tracking-widest text-sm">Hỗ Trợ</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                {[
                  { label: 'Chính sách bảo hành', path: '/about#warranty' },
                  { label: 'Chính sách cung cấp', path: '/about#supply' },
                  { label: 'Thanh toán', path: '/about#payment' },
                  { label: 'Liên hệ', path: '/contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-slate-800 font-bold uppercase tracking-widest text-sm">Liên Hệ Ngay</h4>
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
              <span className="material-symbols-outlined text-primary text-3xl">call</span>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Hotline 24/7</p>
                <a href="tel:0382890990" className="text-slate-800 font-bold text-lg hover:text-primary transition-colors">0382.890.990</a>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-300 border border-gray-400">
              <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Email</p>
                <a href="mailto:hnsinotruk@gmail.com" className="text-slate-800 font-bold text-sm hover:text-primary transition-colors">hnsinotruk@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2024 SINOTRUK HÀ NỘI. Phát triển bởi AI Studio.</p>
          <div className="flex gap-10 text-xs text-slate-500 uppercase tracking-widest font-bold">
            <Link to="/about" className="hover:text-primary transition-colors">Điều khoản</Link>
            <Link to="/about" className="hover:text-primary transition-colors">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer