import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import SplashLoader from '../SplashLoader'
import Cursor from '../Cursor'

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Show loader on initial load
  useEffect(() => {
    // Only show splash on first visit
    const hasVisited = sessionStorage.getItem('hasVisited')
    if (hasVisited) {
      setIsLoading(false)
    }
  }, [])

  const handleLoaderComplete = () => {
    setIsLoading(false)
    sessionStorage.setItem('hasVisited', 'true')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Custom Cursor */}
      <Cursor />

      <AnimatePresence>
        {isLoading && <SplashLoader onComplete={handleLoaderComplete} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <Navbar isScrolled={isScrolled} />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </>
      )}
    </div>
  )
}

export default Layout
