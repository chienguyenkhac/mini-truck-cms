
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StatsSection } from './components/StatsSection';
import { VideoSection } from './components/VideoSection';
import { ProductGrid } from './components/ProductGrid';
import { AboutSection } from './components/AboutSection';
import { CategorySection } from './components/CategorySection';
import { Footer } from './components/Footer';
import { GeminiConsultant } from './components/GeminiConsultant';
import { SplashLoader } from './components/SplashLoader';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnimatePresence>
        {isLoading && <SplashLoader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <Navbar isScrolled={isScrolled} />
          <main className="flex-grow">
            <Hero />
            <StatsSection />
            <VideoSection />
            <ProductGrid />
            <AboutSection />
            <CategorySection />
          </main>
          <Footer />
          <GeminiConsultant />
        </>
      )}
    </div>
  );
};

export default App;
