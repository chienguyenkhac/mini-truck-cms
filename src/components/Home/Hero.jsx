import { Suspense, useEffect, useRef, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { AbstractTruckScene } from '../ThreeDModels'
import { IMAGES } from '../../constants/images'

// Banner images for slideshow
const bannerImages = [
  IMAGES.hero.main,
  IMAGES.hero.secondary,
  IMAGES.hero.tertiary,
]

// Optimized magnetic hook
const useMagnetic = (ref, strength = 0.3) => {
  const rafId = useRef(null)
  const targetPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      targetPos.current.x = (e.clientX - centerX) * strength
      targetPos.current.y = (e.clientY - centerY) * strength

      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        gsap.to(element, {
          x: targetPos.current.x,
          y: targetPos.current.y,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: true
        })
      })
    }

    const handleMouseLeave = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
        overwrite: true
      })
    }

    element.addEventListener('mousemove', handleMouseMove, { passive: true })
    element.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [ref, strength])
}

const Hero = () => {
  const btn1Ref = useRef(null)
  const btn2Ref = useRef(null)
  const titleRef = useRef(null)
  const [currentBanner, setCurrentBanner] = useState(0)

  useMagnetic(btn1Ref, 0.35)
  useMagnetic(btn2Ref, 0.25)

  // Auto rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Title animation
  useEffect(() => {
    if (!titleRef.current) return
    const chars = titleRef.current.querySelectorAll('.char')
    if (chars.length === 0) return

    gsap.fromTo(chars,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.025, ease: 'power3.out', delay: 0.4 }
    )
  }, [])

  const titleChars = useMemo(() => (
    'SINOTRUK'.split('').map((char, i) => (
      <span key={i} className="char inline-block opacity-0">{char}</span>
    ))
  ), [])

  const subtitleChars = useMemo(() => (
    'HÀ NỘI'.split('').map((char, i) => (
      <span key={i} className="char inline-block opacity-0" style={{ color: '#800c0b' }}>{char === ' ' ? '\u00A0' : char}</span>
    ))
  ), [])

  return (
    <section className="relative w-full h-[500px] md:h-[500px] lg:h-[500px] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-full h-full container mx-auto px-4 md:px-10 lg:px-20">
          <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-inner bg-gray-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="w-full h-full"
              >
                <img
                  src={bannerImages[currentBanner]}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>


      {/* 3D Canvas overlay - hidden on mobile for performance */}
      <div className="absolute inset-0 z-[2] opacity-60 mix-blend-screen pointer-events-none lg:pointer-events-auto hidden md:block">
        <Canvas
          shadows={false}
          camera={{ position: [0, 2, 8], fov: 35 }}
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <AbstractTruckScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Light overlays - made more transparent for clarity */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-gradient-to-r from-white/80 via-white/40 to-white/20"></div>
      <div className="absolute inset-0 z-[3] pointer-events-none bg-gradient-to-t from-white/60 via-white/20 to-transparent"></div>


      <div className="relative z-10 container mx-auto px-4 md:px-10 lg:px-20 py-12 md:py-16">
        <div className="max-w-3xl space-y-4 md:space-y-6">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            Phụ tùng chính hãng 100%
          </motion.div>

          <div ref={titleRef} className="overflow-hidden">
            <h1 className="text-slate-800 text-4xl sm:text-5xl md:text-6xl font-bold leading-[0.9] tracking-tighter drop-shadow-sm">
              <span className="inline-block hover:scale-105 transition-transform duration-300 cursor-default" style={{ color: '#306269' }}>
                {titleChars}
              </span>
              <br />
              <span
                className="inline-block hover:scale-105 transition-transform duration-300 cursor-default"
              >
                {subtitleChars}
              </span>
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-slate-600 text-base md:text-lg max-w-xl leading-relaxed font-light"
          >
            Chuyên cung cấp phụ tùng chính hãng cho xe tải HOWO & SITRAK. Đầy đủ linh kiện từ động cơ, hộp số, phanh đến các chi tiết nhỏ nhất. Cam kết giá tốt nhất thị trường.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
          >
            <Link
              ref={btn1Ref}
              to="/products"
              className="flex items-center justify-center h-11 sm:h-12 px-6 sm:px-8 bg-primary hover:brightness-110 rounded-xl text-white font-bold text-sm sm:text-base transition-colors shadow-xl shadow-primary/30 group will-change-transform"
            >
              Khám Phá Ngay
              <span className="material-symbols-outlined ml-2 text-lg group-hover:rotate-180 transition-transform duration-500">view_in_ar</span>
            </Link>
            <Link
              ref={btn2Ref}
              to="/contact"
              className="flex items-center justify-center h-11 sm:h-12 px-6 sm:px-8 border border-slate-300 hover:border-primary hover:bg-primary/5 rounded-xl text-slate-700 font-bold text-sm sm:text-base transition-all group will-change-transform backdrop-blur-sm"
            >
              Tư Vấn Ngay
              <span className="material-symbols-outlined ml-2 text-lg group-hover:translate-x-1 transition-transform">chat_bubble</span>
            </Link>
          </motion.div>
        </div>
      </div>


      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cuộn</span>
        <span className="material-symbols-outlined text-primary">keyboard_arrow_down</span>
      </div>
    </section>
  )
}

export default Hero
