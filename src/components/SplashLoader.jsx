import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSiteSettings } from '../context/SiteSettingsContext'

const SplashLoader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0)
    const { settings } = useSiteSettings()
    const siteNameRaw = settings.site_name || 'SINOTRUK HÀ NỘI'
    const siteName = siteNameRaw.toUpperCase()
    const animatedTitle = Array.from(siteName.replace(/\s+/g, ' '))

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(old => {
                if (old >= 100) {
                    clearInterval(timer)
                    setTimeout(onComplete, 800)
                    return 100
                }
                return old + 2
            })
        }, 30)
        return () => clearInterval(timer)
    }, [onComplete])

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[1000] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
            <div className="relative">
                {/* Animated background rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-primary/20 rounded-full animate-spin-slow"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    {/* Animated SINOTRUCK text */}
                    <div className="mb-8">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-center">
                            {animatedTitle.map((char, index) => (
                                <motion.span
                                    key={index}
                                    className="inline-block text-primary"
                                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                    animate={{ 
                                        opacity: 1, 
                                        y: 0, 
                                        rotateX: 0,
                                        textShadow: [
                                            '0 0 20px rgba(14, 165, 233, 0.5)',
                                            '0 0 40px rgba(14, 165, 233, 0.8)',
                                            '0 0 20px rgba(14, 165, 233, 0.5)',
                                        ]
                                    }}
                                    transition={{
                                        delay: index * 0.1,
                                        duration: 0.6,
                                        ease: 'easeOut',
                                        textShadow: {
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }
                                    }}
                                    style={{ 
                                        transformStyle: 'preserve-3d',
                                        display: 'inline-block',
                                    }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </h1>
                    </div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-primary text-xs font-bold tracking-[0.5em] uppercase mb-12 text-center"
                    >
                        {siteName}
                    </motion.p>

                    <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-gray-500 text-[10px] mt-4 font-bold tracking-widest">{progress}% LOADING POWER</p>
                </motion.div>
            </div>

            <div className="absolute bottom-12 text-gray-700 text-[10px] font-bold tracking-[0.2em] uppercase text-center px-4">
                Sức mạnh vượt thời gian • {siteName}
            </div>
        </motion.div>
    )
}

export default SplashLoader
