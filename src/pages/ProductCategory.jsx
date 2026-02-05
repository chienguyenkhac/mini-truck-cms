import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, getImageUrl } from '../services/supabase'

const ProductCategory = () => {
  const { category } = useParams()
  const [categoryData, setCategoryData] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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
          setProducts([])
          setLoading(false)
          return
        }

        console.log('✅ Category found:', catData)
        setCategoryData(catData)

        // Fetch products for this category
        let productsQuery = supabase
          .from('products')
          .select('*')
          .order('name')
          .limit(50)

        // Check if this is a vehicle category or regular category
        if (catData.is_vehicle_name) {
          // Filter by vehicle_ids array contains
          productsQuery = productsQuery.contains('vehicle_ids', [catData.id])
        } else {
          // Filter by category_id for regular categories
          productsQuery = productsQuery.eq('category_id', catData.id)
        }

        const { data: productsData, error: productsError } = await productsQuery

        if (!productsError) {
          setProducts(productsData || [])
        }
      } catch (err) {
        console.error('Error loading category:', err)
        setCategoryData({ name: 'Danh mục', description: '' })
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
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              {description}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/product/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-primary/40 transition-colors duration-300 shadow-sm hover:shadow-lg flex flex-col h-full will-change-transform"
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
                    {product.manufacturer_code && (
                      <div className="absolute top-4 left-4 bg-[#1e9ba8] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        {product.manufacturer_code}
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

                    <div className="flex gap-2 mt-auto pt-3">
                      <div className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:border-primary hover:text-primary transition-all flex items-center justify-center">
                        Chi Tiết
                      </div>
                      <a
                        href="tel:0382890990"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 bg-[#c41e1e] text-white font-medium text-sm rounded-xl hover:bg-[#a01818] transition-all flex items-center justify-center"
                      >
                        Đặt Hàng
                      </a>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inventory_2</span>
            <p className="text-slate-500 text-lg">Đang cập nhật sản phẩm cho danh mục này</p>
            <Link to="/products" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:underline">
              <span className="material-symbols-outlined">arrow_back</span>
              Xem tất cả sản phẩm
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCategory
