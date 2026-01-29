import { Link } from 'react-router-dom'

const categories = [
    { title: 'Cabin & Thân vỏ', desc: 'Gương, kính, bơm cabin, thân vỏ...', icon: 'directions_car', path: '/products' },
    { title: 'Động cơ', desc: 'Piston, kim phun, lọc dầu, lọc gió...', icon: 'engineering', path: '/products' },
    { title: 'Hộp số', desc: 'Bánh răng, đồng tốc, vòng bi hộp số...', icon: 'precision_manufacturing', path: '/products' },
    { title: 'Hệ thống cầu', desc: 'Cầu trước, cầu sau, bánh răng cầu...', icon: 'hub', path: '/products' },
    { title: 'Ly hợp', desc: 'Đĩa ly hợp, bàn ép, bi ly hợp...', icon: 'settings', path: '/products' },
    { title: 'Hệ thống giằng treo', desc: 'Nhíp, giảm chấn, đòn treo...', icon: 'tune', path: '/products' },
    { title: 'Hệ thống truyền động', desc: 'Các-te, trục các đăng...', icon: 'settings_input_component', path: '/products' },
    { title: 'Hệ thống lái', desc: 'Trợ lực lái, thanh lái, bơm lái...', icon: 'explore', path: '/products' },
    { title: 'Hệ thống hút xả', desc: 'Ống xả, turbo, van EGR...', icon: 'air', path: '/products' },
    { title: 'Hệ thống làm mát', desc: 'Két nước, bơm nước, quạt gió...', icon: 'ac_unit', path: '/products' },
    { title: 'Hệ thống điện', desc: 'Máy phát, củ đề, cảm biến...', icon: 'electric_bolt', path: '/products' },
    { title: 'Hệ thống nhiên liệu', desc: 'Bơm dầu, bầu lọc, ống dẫn...', icon: 'local_gas_station', path: '/products' },
    { title: 'Hệ thống moay ơ', desc: 'Moay ơ trước, moay ơ sau...', icon: 'donut_large', path: '/products' },
    { title: 'Hệ thống phanh', desc: 'Má phanh, đĩa phanh, bầu phanh...', icon: 'car_crash', path: '/products' }
]

const CategorySection = () => {
    return (
        <section className="py-24 bg-gray-100">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">Danh Mục Phụ Tùng</h2>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-gray-400 to-primary mx-auto rounded-full shadow-lg shadow-primary/30"></div>
                    <p className="text-slate-500 max-w-2xl mx-auto">Vui lòng chọn danh mục phụ tùng phù hợp với nhu cầu của bạn.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {categories.map((cat, i) => (
                        <Link to={cat.path} key={i} className="group cursor-pointer">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{cat.title}</h4>
                                <p className="text-slate-500 text-sm">{cat.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CategorySection
