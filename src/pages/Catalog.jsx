import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'
import { getCategories } from '../services/supabase'

// Format price
const formatPrice = (price) => {
  if (!price || price === 0) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const Catalog = () => {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Load categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
        // Select first category by default
        if (data.length > 0) {
          setSelectedCategory(data[0].id)
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Load products when category changes
  useEffect(() => {
    if (!selectedCategory) return

    const loadProducts = async () => {
      setLoadingProducts(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', selectedCategory)
          .order('name')
          .limit(20)

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error loading products:', err)
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [selectedCategory])

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
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 tracking-tighter mb-4">
              CATA<span className="text-primary">LOG</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Danh mục phụ tùng chính hãng theo từng hạng mục
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="mb-10">
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${selectedCategory === cat.id
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary'
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table */}
            {loadingProducts ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm uppercase tracking-wider">Ảnh</th>
                        <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm uppercase tracking-wider">Mã SP</th>
                        <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm uppercase tracking-wider">Tên sản phẩm</th>
                        <th className="text-right py-4 px-6 text-slate-700 font-bold text-sm uppercase tracking-wider">Giá lẻ</th>
                        <th className="text-right py-4 px-6 text-slate-700 font-bold text-sm uppercase tracking-wider">Giá sỉ</th>
                        <th className="text-center py-4 px-6 text-slate-700 font-bold text-sm uppercase tracking-wider">Tồn kho</th>
                        <th className="py-4 px-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              {product.image ? (
                                <img
                                  src={product.image.startsWith('http') ? product.image : `https://irncljhvsjtohiqllnsv.supabase.co/storage/v1/object/public/products/${product.image}`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none' }}
                                />
                              ) : (
                                <span className="material-symbols-outlined text-2xl text-gray-400">settings</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm text-primary font-medium">{product.code || '-'}</span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-slate-800 font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-slate-400 text-sm mt-1 line-clamp-1">{product.description}</p>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-slate-800 font-bold">{formatPrice(product.price)}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-green-600 font-bold">{formatPrice(product.price_bulk)}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.total > 10 ? 'bg-green-100 text-green-700' :
                                product.total > 0 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              {product.total || 0}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <Link
                              to={`/product/${product.id}`}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                              Xem
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inventory_2</span>
                <p className="text-slate-500 text-lg">Chưa có sản phẩm trong danh mục này</p>
              </div>
            )}

            {/* Contact CTA */}
            <div className="mt-16 text-center p-12 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <span className="material-symbols-outlined text-6xl text-primary mb-4">call</span>
              <h3 className="text-slate-800 text-2xl font-bold mb-2">Hotline: 0382.890.990</h3>
              <p className="text-slate-500 mb-6">
                Liên hệ để nhận báo giá hoặc đặt hàng trực tiếp
              </p>
              <a
                href="tel:0382890990"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined">call</span>
                Gọi Ngay
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Catalog