import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'

const ProductCategory = () => {
  const { category } = useParams()
  const [categoryData, setCategoryData] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategoryData = async () => {
      setLoading(true)
      try {
        // Fetch category by ID or slug
        const categoryId = parseInt(category)
        let categoryQuery = supabase.from('categories').select('*')

        if (!isNaN(categoryId)) {
          categoryQuery = categoryQuery.eq('id', categoryId)
        } else {
          // Try to match by name (slug-like)
          categoryQuery = categoryQuery.ilike('name', `%${category.replace(/-/g, ' ')}%`)
        }

        const { data: catData, error: catError } = await categoryQuery.single()

        if (catError || !catData) {
          setCategoryData({ name: 'Danh mục', description: '' })
          setProducts([])
          setLoading(false)
          return
        }

        setCategoryData(catData)

        // Fetch products for this category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', catData.id)
          .eq('show_on_homepage', true)
          .order('name')
          .limit(50)

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

  // Get product image URL
  const getImageUrl = (product) => {
    if (!product.image) return null
    if (product.image.startsWith('http')) return product.image
    return `https://irncljhvsjtohiqllnsv.supabase.co/storage/v1/object/public/products/${product.image}`
  }

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
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại sản phẩm
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 tracking-tighter mb-4">
              {title.split(' ')[0]} <span className="text-primary">{title.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              {description}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <div className="aspect-square relative overflow-hidden">
                    {getImageUrl(product) ? (
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="material-symbols-outlined text-6xl text-gray-300">settings</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-60"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-slate-800 font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      {product.code && (
                        <p className="text-slate-400 text-xs mt-2 font-mono">Mã: {product.code}</p>
                      )}
                    </div>
                    <button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
                      Xem Chi Tiết
                    </button>
                  </div>
                </motion.div>
              </Link>
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
