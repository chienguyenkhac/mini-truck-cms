import { useEffect, useRef } from 'react'

// Optimized cursor with direct DOM manipulation for maximum performance
const Cursor = () => {
    const cursorRef = useRef(null)
    const dotRef = useRef(null)
    const rafRef = useRef(null)
    const mousePos = useRef({ x: 0, y: 0 })
    const cursorPos = useRef({ x: 0, y: 0 })
    const isHovering = useRef(false)

    useEffect(() => {
        const cursor = cursorRef.current
        const dot = dotRef.current
        if (!cursor || !dot) return

        // Direct mouse tracking - instant response
        const onMouseMove = (e) => {
            mousePos.current.x = e.clientX
            mousePos.current.y = e.clientY

            // Dot follows instantly
            dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
        }

        // Optimized RAF loop with higher responsiveness
        const animate = () => {
            // Faster lerp factor = more responsive (0.25 instead of 0.12)
            const lerpFactor = isHovering.current ? 0.15 : 0.25

            cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * lerpFactor
            cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * lerpFactor

            // Use transform for GPU acceleration
            cursor.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px) scale(${isHovering.current ? 1.5 : 1})`

            rafRef.current = requestAnimationFrame(animate)
        }

        // Delegate event for hover detection - optimized
        const onMouseOver = (e) => {
            const target = e.target
            if (target.closest('a, button, [data-cursor], input, textarea, select')) {
                isHovering.current = true
                cursor.style.borderColor = '#ea2a33'
                dot.style.opacity = '0'
            }
        }

        const onMouseOut = (e) => {
            const target = e.target
            if (target.closest('a, button, [data-cursor], input, textarea, select')) {
                isHovering.current = false
                cursor.style.borderColor = 'rgba(255,255,255,0.5)'
                dot.style.opacity = '1'
            }
        }

        // Use passive listeners for better scroll performance
        window.addEventListener('mousemove', onMouseMove, { passive: true })
        document.addEventListener('mouseover', onMouseOver, { passive: true })
        document.addEventListener('mouseout', onMouseOut, { passive: true })

        rafRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseover', onMouseOver)
            document.removeEventListener('mouseout', onMouseOut)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return (
        <>
            {/* Main cursor ring - GPU accelerated */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-10 h-10 -ml-5 -mt-5 border-2 border-white/50 rounded-full pointer-events-none z-[9999] hidden lg:block will-change-transform"
                style={{ transition: 'border-color 0.2s, width 0.2s, height 0.2s' }}
            />
            {/* Cursor dot - instant follow */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-primary rounded-full pointer-events-none z-[9999] hidden lg:block will-change-transform"
                style={{ transition: 'opacity 0.2s' }}
            />
        </>
    )
}

export default Cursor
