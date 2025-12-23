import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'

// Format price
const formatPrice = (price) => {
    if (!price || price === 0) return 'Liên hệ'
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [category, setCategory] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProduct = async () => {
            try {
                // Fetch product
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', parseInt(id))
                    .single()

                if (productError || !productData) {
                    navigate('/products')
                    return
                }

                setProduct(productData)

                // Fetch category
                if (productData.category_id) {
                    const { data: categoryData } = await supabase
                        .from('categories')
                        .select('*')
                        .eq('id', productData.category_id)
                        .single()
                    setCategory(categoryData)

                    // Fetch related products
                    const { data: relatedData } = await supabase
                        .from('products')
                        .select('*')
                        .eq('category_id', productData.category_id)
                        .neq('id', productData.id)
                        .limit(3)
                    setRelatedProducts(relatedData || [])
                }
            } catch (err) {
                console.error('Error loading product:', err)
                navigate('/products')
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [id, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        )
    }

    if (!product) {
        return null
    }

    const imageUrl = product.image
        ? (product.image.startsWith('http') ? product.image : `https://irncljhvsjtohiqllnsv.supabase.co/storage/v1/object/public/products/${product.image}`)
        : null

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-10 lg:px-20 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-slate-800 font-medium">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-10 lg:px-20 py-12">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-lg">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-9xl text-gray-300">settings</span>
                                </div>
                            )}
                        </div>
                        {product.code && (
                            <div className="absolute top-6 left-6 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                                {product.code}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        {category && (
                            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                {category.name}
                            </span>
                        )}

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                            {product.name}
                        </h1>

                        {product.description && (
                            <p className="text-slate-500 text-lg leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* Price */}
                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-200">
                            {product.price > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Giá lẻ:</span>
                                    <span className="text-2xl font-bold text-slate-800">{formatPrice(product.price)}</span>
                                </div>
                            )}
                            {product.price_bulk > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Giá sỉ:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatPrice(product.price_bulk)}</span>
                                </div>
                            )}
                            {product.total > 0 && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <span className="text-slate-600">Tồn kho:</span>
                                    <span className="text-lg font-medium text-slate-800">{product.total} sản phẩm</span>
                                </div>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="tel:0382890990"
                                className="flex-1 py-4 px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                <span className="material-symbols-outlined">call</span>
                                Đặt Hàng Ngay
                            </a>
                            <a
                                href="https://zalo.me/0382890990"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-4 px-8 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">chat</span>
                                Chat Zalo
                            </a>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: 'verified', label: 'Chính hãng 100%' },
                                { icon: 'local_shipping', label: 'Giao toàn quốc' },
                                { icon: 'shield', label: 'Bảo hành uy tín' },
                                { icon: 'support_agent', label: 'Hỗ trợ 24/7' },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <span className="material-symbols-outlined text-primary">{feature.icon}</span>
                                    <span className="text-sm text-slate-700 font-medium">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-slate-800 mb-8">Sản Phẩm Liên Quan</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedProducts.map((p) => (
                                <Link
                                    key={p.id}
                                    to={`/product/${p.id}`}
                                    className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-primary/50 transition-all shadow-sm hover:shadow-lg"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                        {p.image ? (
                                            <img
                                                src={p.image.startsWith('http') ? p.image : `https://irncljhvsjtohiqllnsv.supabase.co/storage/v1/object/public/products/${p.image}`}
                                                alt={p.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => { e.target.style.display = 'none' }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-6xl text-gray-300">settings</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-slate-800 font-bold group-hover:text-primary transition-colors line-clamp-2">
                                            {p.name}
                                        </h3>
                                        {p.price > 0 && (
                                            <p className="text-primary font-bold mt-2">{formatPrice(p.price)}</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDetail
