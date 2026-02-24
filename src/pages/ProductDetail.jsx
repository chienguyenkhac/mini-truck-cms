import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, getProductImages, getImageUrl } from '../services/supabase'

const ProductDetail = () => {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [category, setCategory] = useState(null)
    const [vehicles, setVehicles] = useState([])
    const [relatedProducts, setRelatedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [images, setImages] = useState([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Auto-slide images every 7 seconds
    useEffect(() => {
        if (images.length <= 1) return

        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length)
        }, 7000)

        return () => clearInterval(interval)
    }, [images.length])

    const nextImage = useCallback(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length)
    }, [images.length])

    const prevImage = useCallback(() => {
        setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
    }, [images.length])

    useEffect(() => {
        const loadProduct = async () => {
            try {
                let productData = null
                let productError = null

                // Try to parse slug as ID first
                const productId = parseInt(slug)
                
                if (!isNaN(productId)) {
                    // If slug is a number, search by ID
                    const result = await supabase
                        .from('products')
                        .select('*')
                        .eq('id', productId)
                        .single()
                    productData = result.data
                    productError = result.error
                } else {
                    // If slug is not a number, search by slug field
                    const result = await supabase
                        .from('products')
                        .select('*')
                        .eq('slug', slug)
                        .maybeSingle()
                    productData = result.data
                    productError = result.error
                }

                // If slug search fails and slug is not numeric, try searching by name similarity
                if ((!productData || productError) && isNaN(parseInt(slug))) {
                    // As a last resort, try to find product by name similarity
                    const result = await supabase
                        .from('products')
                        .select('*')
                        .ilike('name', `%${slug.replace(/-/g, ' ')}%`)
                        .limit(1)
                        .maybeSingle()
                    productData = result.data
                    productError = result.error
                }

                if (productError || !productData) {
                    setLoading(false)
                    return
                }

                setProduct(productData)

                // Load multi-images from product_images table
                const productImages = await getProductImages(productData.id)

                // If no images in junction table, use legacy image field
                if (productImages.length > 0) {
                    setImages(productImages)
                } else if (productData.image) {
                    setImages([getImageUrl(productData.image)])
                }

                // Fetch category
                if (productData.category_id) {
                    const { data: categoryData } = await supabase
                        .from('categories')
                        .select('*')
                        .eq('id', productData.category_id)
                        .single()
                    setCategory(categoryData)

                    // Fetch related products (only visible ones)
                    const { data: relatedData } = await supabase
                        .from('products')
                        .select('*')
                        .eq('category_id', productData.category_id)
                        .eq('show_on_homepage', true)
                        .neq('id', productData.id)
                        .limit(3)
                    setRelatedProducts(relatedData || [])
                }

                // Fetch vehicle types if product has vehicle_ids
                if (productData.vehicle_ids && productData.vehicle_ids.length > 0) {
                    const { data: vehicleData } = await supabase
                        .from('categories')
                        .select('*')
                        .in('id', productData.vehicle_ids)
                        .eq('is_vehicle_name', true)
                    setVehicles(vehicleData || [])
                }
            } catch (err) {
                console.error('Error loading product:', err)
                navigate('/products')
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [slug, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy sản phẩm</h1>
                    <p className="text-slate-600 mb-4">Sản phẩm với slug "{slug}" không tồn tại.</p>
                    <Link 
                        to="/products" 
                        className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Quay lại danh sách sản phẩm
                    </Link>
                </div>
            </div>
        )
    }

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
                    {/* Product Image Carousel */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="w-full max-w-[600px] h-[400px] sm:h-[500px] mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-lg relative">
                            <AnimatePresence mode="wait">
                                {images.length > 0 ? (
                                    <motion.img
                                        key={currentImageIndex}
                                        src={images[currentImageIndex]}
                                        alt={product.name}
                                        className="w-full h-full object-contain bg-white"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.3 }}
                                        onError={(e) => { e.target.style.display = 'none' }}

                                        draggable={false}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-9xl text-gray-300">settings</span>
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>

                                    {/* Dots Indicator */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-primary' : 'bg-white/70'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${idx === currentImageIndex ? 'border-primary' : 'border-gray-200'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} ${idx + 1}`}
                                            className="w-full h-full object-cover"

                                            draggable={false}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {product.manufacturer_code && (
                            <div className="absolute top-6 left-6 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                                {product.manufacturer_code}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        {/* Category and Vehicle Tags */}
                        <div className="flex flex-wrap gap-2">
                            {category && (
                                <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                    {category.name}
                                </span>
                            )}
                            {vehicles.map((vehicle) => (
                                <span 
                                    key={vehicle.id}
                                    className="inline-block px-4 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full border border-blue-200"
                                >
                                    {vehicle.name}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                            {product.name}
                        </h1>

                        {/* Product Codes */}
                        {product.manufacturer_code && (
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="font-medium">Mã NSX:</span>
                                    <span className="font-mono bg-slate-100 px-2 py-1 rounded">{product.manufacturer_code}</span>
                                </div>
                            </div>
                        )}

                        {product.description && (
                            <p className="text-slate-500 text-lg leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="tel:0382890990"
                                className="flex-1 py-3 px-6 bg-[#c41e1e] text-white font-semibold rounded-lg hover:bg-[#a01818] transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">call</span>
                                Đặt Hàng Ngay
                            </a>
                            <a
                                href="https://zalo.me/0382890990"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 px-6 bg-[#0068ff] text-white font-semibold rounded-lg hover:bg-[#0056d6] transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">chat</span>
                                Chat Zalo
                            </a>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: 'verified', label: 'Chính hãng, Original Parts' },
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
                {
                    relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Sản Phẩm Liên Quan</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {relatedProducts.map((p) => (
                                    <Link
                                        key={p.id}
                                        to={`/product/${p.slug || p.id}`}
                                        className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                            {p.image ? (
                                                <img
                                                    src={getImageUrl(p.image)}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => { e.target.style.display = 'none' }}

                                                    draggable={false}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-6xl text-gray-300">settings</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-slate-800 font-medium text-xs group-hover:text-primary transition-colors line-clamp-2">
                                                {p.name}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    )
}

export default ProductDetail
