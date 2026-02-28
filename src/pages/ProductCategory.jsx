import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, getImageUrl, getProducts } from '../services/supabase'

const ProductCategory = () => {
  const { category } = useParams()
  const [categoryData, setCategoryData] = useState(null)
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filter products based on search term
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setProducts(allProducts)
    } else {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (product.manufacturer_code && product.manufacturer_code.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      )
      setProducts(filtered)
    }
  }, [debouncedSearchTerm, allProducts])

  useEffect(() => {
    const loadCategoryData = async () => {
      setLoading(true)
      try {
        // Fetch category by slug, ID, or name
        const categoryId = parseInt(category)
        console.log('🔍 Loading category:', category, 'isNumber:', !isNaN(categoryId))
        
        let categoryQuery = supabase.from('categories').select('*')

        let catData = null
        let catError = null

        if (!isNaN(categoryId)) {
          // Try by ID first
          const result = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single()
          catData = result.data
          catError = result.error
        } else {
          // Try by slug first (preferred method)
          const result = await supabase
            .from('categories')
            .select('*')
            .eq('slug', category)
            .maybeSingle()  // Use maybeSingle() instead of single()
          catData = result.data
          catError = result.error
        }
        
        console.log('📊 Slug lookup result:', catData, 'Error:', catError)

        // If slug lookup fails, try matching by name
        if (catError && isNaN(categoryId)) {
          console.log('⚠️ Slug not found, trying name match:', category.replace(/-/g, ' '))
          const { data: nameData, error: nameError } = await supabase
            .from('categories')
            .select('*')
            .ilike('name', `%${category.replace(/-/g, ' ')}%`)
            .single()
          
          console.log('📊 Name lookup result:', nameData, 'Error:', nameError)
          catData = nameData
          catError = nameError
        }

        if (catError || !catData) {
        console.log('❌ Category not found')
        setCategoryData({ name: 'Danh mục', description: '' })
        setAllProducts([])
        setProducts([])
        setLoading(false)
        return
        }

        console.log('✅ Category found:', catData)
        setCategoryData(catData)

        // Fetch products for this category using getProducts API (like ProductGrid)
        // Use category slug or ID, and pass true for onlyHomepage to filter show_on_homepage = true
        const categoryIdentifier = catData.slug || String(catData.id)
        const productsData = await getProducts(50, true, { category: categoryIdentifier })

        if (productsData) {
          setAllProducts(productsData || [])
          setProducts(productsData || [])
        }
      } catch (err) {
        console.error('Error loading category:', err)
        setCategoryData({ name: 'Danh mục', description: '' })
        setAllProducts([])
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadCategoryData()
  }, [category])



  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const title = categoryData?.name || 'Danh mục'
  const description = categoryData?.description || `Phụ tùng chính hãng cho ${title}`

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
            <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-4 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Quay lại sản phẩm
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 tracking-tighter mb-2">
              {title.split(' ')[0]} <span className="text-primary">{title.split(' ').slice(1).join(' ')}</span>
            </h1>
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
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/product/${product.slug || product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-primary/40 transition-colors duration-300 shadow-sm hover:shadow-lg flex flex-col h-full will-change-transform"
                >
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

                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="text-slate-800 font-bold text-base group-hover:text-primary transition-colors line-clamp-2 min-h-[2.8rem]">
                        {product.name}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{product.description || 'Phụ tùng chính hãng'}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3">
                      {product.manufacturer_code && (
                        <div className="text-red-500 text-xs font-bold uppercase tracking-wider">
                          {product.manufacturer_code}
                        </div>
                      )}
                      <div className="text-primary hover:text-primary/80 font-medium text-sm transition-colors flex items-center gap-1 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
              {debouncedSearchTerm ? 'search_off' : 'inventory_2'}
            </span>
            <p className="text-slate-500 text-lg">
              {debouncedSearchTerm 
                ? `Không tìm thấy sản phẩm nào với từ khóa "${debouncedSearchTerm}"`
                : 'Đang cập nhật sản phẩm cho danh mục này'
              }
            </p>
            {debouncedSearchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:underline"
              >
                <span className="material-symbols-outlined">clear</span>
                Xóa tìm kiếm
              </button>
            ) : (
              <Link to="/products" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:underline">
                <span className="material-symbols-outlined">arrow_back</span>
                Xem tất cả sản phẩm
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCategory
