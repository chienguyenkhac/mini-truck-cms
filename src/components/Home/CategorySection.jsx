import { Link } from 'react-router-dom'
import { IMAGES } from '../../constants/images'

const categories = [
    {
        title: 'Xe Ben (Dump Trucks)',
        desc: 'Đa dạng tải trọng, bền bỉ mọi địa hình',
        img: IMAGES.categories.dumpTruck,
        path: '/products/howo-ben'
    },
    {
        title: 'Xe Đầu Kéo (Tractor Units)',
        desc: 'Động cơ mạnh mẽ, tiết kiệm nhiên liệu',
        img: IMAGES.categories.tractorUnit,
        path: '/products/howo-a7'
    },
    {
        title: 'Xe Tải Thùng (Cargo Trucks)',
        desc: 'Vận chuyển linh hoạt, hiệu quả cao',
        img: IMAGES.categories.cargoTruck,
        path: '/products/sitrak'
    }
]

const CategorySection = () => {
    return (
        <section className="py-24 bg-gray-100">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">Danh Mục Sản Phẩm</h2>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-gray-400 to-primary mx-auto rounded-full shadow-lg shadow-primary/30"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {categories.map((cat, i) => (
                        <Link to={cat.path} key={i} className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-[2rem] mb-6 shadow-2xl">
                                <div className="aspect-[4/5] relative">
                                    <img
                                        src={cat.img}
                                        alt={cat.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <span className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                                            Khám Phá Ngay
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center px-4">
                                <h4 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{cat.title}</h4>
                                <p className="text-slate-500 text-sm font-medium">{cat.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CategorySection
