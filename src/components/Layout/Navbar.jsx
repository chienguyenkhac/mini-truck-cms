import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { supabase } from '../../services/supabase'

const Navbar = ({ isScrolled }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [openDropdown, setOpenDropdown] = useState(null)
    const [categories, setCategories] = useState([])
    const location = useLocation()
    const logoRef = useRef(null)
    const navRef = useRef(null)

    // Load categories from database
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name')
                if (!error && data) {
                    setCategories(data)
                }
            } catch (err) {
                console.error('Error loading categories:', err)
            }
        }
        loadCategories()
    }, [])

    const menuItems = [
        { path: '/', label: 'Trang chủ' },
        { path: '/about', label: 'Giới thiệu' },
        {
            path: '/products',
            label: 'Phụ tùng bộ phận',
            dropdownType: 'categories'
        },
        { path: '/catalog', label: 'Catalog' },
        { path: '/image-library', label: 'Thư viện ảnh' },
        { path: '/contact', label: 'Liên hệ' },
    ]

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path.split('?')[0])
    }

    useEffect(() => {
        const logo = logoRef.current
        if (!logo) return

        const handleMouseMove = (e) => {
            const rect = logo.getBoundingClientRect()
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2
            const y = (e.clientY - rect.top - rect.height / 2) * 0.2
            gsap.to(logo, { x, y, duration: 0.3, ease: 'power2.out' })
        }

        const handleMouseLeave = () => {
            gsap.to(logo, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
        }

        logo.addEventListener('mousemove', handleMouseMove)
        logo.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            logo.removeEventListener('mousemove', handleMouseMove)
            logo.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    useEffect(() => {
        if (!navRef.current) return
        const links = navRef.current.querySelectorAll('a, button')
        gsap.fromTo(links,
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
        )
    }, [])

    return (
        <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border py-3 shadow-lg' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-4 md:px-10 lg:px-20 flex items-center justify-between">
                {/* Logo */}
                <Link ref={logoRef} to="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 text-primary transition-transform group-hover:scale-110 group-hover:rotate-12 duration-300">
                        <span className="material-symbols-outlined text-4xl font-bold">local_shipping</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-800 text-xl font-bold tracking-tight leading-none uppercase">Sinotruk</span>
                        <span className="text-primary text-[10px] font-bold tracking-[0.2em] leading-none uppercase">Hà Nội</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav ref={navRef} className="hidden lg:flex items-center gap-6">
                    {menuItems.map((item, i) => (
                        item.dropdownType === 'categories' ? (
                            <div
                                key={i}
                                className="relative"
                                onMouseEnter={() => setOpenDropdown(i)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <button
                                    className={`text-sm font-medium transition-colors relative group flex items-center gap-1 py-2 ${isActive(item.path) ? 'text-primary' : 'text-slate-700 hover:text-primary'}`}
                                >
                                    {item.label}
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>
                                {openDropdown === i && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-full left-0 pt-1 min-w-[180px]"
                                    >
                                        <div className="bg-white rounded-xl shadow-xl border border-slate-200 py-2">
                                            <Link
                                                to="/products"
                                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors font-medium"
                                            >
                                                Tất cả phụ tùng
                                            </Link>
                                            <div className="h-px bg-slate-100 my-1"></div>
                                            {categories.map((cat) => (
                                                <Link
                                                    key={cat.id}
                                                    to={`/products?category=${cat.id}`}
                                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors"
                                                >
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <Link
                                key={item.path + i}
                                to={item.path}
                                className={`text-sm font-medium transition-colors relative group py-2 ${isActive(item.path) ? 'text-primary' : 'text-slate-700 hover:text-primary'}`}
                            >
                                {item.label}
                                <span className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300 ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                            </Link>
                        )
                    ))}
                </nav>

                {/* CTA Button */}
                <Link
                    to="/contact"
                    className="hidden sm:flex items-center gap-2 px-5 py-2 bg-primary hover:brightness-110 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95"
                >
                    Nhận Báo Giá
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden text-slate-700 p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined text-3xl">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="lg:hidden bg-surface border-t border-border mt-3"
                >
                    <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
                        {menuItems.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {item.dropdownType === 'categories' ? (
                                    <div className="py-2 border-b border-border/50">
                                        <span className="text-lg font-medium text-slate-700">{item.label}</span>
                                        <div className="mt-2 pl-4 space-y-2">
                                            <Link
                                                to="/products"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block text-slate-500 hover:text-primary"
                                            >
                                                Tất cả phụ tùng
                                            </Link>
                                            {categories.map((cat) => (
                                                <Link
                                                    key={cat.id}
                                                    to={`/products?category=${cat.id}`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="block text-slate-500 hover:text-primary"
                                                >
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`text-lg font-medium py-2 border-b border-border/50 block ${isActive(item.path) ? 'text-primary' : 'text-slate-700'}`}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                to="/contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg"
                            >
                                Nhận Báo Giá
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </motion.div>
                    </nav>
                </motion.div>
            )}
        </header>
    )
}

export default Navbar
