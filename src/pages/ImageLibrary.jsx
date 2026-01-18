import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'

const ITEMS_PER_PAGE = 50 // 5x10 grid

const ImageLibrary = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      try {
        const from = (currentPage - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        const { data, count, error } = await supabase
          .from('gallery_images')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to)

        if (error) throw error
        setImages(data || [])
        setTotalCount(count || 0)
      } catch (err) {
        console.error('Error loading images:', err)
      } finally {
        setLoading(false)
      }
    }
    loadImages()
  }, [currentPage])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Get image URL with proxy
  const getImageUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `/api/image?path=${encodeURIComponent(path)}`
  }

  // Right-click handler for watermark download (same as ProductDetail)
  const handleImageRightClick = useCallback((e, imageUrl, imageName) => {
    e.preventDefault()

    // Remove existing menu if any
    const existingMenu = document.getElementById('gallery-image-menu')
    if (existingMenu) existingMenu.remove()

    // Build watermarked URL
    const watermarkedUrl = imageUrl.includes('?')
      ? `${imageUrl}&watermark=true`
      : `${imageUrl}?watermark=true`

    // Create custom context menu
    const menu = document.createElement('div')
    menu.id = 'gallery-image-menu'
    menu.style.cssText = `
      position: fixed;
      top: ${e.clientY}px;
      left: ${e.clientX}px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      padding: 8px 0;
      z-index: 99999;
      min-width: 200px;
      font-family: system-ui, -apple-system, sans-serif;
      animation: menuFadeIn 0.15s ease-out;
    `

    // Add CSS animation if not exists
    if (!document.getElementById('gallery-image-menu-styles')) {
      const style = document.createElement('style')
      style.id = 'gallery-image-menu-styles'
      style.textContent = `
        @keyframes menuFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        #gallery-image-menu button {
          width: 100%;
          padding: 10px 16px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.1s;
        }
        #gallery-image-menu button:hover {
          background: #f3f4f6;
        }
        #gallery-image-menu button .icon {
          font-size: 18px;
          color: #6b7280;
        }
      `
      document.head.appendChild(style)
    }

    // Download button (with watermark)
    const downloadBtn = document.createElement('button')
    downloadBtn.innerHTML = `
      <span class="material-symbols-outlined icon">download</span>
      <span>Tải ảnh xuống</span>
    `
    downloadBtn.onclick = () => {
      const link = document.createElement('a')
      link.href = watermarkedUrl
      link.download = `${imageName || 'image'}_watermarked.jpg`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      menu.remove()
    }

    // Copy link button
    const copyBtn = document.createElement('button')
    copyBtn.innerHTML = `
      <span class="material-symbols-outlined icon">link</span>
      <span>Sao chép link</span>
    `
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(window.location.href)
      menu.remove()
    }

    menu.appendChild(downloadBtn)
    menu.appendChild(copyBtn)
    document.body.appendChild(menu)

    // Close menu on outside click
    const closeMenu = (event) => {
      if (!menu.contains(event.target)) {
        menu.remove()
        document.removeEventListener('click', closeMenu)
      }
    }
    setTimeout(() => document.addEventListener('click', closeMenu), 0)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="relative py-10 md:py-14 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-white to-sky-50" />
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 tracking-tighter mb-2">
              THƯ VIỆN <span className="text-primary">ẢNH</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              Hình ảnh sản phẩm phụ tùng SINOTRUK chính hãng
            </p>
          </motion.div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-4 md:px-10 lg:px-20 py-4 md:py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {images.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  className="group relative rounded-xl overflow-hidden bg-white shadow-md cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                  onContextMenu={(e) => handleImageRightClick(e, getImageUrl(img.image_path), img.title)}
                >
                  <div className="aspect-square">
                    <img
                      src={getImageUrl(img.image_path)}
                      alt={img.title || 'Gallery image'}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  >
                    {img.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm line-clamp-2">{img.title}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">photo_library</span>
            <p className="text-slate-500 text-lg">Chưa có hình ảnh</p>
            <p className="text-slate-400 text-sm mt-2">Vui lòng thêm ảnh trong trang quản trị</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (() => {
        const currentIndex = images.findIndex(img => img.id === selectedImage.id)
        const hasPrev = currentIndex > 0
        const hasNext = currentIndex < images.length - 1

        const handlePrev = () => {
          if (hasPrev) {
            setSelectedImage(images[currentIndex - 1])
          }
        }

        const handleNext = () => {
          if (hasNext) {
            setSelectedImage(images[currentIndex + 1])
          }
        }

        return (
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

              {/* Previous Arrow */}
              {hasPrev && (
                <button
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 md:-translate-x-16 text-white/70 hover:text-white transition-all hover:scale-110 bg-black/30 hover:bg-black/50 rounded-full p-2"
                  aria-label="Previous image"
                >
                  <span className="material-symbols-outlined text-4xl">chevron_left</span>
                </button>
              )}

              {/* Next Arrow */}
              {hasNext && (
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 md:translate-x-16 text-white/70 hover:text-white transition-all hover:scale-110 bg-black/30 hover:bg-black/50 rounded-full p-2"
                  aria-label="Next image"
                >
                  <span className="material-symbols-outlined text-4xl">chevron_right</span>
                </button>
              )}

              <img
                src={getImageUrl(selectedImage.image_path)}
                alt={selectedImage.title || 'Gallery image'}
                className="w-full rounded-xl shadow-2xl"
                onContextMenu={(e) => handleImageRightClick(e, getImageUrl(selectedImage.image_path), selectedImage.title)}
              />
              {selectedImage.title && (
                <p className="mt-4 text-center text-white text-lg">{selectedImage.title}</p>
              )}
            </motion.div>
          </div>
        )
      })()}
    </div>
  )
}

export default ImageLibrary
