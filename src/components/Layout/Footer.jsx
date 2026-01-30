import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState({
    company_logo: '',
    company_name: 'SINOTRUK Hà Nội',
    hotline: '0382890990',
    address: ''
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
        if (!error && data) {
          const settings = {}
          data.forEach(s => {
            settings[s.key] = s.value
          })
          setSiteSettings(settings)
        }
      } catch (err) {
        console.error('Error loading settings:', err)
      }
    }
    loadSettings()
  }, [])
  return (
    <footer className="bg-gray-200 border-t border-gray-300 pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              {siteSettings.company_logo ? (
                <img src={siteSettings.company_logo} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-10 h-10 text-primary transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-4xl font-bold">local_shipping</span>
                </div>
              )}
            </Link>

            <p className="text-slate-500 leading-relaxed text-sm max-w-sm">
            Chuyên cung cấp phụ tùng chính hãng cho các dòng xe tải HOWO SINOTRUK. Đầy đủ linh kiện từ động cơ, hộp số, gầm, cầu đến các chi tiết nhỏ nhất. Cam kết giá tốt nhất thị trường.
            </p>

            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
              <a href="mailto:hnsinotruk@gmail.com" className="w-12 h-12 rounded-2xl bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-xl">mail</span>
              </a>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-10">
            <div>
              <h4 className="text-slate-800 font-bold mb-8 uppercase tracking-widest text-sm">Phụ Tùng</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                {[
                  { label: 'Phụ tùng động cơ', path: '/products' },
                  { label: 'Phụ tùng phanh', path: '/products' },
                  { label: 'Phụ tùng cabin', path: '/products' },
                  { label: 'Phụ tùng hộp số', path: '/products' },
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
            <a href={`tel:${siteSettings.hotline || '0382890990'}`} className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-3xl">call</span>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Hotline 24/7</p>
                <span className="text-slate-800 font-bold text-lg">{siteSettings.hotline || '0382.890.990'}</span>
              </div>
            </a>
            <a href="mailto:hnsinotruk@gmail.com" className="flex items-center gap-4 p-5 rounded-2xl bg-gray-300 border border-gray-400 hover:border-primary/30 transition-colors">
              <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Email</p>
                <span className="text-slate-800 font-bold text-sm">hnsinotruk@gmail.com</span>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2024 Phụ Tùng Chính Hãng.</p>
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