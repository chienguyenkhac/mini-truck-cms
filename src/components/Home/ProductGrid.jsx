import { useRef, useEffect, useMemo, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { getProducts, getImageUrl } from '../../services/supabase'

// Fallback products for spare parts
const fallbackProducts = [
    {
        id: 1,
        name: 'Lọc dầu động cơ HOWO A7',
        code: 'LDDC-A7',
        description: 'Phụ tùng động cơ',
        price: 350000,
        price_bulk: 300000,
        image: null,
    },
    {
        id: 2,
        name: 'Má phanh SITRAK G7',
        code: 'MPH-G7S',
        description: 'Phụ tùng phanh',
        price: 850000,
        price_bulk: 750000,
        image: null,
    },
    {
        id: 3,
        name: 'Bơm thủy lực cabin HOWO',
        code: 'BTL-HW',
        description: 'Phụ tùng cabin',
        price: 2500000,
        price_bulk: 2200000,
        image: null,
    }
]

// Format price
const formatPrice = (price) => {
    if (!price || price === 0) return 'Liên hệ'
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

// Optimized TiltCard
const TiltCard = ({ children, className }) => {
    const cardRef = useRef(null)
    const boundRef = useRef(null)
    const rafRef = useRef(null)

    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current || !boundRef.current) return
        if (rafRef.current) return

        rafRef.current = requestAnimationFrame(() => {
            const rect = boundRef.current
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const centerX = rect.width / 2
            const centerY = rect.height / 2
            const rotateX = ((y - centerY) / centerY) * -6
            const rotateY = ((x - centerX) / centerX) * 6

            cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
            rafRef.current = null
        })
    }, [])

    const handleMouseEnter = useCallback((e) => {
        boundRef.current = e.currentTarget.getBoundingClientRect()
    }, [])

    const handleMouseLeave = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        if (cardRef.current) {
            cardRef.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'
        }
    }, [])

    return (
        <div
            ref={cardRef}
            className={`${className} will-change-transform`}
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    )
}

const ProductGrid = () => {
    const containerRef = useRef(null)
    const hasAnimated = useRef(false)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch products from Supabase
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getProducts(20, false, { orderBy: 'created_at', ascending: false })
                setProducts(data.length > 0 ? data : fallbackProducts)
            } catch (err) {
                console.error('Error loading products:', err)
                setProducts(fallbackProducts)
            } finally {
                setLoading(false)
            }
        }
        loadProducts()
    }, [])

    useEffect(() => {
        if (!containerRef.current || hasAnimated.current || loading) return
        const cards = containerRef.current.querySelectorAll('.product-card')

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true
                    gsap.fromTo(cards,
                        { y: 40, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
                    )
                    observer.disconnect()
                }
            },
            { threshold: 0.15 }
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [loading])

    const displayProducts = products.length > 0 ? products : fallbackProducts

    const productCards = useMemo(() => displayProducts.map((p, idx) => (
        <Link
            key={p.id || idx}
            to={`/product/${p.id}`}
            className="product-card group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-primary/40 transition-colors duration-300 shadow-sm hover:shadow-lg opacity-0 flex flex-col h-full will-change-transform"
        >
            <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-200">
                {p.image ? (
                    <img
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-7xl text-gray-300">settings</span>
                    </div>
                )}
                {p.manufacturer_code && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        {p.manufacturer_code}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-50"></div>
            </div>

            <div className="p-3 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="text-slate-800 font-bold text-base group-hover:text-primary transition-colors line-clamp-2 min-h-[2.8rem]">{p.name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{p.description || 'Phụ tùng chính hãng'}</p>
                </div>

                <div className="flex gap-2 mt-auto pt-3">
                    <div className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:border-primary hover:text-primary transition-all flex items-center justify-center">
                        Chi Tiết
                    </div>
                    <a
                        href="tel:0382890990"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 bg-amber-500 text-white font-medium text-sm rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center"
                    >
                        Đặt Hàng
                    </a>
                </div>
            </div>
        </Link>
    )), [displayProducts])

    return (
        <section className="py-10 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2 block">Danh mục phụ tùng</span>
                        <h2 className="text-slate-800 text-4xl md:text-5xl font-bold tracking-tight">Sản Phẩm Bán Chạy</h2>
                    </div>
                    <Link
                        to="/products"
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium text-sm hover:border-primary/50 transition-colors shadow-sm"
                    >
                        Tất cả phụ tùng
                        <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-3xl overflow-hidden animate-pulse">
                                <div className="aspect-[16/10] bg-slate-200" />
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                                    <div className="h-10 bg-slate-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {productCards}
                    </div>
                )}
            </div>
        </section>
    )
}

export default ProductGrid
