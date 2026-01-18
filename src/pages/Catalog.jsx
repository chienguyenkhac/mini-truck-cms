import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getCatalogArticles } from '../services/supabase'

// Render EditorJS blocks to HTML
const renderContent = (content) => {
  if (!content || !content.blocks) return null

  // Helper to extract text from list item (can be string or object)
  const getItemText = (item) => {
    if (typeof item === 'string') return item
    if (typeof item === 'object' && item !== null) {
      return item.content || item.text || ''
    }
    return ''
  }

  return content.blocks.map((block, index) => {
    switch (block.type) {
      case 'header':
        return (
          <div key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-3" dangerouslySetInnerHTML={{ __html: block.data.text }} />
        )
      case 'paragraph':
        return (
          <p key={index} className="text-slate-600 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: block.data.text }} />
        )
      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul'
        return (
          <ListTag key={index} className={`${block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'} list-inside text-slate-600 mb-4 space-y-1 pl-4`}>
            {block.data.items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: getItemText(item) }} />
            ))}
          </ListTag>
        )
      case 'checklist':
        return (
          <div key={index} className="mb-4 space-y-2">
            {block.data.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600">
                <span className={`material-symbols-outlined text-lg ${item.checked ? 'text-green-500' : 'text-slate-300'}`}>
                  {item.checked ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span dangerouslySetInnerHTML={{ __html: item.text || '' }} />
              </div>
            ))}
          </div>
        )
      case 'image':
        return (
          <figure key={index} className="my-6">
            <img
              src={block.data.file?.url || block.data.url}
              alt={block.data.caption || ''}
              className="w-full rounded-xl shadow-lg"
            />
            {block.data.caption && (
              <figcaption className="text-center text-sm text-slate-500 mt-2">{block.data.caption}</figcaption>
            )}
          </figure>
        )
      default:
        return null
    }
  })
}

const Catalog = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load articles from database
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const data = await getCatalogArticles()
        setArticles(data)
      } catch (err) {
        console.error('Error loading articles:', err)
      } finally {
        setLoading(false)
      }
    }
    loadArticles()
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
              BÀI<span className="text-primary"> VIẾT</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              Bài viết kỹ thuật và hướng dẫn sử dụng phụ tùng xe tải
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 py-4 md:py-8">
        {/* Search Box */}
        {!selectedArticle && articles.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition-all shadow-sm"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : articles.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-slate-300 mb-6">article</span>
            <h2 className="text-2xl font-bold text-slate-600 mb-2">Chưa có bài viết nào</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Các bài viết hướng dẫn kỹ thuật và thông tin về phụ tùng xe tải sẽ được cập nhật tại đây.
            </p>
          </div>
        ) : selectedArticle ? (
          // Article Detail View
          <div>
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại danh sách
            </button>

            <article className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-200 p-8 md:p-12">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                {selectedArticle.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-200">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {new Date(selectedArticle.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="prose prose-slate max-w-none">
                {renderContent(selectedArticle.content)}
              </div>
            </article>
          </div>
        ) : (
          // Articles List
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {articles
              .filter(article =>
                article.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                    {article.thumbnail ? (
                      <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-slate-300 group-hover:text-primary/50 transition-colors">article</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {new Date(article.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 text-center p-12 bg-gradient-to-r from-primary to-sky-600 rounded-3xl shadow-lg">
          <span className="material-symbols-outlined text-6xl text-white/80 mb-4">support_agent</span>
          <h3 className="text-white text-2xl font-bold mb-2">Cần tra mã phụ tùng?</h3>
          <p className="text-white/80 mb-6">
            Liên hệ hotline để được hỗ trợ tra cứu và báo giá nhanh nhất
          </p>
          <a
            href="tel:0382890990"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
          >
            <span className="material-symbols-outlined">call</span>
            0382.890.990
          </a>
        </div>
      </div>
    </div>
  )
}

export default Catalog