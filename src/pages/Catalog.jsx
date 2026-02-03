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

const ITEMS_PER_PAGE = 10

const Catalog = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)

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

  // Filter articles based on search
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get displayed articles
  const displayedArticles = filteredArticles.slice(0, displayCount)
  const hasMore = displayCount < filteredArticles.length

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE)
  }

  // Reset display count when search changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [searchTerm])

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
          <div className="mb-8 flex justify-end">
            <div className="relative w-full md:w-[480px]">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition-all shadow-sm"
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

            <article className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 md:p-12 lg:p-16">
              {/* Header with thumbnail */}
              <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-slate-200">
                {selectedArticle.thumbnail && (
                  <div className="md:w-48 flex-shrink-0">
                    <img
                      src={selectedArticle.thumbnail}
                      alt={selectedArticle.title}
                      className="w-full aspect-video object-cover rounded-xl shadow-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                    {selectedArticle.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {new Date(selectedArticle.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="prose prose-slate max-w-none">
                {renderContent(selectedArticle.content)}
              </div>
            </article>
          </div>
        ) : (
          // Articles List - Compact Blog Style
          <>
            <div className="space-y-3">
              {displayedArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex flex-col md:flex-row gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="md:w-40 md:flex-shrink-0">
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        {article.thumbnail ? (
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary/50 transition-colors">
                            article
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1.5">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        <span>{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                      
                      <h2 className="text-base md:text-lg font-bold text-slate-800 mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      
                      {/* Extract first paragraph as excerpt */}
                      {article.content?.blocks && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                          {article.content.blocks
                            .find(block => block.type === 'paragraph')
                            ?.data?.text?.replace(/<[^>]*>/g, '') || ''}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-primary text-xs font-semibold group-hover:gap-1.5 transition-all">
                        <span>Đọc thêm</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-lg flex items-center gap-2"
                >
                  <span>Xem thêm bài viết</span>
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </button>
              </div>
            )}

            {/* Show count */}
            {filteredArticles.length > 0 && (
              <div className="text-center mt-6 text-sm text-slate-500">
                Đang hiển thị {displayedArticles.length} / {filteredArticles.length} bài viết
              </div>
            )}
          </>
        )}

        {/* Contact CTA */}
        <div className="mt-6 text-center p-4 md:p-5 bg-gradient-to-r from-primary to-sky-600 rounded-2xl shadow-lg">
          <span className="material-symbols-outlined text-4xl text-white/80 mb-2 block">support_agent</span>
          <h3 className="text-white text-lg font-bold mb-0.5">Cần tra mã phụ tùng?</h3>
          <p className="text-white/80 text-sm mb-3">
            Liên hệ hotline để được hỗ trợ tra cứu và báo giá nhanh nhất
          </p>
          <a
            href="tel:0382890990"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-primary font-bold rounded-lg hover:bg-slate-100 transition-colors shadow-lg text-sm"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            0382.890.990
          </a>
        </div>
      </div>
    </div>
  )
}

export default Catalog