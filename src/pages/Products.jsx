import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'
import { getCategories } from '../services/supabase'

const ITEMS_PER_PAGE = 9

// Format price
const formatPrice = (price) => {
  if (!price || price === 0) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const Products = () => {
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastId, setLastId] = useState(null)

  // Update selectedCategory when URL changes and show filters
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
      setShowFilters(true) // Auto show filter panel when navigating with category
    } else {
      setSelectedCategory('all')
    }
  }, [categoryFromUrl])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories()
      setCategories(data)
    }
    loadCategories()
  }, [])

  // Load products with cursor pagination
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
      let query = supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })
        .limit(ITEMS_PER_PAGE)

      // Cursor pagination: get products after lastId
      if (!reset && lastId) {
        query = query.gt('id', lastId)
      }

      // Category filter - check if selected category is vehicle or part
      if (selectedCategory !== 'all') {
        const selectedCat = categories.find(c => String(c.id) === selectedCategory)
        if (selectedCat && selectedCat.is_vehicle_name) {
          // Filter by vehicle_ids array contains
          query = query.contains('vehicle_ids', [parseInt(selectedCategory)])
        } else {
          // Filter by category_id
          query = query.eq('category_id', parseInt(selectedCategory))
        }
      }

      // Search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      if (reset) {
        setProducts(data || [])
      } else {
        setProducts(prev => [...prev, ...(data || [])])
      }

      // Check if there are more products
      if (data && data.length > 0) {
        setLastId(data[data.length - 1].id)
        setHasMore(data.length === ITEMS_PER_PAGE)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedCategory, searchTerm, lastId, categories])

  // Initial load and filter changes
  useEffect(() => {
    loadProducts(true)
  }, [selectedCategory, searchTerm])

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="relative py-8 md:py-12 overflow-hidden">
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
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, mã sản phẩm..."
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
            className="mb-10 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6"
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === String(cat.id)
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                      }`}
                    onClick={() => setSelectedCategory(String(cat.id))}
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === String(cat.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border border-blue-200'
                      }`}
                    onClick={() => setSelectedCategory(String(cat.id))}
                  >
                    {cat.name}
                  </button>
                ))}
                {categories.filter(c => c.is_vehicle_name).length === 0 && (
                  <p className="text-slate-400 text-sm">Chưa có hãng xe</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl overflow-hidden animate-pulse">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col h-full"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {product.image ? (
                        <img
                          src={product.image.startsWith('http') ? product.image : `https://irncljhvsjtohiqllnsv.supabase.co/storage/v1/object/public/products/${product.image}`}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-8xl text-gray-300">settings</span>
                        </div>
                      )}
                      {product.manufacturer_code && (
                        <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {product.manufacturer_code}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-60"></div>
                    </div>
                  </Link>
                  <div className="p-3 flex flex-col flex-1">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-slate-800 font-bold text-base group-hover:text-primary transition-colors line-clamp-2 min-h-[2.8rem]">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{product.description || 'Phụ tùng chính hãng'}</p>

                    <div className="flex gap-2 mt-auto pt-3">
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                      >
                        Chi Tiết
                      </Link>
                      <a
                        href="tel:0382890990"
                        className="flex-1 py-2 bg-amber-500 text-white font-medium text-sm rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center"
                      >
                        Đặt Hàng
                      </a>
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
        )}
      </div>
    </div>
  )
}

export default Products
