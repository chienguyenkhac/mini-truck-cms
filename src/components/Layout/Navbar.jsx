import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

const Navbar = ({ isScrolled }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const logoRef = useRef(null)
    const navRef = useRef(null)

    const menuItems = [
        { path: '/', label: 'Trang chủ' },
        { path: '/products', label: 'Sản phẩm' },
        { path: '/about', label: 'Giới thiệu' },
        { path: '/catalog', label: 'Catalog' },
        { path: '/image-library', label: 'Thư viện ảnh' },
        { path: '/contact', label: 'Liên hệ' },
    ]

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    // Logo magnetic effect
    useEffect(() => {
        const logo = logoRef.current
        if (!logo) return

        const handleMouseMove = (e) => {
            const rect = logo.getBoundingClientRect()
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2
            const y = (e.clientY - rect.top - rect.height / 2) * 0.2

            gsap.to(logo, {
                x,
                y,
                duration: 0.3,
                ease: 'power2.out'
            })
        }

        const handleMouseLeave = () => {
            gsap.to(logo, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            })
        }

        logo.addEventListener('mousemove', handleMouseMove)
        logo.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            logo.removeEventListener('mousemove', handleMouseMove)
            logo.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    // Nav links stagger animation
    useEffect(() => {
        if (!navRef.current) return
        const links = navRef.current.querySelectorAll('a')

        gsap.fromTo(links,
            { y: -20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power2.out',
                delay: 0.3
            }
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
                        <span className="text-white text-xl font-bold tracking-tight leading-none uppercase">Sinotruk</span>
                        <span className="text-primary text-[10px] font-bold tracking-[0.2em] leading-none uppercase">Hà Nội</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav ref={navRef} className="hidden lg:flex items-center gap-10">
                    {menuItems.map((item, i) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`text-sm font-medium transition-colors relative group ${isActive(item.path) ? 'text-primary' : 'text-white hover:text-primary'}`}
                        >
                            {item.label}
                            <span className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300 ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </Link>
                    ))}
                </nav>

                {/* CTA Button with glow effect */}
                <Link
                    to="/contact"
                    className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 relative overflow-hidden group"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-primary to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%] animate-shimmer"></span>
                    <span className="relative flex items-center gap-2">
                        Nhận Báo Giá
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
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
                                key={item.path}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-lg font-medium py-2 border-b border-border/50 block ${isActive(item.path) ? 'text-primary' : 'text-white'}`}
                                >
                                    {item.label}
                                </Link>
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
