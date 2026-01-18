import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { supabase } from '../../services/supabase'

const Navbar = ({ isScrolled }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [openDropdown, setOpenDropdown] = useState(null)
    const [openMobileDropdown, setOpenMobileDropdown] = useState(null)
    const [vehicleCategories, setVehicleCategories] = useState([])
    const [partCategories, setPartCategories] = useState([])
    const [siteSettings, setSiteSettings] = useState({ company_logo: '', company_name: 'SINOTRUK Hà Nội' })
    const location = useLocation()
    const logoRef = useRef(null)
    const navRef = useRef(null)

    // Fix scroll lock issue on mobile
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen])

    // Load categories and site settings from database
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load categories
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name')
                if (!catError && catData) {
                    setVehicleCategories(catData.filter(c => c.is_vehicle_name))
                    setPartCategories(catData.filter(c => !c.is_vehicle_name))
                }

                // Load site settings
                const { data: settingsData, error: settingsError } = await supabase
                    .from('site_settings')
                    .select('*')
                if (!settingsError && settingsData) {
                    const settings = {}
                    settingsData.forEach(s => {
                        settings[s.key] = s.value
                    })
                    setSiteSettings(settings)
                }
            } catch (err) {
                console.error('Error loading data:', err)
            }
        }
        loadData()
    }, [])

    const menuItems = [
        { path: '/', label: 'TRANG CHỦ' },
        { path: '/about', label: 'GIỚI THIỆU' },
        {
            label: 'PHỤ TÙNG THEO XE',
            dropdownType: 'vehicle'
        },
        {
            label: 'PHỤ TÙNG BỘ PHẬN',
            dropdownType: 'parts'
        },
        { path: '/catalog', label: 'CATALOG' },
        { path: '/image-library', label: 'THƯ VIỆN ẢNH' },
        { path: '/contact', label: 'LIÊN HỆ' },
    ]

    const isActive = (path) => {
        if (!path) return false
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

    const getDropdownItems = (type) => {
        if (type === 'vehicle') return vehicleCategories
        if (type === 'parts') return partCategories
        return []
    }

    return (
        <>
            <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border py-3 shadow-lg' : 'bg-transparent py-5'}`}>
                <div className="container mx-auto px-4 md:px-10 lg:px-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link ref={logoRef} to="/" className="group cursor-pointer">
                        {siteSettings.company_logo && (
                            <img src={siteSettings.company_logo} alt="Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-110 duration-300" />
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav ref={navRef} className="hidden lg:flex items-center gap-5">
                        {menuItems.map((item, i) => (
                            item.dropdownType ? (
                                <div
                                    key={i}
                                    className="relative"
                                    onMouseEnter={() => setOpenDropdown(i)}
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <button
                                        className={`text-sm font-medium transition-colors relative group flex items-center gap-1 py-2 ${location.pathname.includes('/products') ? 'text-primary' : 'text-slate-700 hover:text-primary'}`}
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
                                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors font-medium uppercase"
                                                >
                                                    TẤT CẢ
                                                </Link>
                                                <div className="h-px bg-slate-100 my-1"></div>
                                                {getDropdownItems(item.dropdownType).map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        to={`/products?category=${cat.id}`}
                                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors uppercase"
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                ))}
                                                {getDropdownItems(item.dropdownType).length === 0 && (
                                                    <p className="px-4 py-2 text-xs text-slate-400">Chưa có danh mục</p>
                                                )}
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
            </header>

            {/* Mobile Menu - Moved outside header, higher z-index, and more robust scrolling */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl overflow-y-auto overscroll-contain"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col h-full pt-20 pb-10">
                                <nav className="px-6 flex flex-col gap-2">
                                    {menuItems.map((item, i) => (
                                        <div key={i}>
                                            {item.dropdownType ? (
                                                <div className="py-2 border-b border-border/50">
                                                    <button
                                                        onClick={() => setOpenMobileDropdown(openMobileDropdown === i ? null : i)}
                                                        className="w-full flex items-center justify-between text-lg font-medium text-slate-700 py-1"
                                                    >
                                                        {item.label}
                                                        <span className={`material-symbols-outlined transition-transform duration-300 ${openMobileDropdown === i ? 'rotate-180' : ''}`}>
                                                            expand_more
                                                        </span>
                                                    </button>
                                                    <AnimatePresence>
                                                        {openMobileDropdown === i && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="mt-2 pl-4 space-y-3 pb-2 border-l-2 border-primary/20 ml-1">
                                                                    <Link
                                                                        to="/products"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="block text-slate-500 hover:text-primary py-1"
                                                                    >
                                                                        Tất cả
                                                                    </Link>
                                                                    {getDropdownItems(item.dropdownType).map((cat) => (
                                                                        <Link
                                                                            key={cat.id}
                                                                            to={`/products?${item.dropdownType === 'vehicle' ? 'vehicle' : 'category'}=${cat.id}`}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="block text-slate-500 hover:text-primary py-1"
                                                                        >
                                                                            {cat.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ) : (
                                                <Link
                                                    to={item.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`text-lg font-medium py-3 border-b border-border/50 block ${isActive(item.path) ? 'text-primary' : 'text-slate-700'}`}
                                                >
                                                    {item.label}
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                    <div className="mt-6">
                                        <Link
                                            to="/contact"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                                        >
                                            Nhận Báo Giá
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </Link>
                                    </div>
                                </nav>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar
