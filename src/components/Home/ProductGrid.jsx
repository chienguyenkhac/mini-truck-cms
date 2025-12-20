import { useRef, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { IMAGES } from '../../constants/images'

const products = [
    {
        name: 'HOWO MAX 2024',
        subtitle: 'Động cơ 460HP - Cabin MAX',
        tag: 'Flagship',
        tagColor: 'bg-primary',
        image: IMAGES.trucks.howoMax,
        features: ['Hệ thống treo khí nén', 'Ghế massage hiện đại'],
        category: 'howo-a7'
    },
    {
        name: 'SITRAK G7S',
        subtitle: 'Chuẩn Châu Âu - Bền bỉ',
        tag: 'Premium',
        tagColor: 'bg-blue-600',
        image: IMAGES.trucks.sitrakG7S,
        features: ['Phanh đĩa EBS/ESC', 'Tiết kiệm 5% dầu'],
        category: 'sitrak'
    },
    {
        name: 'HOWO TX Mixer',
        subtitle: 'Bồn trộn chuyên dụng 12m3',
        tag: 'Reliable',
        tagColor: 'bg-green-600',
        image: IMAGES.trucks.howoMixer,
        features: ['Thép cường lực K400', 'Bơm thủy lực Eaton'],
        category: 'howo-ben'
    }
]

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

    useEffect(() => {
        if (!containerRef.current || hasAnimated.current) return
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
    }, [])

    const productCards = useMemo(() => products.map((p, idx) => (
        <TiltCard
            key={idx}
            className="product-card group relative bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-primary/40 transition-colors duration-300 shadow-xl opacity-0"
        >
            <div className="aspect-[16/10] overflow-hidden relative">
                <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0"
                />
                <div className={`absolute top-5 left-5 ${p.tagColor} text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg`}>
                    {p.tag}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-50"></div>
            </div>

            <div className="p-6 space-y-4">
                <div>
                    <h3 className="text-white text-xl font-bold group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{p.subtitle}</p>
                </div>

                <div className="space-y-2">
                    {p.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-400 text-xs">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            {f}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 pt-2">
                    <Link
                        to={`/products/${p.category}`}
                        className="flex-grow py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wide hover:bg-red-600 transition-colors text-center"
                    >
                        Xem Chi Tiết
                    </Link>
                    <button className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-colors">
                        <span className="material-symbols-outlined text-lg">favorite</span>
                    </button>
                </div>
            </div>
        </TiltCard>
    )), [])

    return (
        <section className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2 block">Showroom</span>
                        <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tight">Xe Tải Nặng</h2>
                    </div>
                    <Link
                        to="/products"
                        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium text-sm hover:border-primary/50 transition-colors"
                    >
                        Tất cả
                        <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
                    </Link>
                </div>

                <div ref={containerRef} className="grid md:grid-cols-3 gap-8">
                    {productCards}
                </div>
            </div>
        </section>
    )
}

export default ProductGrid
