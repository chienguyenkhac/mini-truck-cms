import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'

const ImageLibrary = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, code, image')
          .not('image', 'is', null)
          .limit(50)

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error loading images:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-primary font-bold uppercase tracking-wider text-sm">Gallery</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">Thư Viện Ảnh</h1>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
              Hình ảnh sản phẩm phụ tùng SINOTRUK chính hãng
            </p>
          </motion.div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-4 md:px-10 lg:px-20 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-2xl overflow-hidden bg-white shadow-lg cursor-pointer"
                onClick={() => setSelectedImage(product)}
              >
                <div className="aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-sm line-clamp-2">{product.name}</p>
                    <p className="text-white/70 text-xs mt-1">{product.code}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">photo_library</span>
            <p className="text-slate-500">Chưa có hình ảnh sản phẩm</p>
            <p className="text-slate-400 text-sm mt-2">Vui lòng thêm ảnh cho sản phẩm trong trang quản trị</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <img
              src={selectedImage.image}
              alt={selectedImage.name}
              className="w-full rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-bold">{selectedImage.name}</h3>
              <p className="text-white/60">{selectedImage.code}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ImageLibrary
