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
      <span key={i} className="char inline-block opacity-0">{char === ' ' ? '\u00A0' : char}</span>
    ))
  ), [])

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-background">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={bannerImages[currentBanner]}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
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

      {/* Light overlays */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-gradient-to-r from-white via-white/90 to-white/60"></div>
      <div className="absolute inset-0 z-[3] pointer-events-none bg-gradient-to-t from-white via-white/50 to-transparent"></div>

      {/* Banner indicators */}
      <div className="absolute bottom-24 right-10 z-20 hidden md:flex gap-2">
        {bannerImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentBanner(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? 'bg-primary w-8' : 'bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-10 lg:px-20 py-20">
        <div className="max-w-3xl space-y-8">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            Thế hệ xe tải nặng 4.0
          </motion.div>

          <div ref={titleRef} className="overflow-hidden">
            <h1 className="text-slate-800 text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold leading-[0.9] tracking-tighter drop-shadow-sm">
              <span className="inline-block hover:scale-105 transition-transform duration-300 cursor-default">
                {titleChars}
              </span>
              <br />
              <span
                className="text-primary inline-block hover:scale-105 transition-transform duration-300 cursor-default animate-pulse-subtle"
                style={{ textShadow: '0 0 8px rgba(14, 165, 233, 0.6), 0 0 20px rgba(14, 165, 233, 0.4)' }}
              >
                {subtitleChars}
              </span>
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed font-light"
          >
            Định nghĩa lại hiệu suất vận tải với công nghệ 3D hiện đại. SINOTRUK HÀ NỘI mang đến các dòng xe HOWO & SITRAK đột phá về sức mạnh.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-5 pt-4"
          >
            <Link
              ref={btn1Ref}
              to="/products"
              className="flex items-center justify-center h-12 sm:h-14 px-6 sm:px-10 bg-primary hover:brightness-110 rounded-xl text-white font-bold text-sm sm:text-base transition-colors shadow-xl shadow-primary/30 group will-change-transform"
            >
              Khám Phá Ngay
              <span className="material-symbols-outlined ml-2 text-lg sm:text-xl group-hover:rotate-180 transition-transform duration-500">view_in_ar</span>
            </Link>
            <Link
              ref={btn2Ref}
              to="/contact"
              className="flex items-center justify-center h-12 sm:h-14 px-6 sm:px-10 border border-slate-300 hover:border-primary hover:bg-primary/5 rounded-xl text-slate-700 font-bold text-sm sm:text-base transition-all group will-change-transform backdrop-blur-sm"
            >
              Tư Vấn Ngay
              <span className="material-symbols-outlined ml-2 text-lg sm:text-xl group-hover:translate-x-1 transition-transform">chat_bubble</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating hint */}
      <div className="absolute right-10 bottom-28 hidden xl:block z-20 animate-float">
        <div className="w-60 bg-white/90 backdrop-blur-lg border border-slate-200 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Interactive</span>
          </div>
          <h4 className="text-slate-800 font-bold text-sm mb-1">Xoay để khám phá</h4>
          <p className="text-slate-500 text-[10px]">Dùng chuột để xoay mô hình 3D.</p>
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
