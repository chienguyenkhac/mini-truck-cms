import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IMAGES } from '../constants/images'

// Mock data with properly matched images
const allProducts = [
  {
    id: 1,
    name: 'Xilanh kích cabin VX350 VX400',
    code: 'XLKVX',
    manufacturerCode: 'WG9525820140/2',
    image: IMAGES.parts.cabinCylinder,
    category: 'CABIN & THÂN VỎ',
    tag: 'Original',
  },
  {
    id: 2,
    name: 'Tăm bét trước VGD95 SITRAK T7H',
    code: 'TBTSI.L',
    manufacturerCode: 'AZ4095410005',
    image: IMAGES.parts.bearing,
    category: 'ĐỘNG CƠ',
    tag: 'Best Seller',
  },
  {
    id: 3,
    name: 'Lọc dầu động cơ HOWO A7',
    code: 'LDDC-A7',
    manufacturerCode: 'VG61000070005',
    image: IMAGES.parts.oilFilter,
    category: 'ĐỘNG CƠ',
    tag: 'Premium',
  },
  {
    id: 4,
    name: 'Lá côn HOWO 420 chính hãng',
    code: 'LC420',
    manufacturerCode: 'WG9114160020',
    image: IMAGES.parts.clutchDisc,
    category: 'BỘ PHẬN LY HỢP',
    tag: 'Original',
  },
  {
    id: 5,
    name: 'Phanh tang trống sau SITRAK',
    code: 'PTTS',
    manufacturerCode: 'AZ9231342006',
    image: IMAGES.parts.drumBrake,
    category: 'HỆ THỐNG PHANH',
    tag: 'Premium',
  },
  {
    id: 6,
    name: 'Đầu lọc khí nén HOWO',
    code: 'DLKN',
    manufacturerCode: 'WG9725190102',
    image: IMAGES.parts.airFilter,
    category: 'HỆ THỐNG HÚT XẢ',
    tag: 'Original',
  },
]

const categories = [
  'all',
  'CABIN & THÂN VỎ',
  'ĐỘNG CƠ',
  'HỘP SỐ',
  'HỆ THỐNG HÚT XẢ',
  'HT LÀM MÁT',
  'BỘ PHẬN LY HỢP',
  'HỆ THỐNG PHANH',
]

const Products = () => {
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filteredProducts, setFilteredProducts] = useState(allProducts)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered = allProducts

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.manufacturerCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-4">
              SẢN <span className="text-primary">PHẨM</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Tìm kiếm và lọc phụ tùng chính hãng theo nhu cầu của bạn
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-grow relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, mã sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all"
            />
            {searchTerm && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary text-sm font-bold">
                {filteredProducts.length} kết quả
              </span>
            )}
          </div>
          <button
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary text-white' : 'bg-surface border border-border text-white hover:border-primary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="material-symbols-outlined">tune</span>
            Lọc
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-10 p-6 bg-surface border border-border rounded-2xl"
          >
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Danh mục</h4>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-surface border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                <div className="aspect-square relative overflow-hidden bg-gray-900">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.tag}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-2 font-mono">
                      Mã: {product.code} | {product.manufacturerCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider px-2 py-1 bg-white/5 rounded-lg">
                      {product.category}
                    </span>
                  </div>
                  <button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
                    Nhận Báo Giá
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">search_off</span>
            <p className="text-gray-400 text-lg">Không tìm thấy sản phẩm nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
