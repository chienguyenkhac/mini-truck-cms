import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Mock data for categories
const categoryData = {
  'howo-a7': {
    title: 'HOWO A7',
    description: 'Phụ tùng chính hãng cho dòng xe HOWO A7',
    products: [
      { id: 1, name: 'Lọc dầu động cơ HOWO A7', code: 'LDDC-A7', image: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&q=80&w=400' },
      { id: 2, name: 'Lá côn HOWO A7', code: 'LC-A7', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400' },
    ]
  },
  'howo-ben': {
    title: 'HOWO BEN',
    description: 'Phụ tùng cho xe ben HOWO các loại',
    products: [
      { id: 1, name: 'Xi lanh ben HOWO', code: 'XLB-HW', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400' },
    ]
  },
  'sitrak': {
    title: 'SITRAK T7H',
    description: 'Phụ tùng cao cấp cho dòng SITRAK T7H',
    products: [
      { id: 1, name: 'Phanh đĩa SITRAK', code: 'PD-ST', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=400' },
    ]
  },
}

const ProductCategory = () => {
  const { category } = useParams()
  const data = categoryData[category] || { title: 'Danh mục', description: '', products: [] }

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
            <Link to="/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary mb-6 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại sản phẩm
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-4">
              {data.title.split(' ')[0]} <span className="text-primary">{data.title.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              {data.description}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20">
        {data.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-surface border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-2 font-mono">Mã: {product.code}</p>
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
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">inventory_2</span>
            <p className="text-gray-400 text-lg">Đang cập nhật sản phẩm cho danh mục này</p>
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
