import { forwardRef } from 'react'
import { useMagneticEffect } from '../hooks/useGSAP'

// Magnetic Button Component
export const MagneticButton = forwardRef(({ children, className = '', strength = 0.3, ...props }, ref) => {
    const magneticRef = useMagneticEffect(strength)

    return (
        <button
            ref={(el) => {
                magneticRef.current = el
                if (ref) ref.current = el
            }}
            className={`magnetic-btn ${className}`}
            {...props}
        >
            {children}
        </button>
    )
})

MagneticButton.displayName = 'MagneticButton'

// Custom Cursor Component
export const CustomCursor = () => {
    return (
        <>
            <div
                id="cursor"
                className="fixed w-10 h-10 border-2 border-primary rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden lg:block"
                style={{ left: 0, top: 0 }}
            />
            <div
                id="cursor-dot"
                className="fixed w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
                style={{ left: 0, top: 0 }}
            />
        </>
    )
}

// Animated Text Component
export const AnimatedText = ({ children, className = '', delay = 0 }) => {
    return (
        <span
            className={`inline-block opacity-0 translate-y-5 animate-text-reveal ${className}`}
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
        </span>
    )
}

// Hover Tilt Card Component
export const TiltCard = ({ children, className = '', intensity = 10 }) => {
    const handleMouseMove = (e) => {
        const card = e.currentTarget
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = ((y - centerY) / centerY) * -intensity
        const rotateY = ((x - centerX) / centerX) * intensity

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    }

    const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
    }

    return (
        <div
            className={`transition-transform duration-300 ease-out ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    )
}

// Reveal on Scroll Component
export const RevealOnScroll = ({ children, className = '', delay = 0 }) => {
    return (
        <div
            className={`opacity-0 translate-y-8 animate-reveal ${className}`}
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
        </div>
    )
}

// Glow Button Component
export const GlowButton = ({ children, className = '', ...props }) => {
    return (
        <button
            className={`relative overflow-hidden group ${className}`}
            {...props}
        >
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-red-400 to-primary opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></span>
            <span className="relative z-10">{children}</span>
        </button>
    )
}
