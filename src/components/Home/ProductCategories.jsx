import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Wrench, Settings, Shield } from 'lucide-react'
import './ProductCategories.css'

const categories = [
  {
    id: 'howo-a7',
    title: 'HOWO A7',
    description: 'Phụ tùng chính hãng cho dòng xe Howo A7',
    icon: Truck,
    image: '/images/categories/howo-a7.jpg',
    path: '/products/howo-a7',
    color: '#ff6b35',
  },
  {
    id: 'howo-ben',
    title: 'HOWO BEN',
    description: 'Phụ tùng cho xe ben Howo 336HP, 371HP, 375HP',
    icon: Truck,
    image: '/images/categories/howo-ben.jpg',
    path: '/products/howo-ben',
    color: '#f7931e',
  },
  {
    id: 'sitrak',
    title: 'SITRAK T7H',
    description: 'Phụ tùng SITRAK T7H, MAX chính hãng',
    icon: Truck,
    image: '/images/categories/sitrak.jpg',
    path: '/products/howo-sitrak-t7h',
    color: '#4a90e2',
  },
  {
    id: 'dong-co',
    title: 'ĐỘNG CƠ',
    description: 'WD615, D10, D12, MC11, MC13',
    icon: Settings,
    image: '/images/categories/dong-co.jpg',
    path: '/products/dong-co',
    color: '#e74c3c',
  },
  {
    id: 'hop-so',
    title: 'HỘP SỐ',
    description: 'STR, HC16, AC16, MCY13, MCP16',
    icon: Wrench,
    image: '/images/categories/hop-so.jpg',
    path: '/products/hop-so',
    color: '#27ae60',
  },
  {
    id: 'so-mi-ro-moc',
    title: 'SƠ MI RƠ MOÓC',
    description: '13T & 16T chính hãng',
    icon: Shield,
    image: '/images/categories/ro-moc.jpg',
    path: '/products/so-mi-ro-moc',
    color: '#9b59b6',
  },
]

const ProductCategories = () => {
  const sectionRef = useRef(null)

  return (
    <section ref={sectionRef} className="product-categories section">
      <div className="container">
        <h2 className="section-title">
          DANH MỤC SẢN PHẨM
        </h2>
        <p className="section-subtitle">
          Chuyên cung cấp phụ tùng chính hãng cho các dòng xe tải hạng nặng
        </p>

        <div className="categories-grid">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Link
                key={category.id}
                to={category.path}
                className="category-card"
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon-wrapper">
                  <Icon className="category-icon" />
                </div>
                <div className="category-content">
                  <h3 className="category-title">{category.title}</h3>
                  <p className="category-description">{category.description}</p>
                </div>
                <div className="category-overlay"></div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProductCategories


