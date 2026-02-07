import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout/Layout"
import ScrollToTop from "./components/ScrollToTop"
import ImageProtection from "./components/ImageProtection"
import Home from "./pages/Home"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import ProductCategory from "./pages/ProductCategory"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Catalog from "./pages/Catalog"
import ImageLibrary from "./pages/ImageLibrary"

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ImageProtection />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/image-library" element={<ImageLibrary />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App