import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'

// Fallback image for vehicles without thumbnail
const DEFAULT_TRUCK_IMAGE = '/images/default-truck.png'

const VehicleShowcase = () => {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                // Fetch ALL visible vehicle categories (with or without thumbnails)
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_visible', true)
                    .eq('is_vehicle_name', true)
                    .order('name')
                    .limit(6)

                if (!error && data) {
                    setVehicles(data)
                }
            } catch (err) {
                console.error('Error loading vehicles:', err)
            } finally {
                setLoading(false)
            }
        }

        loadVehicles()
    }, [])

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 md:px-10 lg:px-20">
                    <div className="flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                </div>
            </section>
        )
    }

    if (vehicles.length === 0) {
        return null // Don't render if no vehicle categories
    }

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                {/* Header */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                        Phụ Tùng <span className="text-primary">Theo Xe</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Tìm phụ tùng chính hãng theo dòng xe HOWO, SITRAK, SINOTRUK
                    </p>
                </motion.div>

                {/* Vehicle Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                    {vehicles.map((vehicle, index) => (
                        <motion.div
                            key={vehicle.id}
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                to={`/products?vehicle=${vehicle.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-slate-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-primary/30"
                            >
                                {/* Image - use thumbnail or fallback */}
                                <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                                    <img
                                        src={vehicle.thumbnail || DEFAULT_TRUCK_IMAGE}
                                        alt={vehicle.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = DEFAULT_TRUCK_IMAGE }}
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                    {/* Vehicle Name on Image */}
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">
                                            {vehicle.name}
                                        </h3>
                                        {vehicle.code && (
                                            <p className="text-white/80 text-sm font-mono mt-1">{vehicle.code}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="p-4 flex items-center justify-between">
                                    <span className="text-slate-600 text-sm font-medium">Xem phụ tùng</span>
                                    <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">arrow_forward</span>
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default VehicleShowcase
