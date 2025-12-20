import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IMAGES } from '../constants/images'

const categories = ['Tất cả', 'Xe Đầu Kéo', 'Xe Ben', 'Xe Chuyên Dụng', 'Xe Tải Thùng']

const ImageLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [selectedImage, setSelectedImage] = useState(null)

  const filteredImages = selectedCategory === 'Tất cả'
    ? IMAGES.gallery
    : IMAGES.gallery.filter(img => img.category === selectedCategory)

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
              THƯ VIỆN <span className="text-primary">ẢNH</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Bộ sưu tập hình ảnh xe tải Sinotruk
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-gray-400 hover:text-white hover:border-primary'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, i) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedImage(image)}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden">
                <img
                  src={image.src}
                  alt={image.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-primary text-xs font-bold uppercase tracking-wider">{image.category}</span>
                  <h3 className="text-white font-bold text-lg mt-1">{image.title}</h3>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl">
                    <span className="material-symbols-outlined text-white text-2xl">zoom_in</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-primary transition-all"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage.src}
              alt={selectedImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
              <span className="text-primary text-xs font-bold uppercase tracking-wider">{selectedImage.category}</span>
              <h3 className="text-white font-bold text-xl mt-1">{selectedImage.title}</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ImageLibrary
