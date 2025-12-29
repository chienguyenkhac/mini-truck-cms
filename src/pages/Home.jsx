import Hero from '../components/Home/Hero'
import StatsSection from '../components/Home/StatsSection'
import VideoSection from '../components/Home/VideoSection'
import ProductGrid from '../components/Home/ProductGrid'
import AboutSection from '../components/Home/AboutSection'
import CategorySection from '../components/Home/CategorySection'
import CategoryShowcase from '../components/Home/CategoryShowcase'
import VehicleShowcase from '../components/Home/VehicleShowcase'

const Home = () => {
  return (
    <div className="bg-background">
      <Hero />
      <StatsSection />
      <CategoryShowcase />
      <VehicleShowcase />
      <VideoSection />
      <ProductGrid />
      <AboutSection />
      <CategorySection />
    </div>
  )
}

export default Home

