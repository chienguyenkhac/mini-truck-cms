import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'

const CategoryShowcase = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Fetch visible categories with thumbnails
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_visible', true)
                    .not('thumbnail', 'is', null)
                    .order('name')
                    .limit(8)

                if (!error && data) {
                    setCategories(data)
                }
            } catch (err) {
                console.error('Error loading categories:', err)
            } finally {
                setLoading(false)
            }
        }

        loadCategories()
    }, [])

    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 md:px-10 lg:px-20">
                    <div className="flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                </div>
            </section>
        )
    }

    if (categories.length === 0) {
        return null // Don't render if no categories with thumbnails
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                {/* Header */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                        Danh Mục <span className="text-primary">Sản Phẩm</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Khám phá các dòng phụ tùng chính hãng cho xe tải SINOTRUK
                    </p>
                </motion.div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                to={`/products/${category.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                            >
                                {/* Image */}
                                <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                    {category.thumbnail ? (
                                        <img
                                            src={category.thumbnail}
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-5xl text-gray-300">category</span>
                                        </div>
                                    )}
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                {/* Content */}
                                <div className="p-4 text-center">
                                    <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                                        {category.name}
                                    </h3>
                                    {category.code && (
                                        <p className="text-xs text-slate-400 mt-1 font-mono">{category.code}</p>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-10"
                >
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Xem Tất Cả Sản Phẩm
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default CategoryShowcase
