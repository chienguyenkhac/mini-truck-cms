import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SplashLoader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0)

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
                    <div className="text-primary mb-8">
                        <span className="material-symbols-outlined text-8xl font-bold drop-shadow-[0_0_15px_rgba(234,42,51,0.8)] animate-pulse">local_shipping</span>
                    </div>
                    <h2 className="text-white text-3xl font-bold tracking-[0.3em] uppercase mb-1">Sinotruk</h2>
                    <p className="text-primary text-xs font-bold tracking-[0.5em] uppercase mb-12">Hà Nội</p>

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

            <div className="absolute bottom-12 text-gray-700 text-[10px] font-bold tracking-[0.2em] uppercase">
                Sức mạnh vượt thời gian • Sinotruk Vietnam
            </div>
        </motion.div>
    )
}

export default SplashLoader
