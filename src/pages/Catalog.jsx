import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getCatalogArticles, getCatalogArticleById } from '../services/supabase'

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
  const [articleDetailLoading, setArticleDetailLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    hasNext: false,
    hasPrev: false,
    totalPages: 0
  })
  const [searchLoading, setSearchLoading] = useState(false)

  // Debounce search to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load articles from database with search and pagination (list view - without full content)
  const loadArticles = useCallback(async (page = 1, search = '', isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setSearchLoading(true)
      } else {
        setLoading(true)
      }
      
      const result = await getCatalogArticles({
        page,
        limit: ITEMS_PER_PAGE,
        search: search.trim(),
        is_published: true
      })
      
      setArticles(result.data || [])
      setPagination(result.pagination || {})
      setCurrentPage(page)
    } catch (err) {
      console.error('Error loading articles:', err)
      setArticles([])
      setPagination({})
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }, [])

  // Load full article content by ID
  const loadArticleDetail = useCallback(async (articleId) => {
    try {
      setArticleDetailLoading(true)
      const fullArticle = await getCatalogArticleById(articleId)
      
      if (fullArticle) {
        setSelectedArticle(fullArticle)
      } else {
        console.error('Article not found')
        // Fallback to the article from list if full content load fails
        const listArticle = articles.find(a => a.id === articleId)
        if (listArticle) {
          setSelectedArticle(listArticle)
        }
      }
    } catch (err) {
      console.error('Error loading article detail:', err)
      // Fallback to the article from list if full content load fails
      const listArticle = articles.find(a => a.id === articleId)
      if (listArticle) {
        setSelectedArticle(listArticle)
      }
    } finally {
      setArticleDetailLoading(false)
    }
  }, [articles])

  // Initial load
  useEffect(() => {
    loadArticles(1, debouncedSearchTerm)
  }, [loadArticles, debouncedSearchTerm])

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm && debouncedSearchTerm !== '') {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, searchTerm])

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadArticles(newPage, debouncedSearchTerm)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (e.target.value.trim() !== debouncedSearchTerm) {
      setSearchLoading(true)
    }
  }

  // Handle article selection with optimized loading
  const handleArticleSelect = (article) => {
    // If article already has full content, show it immediately
    if (article.content && article.content.blocks && article.content.blocks.length > 0) {
      setSelectedArticle(article)
    } else {
      // Load full content from API
      loadArticleDetail(article.id)
    }
  }

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
        {!selectedArticle && (
          <div className="mb-8 flex justify-end">
            <div className="relative w-full md:w-[480px]">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition-all shadow-sm"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
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
        ) : selectedArticle || articleDetailLoading ? (
          // Article Detail View
          <div>
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8"
              disabled={articleDetailLoading}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại danh sách
            </button>

            {articleDetailLoading ? (
              // Loading state for article detail
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 md:p-12 lg:p-16">
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">Đang tải nội dung bài viết...</p>
                  </div>
                </div>
              </div>
            ) : selectedArticle ? (
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
            ) : null}
          </div>
        ) : (
          // Articles List - Compact Blog Style
          <>
            <div className="space-y-3">
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer"
                  onClick={() => handleArticleSelect(article)}
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

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    Trước
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    Sau
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
                
                <div className="text-center text-sm text-slate-500">
                  Trang {currentPage} / {pagination.totalPages} • Tổng cộng {pagination.total} bài viết
                </div>
              </div>
            )}

            {/* Show count for single page */}
            {pagination.totalPages <= 1 && pagination.total > 0 && (
              <div className="text-center mt-6 text-sm text-slate-500">
                Tổng cộng {pagination.total} bài viết
              </div>
            )}

            {/* No results message */}
            {debouncedSearchTerm && pagination.total === 0 && !loading && (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">search_off</span>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Không tìm thấy bài viết</h3>
                <p className="text-slate-400">
                  Không có bài viết nào khớp với từ khóa "<strong>{debouncedSearchTerm}</strong>"
                </p>
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
