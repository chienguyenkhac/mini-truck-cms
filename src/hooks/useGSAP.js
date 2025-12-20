import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'

// Custom cursor follower hook
export const useCustomCursor = () => {
    const cursorRef = useRef(null)
    const cursorDotRef = useRef(null)

    useEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current) return

        const cursor = cursorRef.current
        const cursorDot = cursorDotRef.current
        let mouseX = 0, mouseY = 0
        let cursorX = 0, cursorY = 0

        const handleMouseMove = (e) => {
            mouseX = e.clientX
            mouseY = e.clientY

            // Instant dot follow
            gsap.to(cursorDot, {
                x: mouseX,
                y: mouseY,
                duration: 0.1,
                ease: 'power2.out'
            })
        }

        // Smooth cursor follow with RAF
        const animate = () => {
            cursorX += (mouseX - cursorX) * 0.15
            cursorY += (mouseY - cursorY) * 0.15

            gsap.set(cursor, { x: cursorX, y: cursorY })
            requestAnimationFrame(animate)
        }

        window.addEventListener('mousemove', handleMouseMove)
        animate()

        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return { cursorRef, cursorDotRef }
}

// Magnetic button effect hook
export const useMagneticEffect = (strength = 0.3) => {
    const elementRef = useRef(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const handleMouseMove = (e) => {
            const rect = element.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const deltaX = (e.clientX - centerX) * strength
            const deltaY = (e.clientY - centerY) * strength

            gsap.to(element, {
                x: deltaX,
                y: deltaY,
                duration: 0.3,
                ease: 'power2.out'
            })
        }

        const handleMouseLeave = () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            })
        }

        element.addEventListener('mousemove', handleMouseMove)
        element.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            element.removeEventListener('mousemove', handleMouseMove)
            element.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [strength])

    return elementRef
}

// Text reveal animation hook
export const useTextReveal = (delay = 0) => {
    const elementRef = useRef(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    gsap.fromTo(element,
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            delay,
                            ease: 'power3.out'
                        }
                    )
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [delay])

    return elementRef
}

// Parallax scroll effect hook
export const useParallax = (speed = 0.5) => {
    const elementRef = useRef(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const handleScroll = () => {
            const rect = element.getBoundingClientRect()
            const scrolled = window.scrollY
            const yPos = -(scrolled * speed)

            gsap.set(element, { y: yPos })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [speed])

    return elementRef
}

// Hover scale effect hook
export const useHoverScale = (scale = 1.05) => {
    const elementRef = useRef(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const handleMouseEnter = () => {
            gsap.to(element, {
                scale,
                duration: 0.3,
                ease: 'power2.out'
            })
        }

        const handleMouseLeave = () => {
            gsap.to(element, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            })
        }

        element.addEventListener('mouseenter', handleMouseEnter)
        element.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter)
            element.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [scale])

    return elementRef
}

// Split text animation hook
export const useSplitText = () => {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const text = container.innerText
        container.innerHTML = ''

        text.split('').forEach((char, i) => {
            const span = document.createElement('span')
            span.innerText = char === ' ' ? '\u00A0' : char
            span.style.display = 'inline-block'
            span.style.opacity = '0'
            span.style.transform = 'translateY(20px)'
            container.appendChild(span)
        })

        const chars = container.querySelectorAll('span')

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    gsap.to(chars, {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.02,
                        ease: 'power3.out'
                    })
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    return containerRef
}

// Stagger children animation hook
export const useStaggerChildren = (stagger = 0.1) => {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const children = container.children

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    gsap.fromTo(children,
                        { y: 30, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            stagger,
                            ease: 'power3.out'
                        }
                    )
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(container)
        return () => observer.disconnect()
    }, [stagger])

    return containerRef
}
