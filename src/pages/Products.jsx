import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProducts, getCategories, getImageUrl } from '../services/api'
import { useSiteSettings } from '../context/SiteSettingsContext'

const ITEMS_PER_PAGE = 30

// Format price
const formatPrice = (price) => {
  if (!price || price === 0) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const Products = () => {
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  const { settings } = useSiteSettings()
  const hotline = settings.contact_phone || '0382890990'

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastId, setLastId] = useState(null)

  // Debounce search terms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])


  // Update selectedCategory when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      // If categoryFromUrl is a slug, find the corresponding category
      const categoryBySlug = categories.find(c => c.slug === categoryFromUrl)
      const categoryById = categories.find(c => String(c.id) === categoryFromUrl)
      
      if (categoryBySlug) {
        setSelectedCategory(categoryBySlug.slug || String(categoryBySlug.id))
      } else if (categoryById) {
        setSelectedCategory(categoryById.slug || String(categoryById.id))
      } else {
        // Fallback to using the value directly
        setSelectedCategory(categoryFromUrl)
      }
    } else {
      setSelectedCategory('all')
    }
  }, [categoryFromUrl, categories])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories()
      setCategories(data)
    }
    loadCategories()
  }, [])

  // Load products with pagination
  const loadProducts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      setProducts([])
      setLastId(null)
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }

    try {
      // Build API options
      const options = {}
      
      // Category filter - use slug or ID
      if (selectedCategory !== 'all') {
        options.category = selectedCategory
      }

      // Search filter
      if (debouncedSearchTerm) {
        options.search = debouncedSearchTerm
      }


      // For pagination, we'll load more items and handle client-side
      const limit = reset ? ITEMS_PER_PAGE : ITEMS_PER_PAGE * 2
      const data = await getProducts(limit, false, options)

      if (reset) {
        setProducts(data || [])
      } else {
        // Simple pagination - just load more
        setProducts(data || [])
      }

      // Check if there are more products (simplified)
      setHasMore((data || []).length >= limit)
      if (data && data.length > 0) {
        setLastId(data[data.length - 1].id)
      }
    } catch (err) {
      console.error('Error:', err)
      setProducts([])
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedCategory, debouncedSearchTerm, categories])

  // Initial load and filter changes
  useEffect(() => {
    loadProducts(true)
  }, [selectedCategory, debouncedSearchTerm])

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="relative py-10 md:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-sky-50"></div>
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 tracking-tighter mb-2">
              SẢN <span className="text-primary">PHẨM</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              Tìm kiếm và lọc phụ tùng chính hãng theo nhu cầu của bạn
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-10">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã danh điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
          <button
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-primary shadow-sm'}`}
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
            className="mb-6 md:mb-10 p-5 md:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5 md:space-y-6"
          >
            {/* Part Categories */}
            <div>
              <h4 className="text-slate-800 font-bold mb-3 uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">category</span>
                BỘ PHẬN
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                    }`}
                  onClick={() => setSelectedCategory('all')}
                >
                  TẤT CẢ
                </button>
                {categories.filter(c => !c.is_vehicle_name).map((cat) => (
                  <button
                    key={cat.id}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === (cat.slug || String(cat.id))
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                      }`}
                    onClick={() => setSelectedCategory(cat.slug || String(cat.id))}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Vehicle Categories */}
            <div>
              <h4 className="text-slate-800 font-bold mb-3 uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-lg">local_shipping</span>
                HÃNG XE
              </h4>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c.is_vehicle_name).map((cat) => (
                  <button
                    key={cat.id}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === (cat.slug || String(cat.id))
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border border-blue-200'
                      }`}
                    onClick={() => setSelectedCategory(cat.slug || String(cat.id))}
                  >
                    {cat.name}
                  </button>
                ))}
                {categories.filter(c => c.is_vehicle_name).length === 0 && (
                  <p className="text-slate-400 text-sm">Chưa có hãng xe</p>
                )}
              </div>
            </div>

            {/* Manufacturer Code Filter */}
          </motion.div>
        )}

        {/* Products Grid */}
        {
          loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    viewport={{ once: true }}
                    className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-primary/40 transition-colors duration-300 shadow-sm hover:shadow-lg flex flex-col h-full will-change-transform"
                  >
                    <Link to={`/product/${product.slug || product.id}`}>
                      <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-200">
                        {product.image ? (
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-7xl text-gray-300">settings</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-50"></div>
                      </div>
                    </Link>
                    <div className="p-3 flex flex-col flex-1">
                      <div className="flex-1">
                        <Link to={`/product/${product.slug || product.id}`}>
                          <h3 className="text-slate-800 font-bold text-base group-hover:text-primary transition-colors line-clamp-2 min-h-[2.8rem]">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{product.description || 'Phụ tùng chính hãng'}</p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3">
                        {product.manufacturer_code && (
                          <div className="text-red-500 text-xs font-bold uppercase tracking-wider">
                            {product.manufacturer_code}
                          </div>
                        )}
                        <Link
                          to={`/product/${product.slug || product.id}`}
                          className="text-primary hover:text-primary/80 font-medium text-sm transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <span className="animate-spin material-symbols-outlined">refresh</span>
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">expand_more</span>
                        Xem thêm sản phẩm
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
              <p className="text-slate-500 text-lg">Không tìm thấy sản phẩm nào phù hợp</p>
            </div>
          )
        }
      </div >
    </div >
  )
}

export default Products
