import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'

// Fallback categories with icons (used if database is not available)
const fallbackCategories = [
    { title: 'Cabin & Thân vỏ', desc: 'Gương, đèn, kính chắn gió, thân vỏ...', icon: 'directions_car', slug: 'cabin-than-vo' },
    { title: 'Động cơ', desc: 'Bộ hơi, kim phun, trục cơ, bạc biên balie...', icon: 'engineering', slug: 'dong-co' },
    { title: 'Hộp số', desc: 'Bánh răng, đồng tốc, chuyển tầng, vòng bi...', icon: 'precision_manufacturing', slug: 'hop-so' },
    { title: 'Hệ thống cầu', desc: 'Visai, vành chậu, cầu tổng thành...', icon: 'hub', slug: 'he-thong-cau' },
    { title: 'Ly hợp', desc: 'Lá côn, bàn ép, bánh đà...', icon: 'settings', slug: 'ly-hop' },
    { title: 'Hệ thống giằng treo', desc: 'Nhíp, giằng cầu, ba-lăng-xê...', icon: 'tune', slug: 'he-thong-giang-treo' },
    { title: 'Hệ thống truyền động', desc: 'Trục các đăng, bi quang treo...', icon: 'settings_input_component', slug: 'he-thong-truyen-dong' },
    { title: 'Hệ thống lái', desc: 'Trợ lực lái, thước lái, bơm lái, dầu thủy lực...', icon: 'explore', slug: 'he-thong-lai' },
    { title: 'Hệ thống hút xả', desc: 'Ống xả, turbo, van EGR...', icon: 'air', slug: 'he-thong-hut-xa' },
    { title: 'Hệ thống làm mát', desc: 'Két nước, két gió, bơm nước, quạt gió...', icon: 'ac_unit', slug: 'he-thong-lam-mat' },
    { title: 'Hệ thống điện', desc: 'Máy phát, củ đề, cảm biến...', icon: 'electric_bolt', slug: 'he-thong-dien' },
    { title: 'Hệ thống nhiên liệu', desc: 'Bơm dầu, bầu lọc, ống dẫn...', icon: 'local_gas_station', slug: 'he-thong-nhien-lieu' },
    { title: 'Hệ thống moay ơ', desc: 'Moay ơ, bi moay ơ, phớt moay ơ...', icon: 'donut_large', slug: 'he-thong-moay-o' },
    { title: 'Hệ thống phanh', desc: 'Má phanh, đĩa phanh, bầu phanh lốc kê...', icon: 'car_crash', slug: 'he-thong-phanh' }
]

// Map category names to icons
const iconMap = {
    'cabin': 'directions_car',
    'động cơ': 'engineering',
    'hộp số': 'precision_manufacturing',
    'cầu': 'hub',
    'ly hợp': 'settings',
    'giằng treo': 'tune',
    'truyền động': 'settings_input_component',
    'lái': 'explore',
    'hút xả': 'air',
    'làm mát': 'ac_unit',
    'điện': 'electric_bolt',
    'nhiên liệu': 'local_gas_station',
    'moay': 'donut_large',
    'phanh': 'car_crash'
}

const getIconForCategory = (name) => {
    const lowerName = name.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerName.includes(key)) return icon
    }
    return 'category' // default icon
}

const CategorySection = () => {
    const [categories, setCategories] = useState(fallbackCategories)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('id, name, slug, code')
                    .eq('is_vehicle_name', false)
                    .eq('is_visible', true)
                    .order('name')

                if (!error && data && data.length > 0) {
                    // Map database categories to display format
                    const mappedCategories = data.map(cat => ({
                        title: cat.name,
                        desc: '', // Can be added to database later
                        icon: getIconForCategory(cat.name),
                        slug: cat.slug || cat.id.toString()
                    }))
                    setCategories(mappedCategories)
                }
            } catch (err) {
                console.error('Error loading categories:', err)
                // Keep fallback categories on error
            }
        }
        loadCategories()
    }, [])

    return (
    <section className="pt-0 sm:pt-3 md:pt-10 pb-14 bg-gray-100">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="text-center mb-10 space-y-4">
                    <div>
                        <h2 className="text-slate-800 text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                            Danh Mục <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">Phụ Tùng</span>
                        </h2>
                    </div>
                    <p className="text-slate-500 text-base leading-relaxed max-w-2xl mx-auto">
                        Vui lòng chọn danh mục phụ tùng phù hợp với nhu cầu của bạn.
                    </p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 md:gap-4">
                    {categories.map((cat, i) => (
                        <Link to={`/products/${cat.slug}`} key={i} className="group cursor-pointer">
                            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 text-center">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-2 group-hover:bg-primary group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                </div>
                                <h4 className="text-slate-800 font-bold text-xs leading-snug group-hover:text-primary transition-colors">{cat.title}</h4>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CategorySection
