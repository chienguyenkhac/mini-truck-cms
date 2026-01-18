import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'

// Fallback image for vehicles without thumbnail
const DEFAULT_TRUCK_IMAGE = '/images/default-truck.png'

const VehicleShowcase = () => {
    const [vehicles, setVehicles] = useState([])
    const [brands, setBrands] = useState([]) // Unique brands
    const [selectedBrand, setSelectedBrand] = useState('all')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 5

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                // Fetch ALL visible vehicle categories
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_visible', true)
                    .eq('is_vehicle_name', true)
                    .order('name')

                if (!error && data) {
                    setVehicles(data)

                    // Extract unique brands from code field
                    const uniqueBrands = [...new Set(data.map(v => v.code).filter(Boolean))]
                    setBrands(uniqueBrands)
                }
            } catch (err) {
                console.error('Error loading vehicles:', err)
            } finally {
                setLoading(false)
            }
        }

        loadVehicles()
    }, [])

    // Filter vehicles by selected brand
    const filteredVehicles = selectedBrand === 'all'
        ? vehicles
        : vehicles.filter(v => v.code === selectedBrand)

    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
    const startIndex = currentPage * itemsPerPage
    const displayedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage)

    // Reset page when brand changes
    useEffect(() => {
        setCurrentPage(0)
    }, [selectedBrand])

    const handlePrev = () => {
        setCurrentPage(prev => Math.max(0, prev - 1))
    }

    const handleNext = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
    }

    // Dynamic subtitle based on available brands
    const brandsText = brands.length > 0
        ? brands.join(', ')
        : 'HOWO, SITRAK, SINOTRUK'

    if (loading) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 md:px-10 lg:px-20">
                    <div className="flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                </div>
            </section>
        )
    }

    if (vehicles.length === 0) {
        return null
    }

    return (
        <section className="py-2 bg-gray-50">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                {/* Header */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-6"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                        Phụ Tùng <span className="text-primary">Theo Xe</span>
                    </h2>
                    <p className="text-slate-500 text-base">
                        Tìm phụ tùng chính hãng theo dòng xe {brandsText}
                    </p>
                </motion.div>

                {/* Brand Filter */}
                {brands.length > 1 && (
                    <div className="flex justify-center gap-2 mb-8 flex-wrap">
                        <button
                            onClick={() => setSelectedBrand('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedBrand === 'all'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            Tất cả
                        </button>
                        {brands.map(brand => (
                            <button
                                key={brand}
                                onClick={() => setSelectedBrand(brand)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedBrand === brand
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                )}

                {/* Carousel Container */}
                <div className="relative">
                    {/* Prev Button */}
                    {currentPage > 0 && (
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-slate-200"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                    )}

                    {/* Vehicle Row */}
                    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${displayedVehicles.length < 5 ? 'justify-items-center' : ''}`}>
                        {displayedVehicles.map((vehicle, index) => (
                            <motion.div
                                key={vehicle.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={displayedVehicles.length < 5 ? 'w-full max-w-[200px]' : ''}
                            >
                                <Link
                                    to={`/products?vehicle=${vehicle.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block text-center"
                                >
                                    {/* Image Container */}
                                    <div className="aspect-square relative mb-3 bg-white rounded-lg p-2 border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                                        <img
                                            src={vehicle.thumbnail || DEFAULT_TRUCK_IMAGE}
                                            alt={vehicle.name}
                                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                            onError={(e) => { e.target.src = DEFAULT_TRUCK_IMAGE }}
                                        />
                                    </div>

                                    {/* Vehicle Name (Mã xe) */}
                                    <h3 className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors uppercase leading-tight line-clamp-2">
                                        {vehicle.name}
                                    </h3>
                                    {/* Brand (Hãng xe) */}
                                    {vehicle.code && (
                                        <p className="text-xs text-slate-400 mt-0.5 uppercase">{vehicle.code}</p>
                                    )}
                                </Link>
                            </motion.div>
                        ))}

                        {/* Fill empty slots for consistent layout - only when 5 items */}
                        {displayedVehicles.length === itemsPerPage &&
                            [...Array(itemsPerPage - displayedVehicles.length)].map((_, i) => (
                                <div key={`empty-${i}`} className="hidden lg:block opacity-0"></div>
                            ))
                        }
                    </div>

                    {/* Next Button */}
                    {currentPage < totalPages - 1 && (
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-slate-200"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    )}
                </div>

                {/* Pagination Dots */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`w-2 h-2 rounded-full transition-all ${currentPage === i
                                    ? 'bg-primary w-6'
                                    : 'bg-slate-300 hover:bg-slate-400'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default VehicleShowcase
