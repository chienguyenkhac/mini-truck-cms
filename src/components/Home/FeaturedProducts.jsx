import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import ProductCard from '../Product/ProductCard'
import './FeaturedProducts.css'

// Mock data - sẽ thay bằng API sau
const mockProducts = [
  {
    id: 1,
    name: 'Xilanh kích cabin VX350 VX400 chính hãng',
    code: 'XLKVX',
    manufacturerCode: 'WG9525820140/2',
    image: '/images/products/xilanh-kich-cabin.jpg',
    category: 'CABIN & THÂN VỎ',
  },
  {
    id: 2,
    name: 'Tăm bét trước VGD95 SITRAK T7H',
    code: 'TBTSI.L',
    manufacturerCode: 'AZ4095410005 - AZ4095410006',
    image: '/images/products/tam-bet-truoc.jpg',
    category: 'ĐỘNG CƠ',
  },
  {
    id: 3,
    name: 'Bánh răng trục A cơ hộp số 25712XSTL',
    code: 'BRCA0123',
    manufacturerCode: 'WG2211020123 - WG2211020023',
    image: '/images/products/banh-rang-truc.jpg',
    category: 'HỘP SỐ',
  },
  {
    id: 4,
    name: 'Van giảm áp SITRAK mã 0549',
    code: 'VGA0549',
    manufacturerCode: 'WG9000360549',
    image: '/images/products/van-giam-ap.jpg',
    category: 'HỆ THỐNG HÚT XẢ',
  },
  {
    id: 5,
    name: 'Bơm nước động cơ MC07 - VX350',
    code: 'BNMC07',
    manufacturerCode: '080V06500-',
    image: '/images/products/bom-nuoc-dong-co.jpg',
    category: 'ĐỘNG CƠ',
  },
  {
    id: 6,
    name: 'Vỏ sinh hàn D1 V7G HW380',
    code: 'VSHV7G',
    manufacturerCode: 'VG1034010015',
    image: '/images/products/vo-sinh-han.jpg',
    category: 'HT LÀM MÁT',
  },
]

const FeaturedProducts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)

  useEffect(() => {
    const filtered = mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturerCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [searchTerm])

  return (
    <section className="featured-products section">
      <div className="container">
        <h2 className="section-title">
          SẢN PHẨM NỔI BẬT
        </h2>
        <p className="section-subtitle">
          Những sản phẩm được khách hàng tin dùng nhất
        </p>

        <div className="search-wrapper">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên, mã sản phẩm hoặc mã NSX..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <span className="search-results-count">
                {filteredProducts.length} kết quả
              </span>
            )}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Không tìm thấy sản phẩm nào phù hợp với "{searchTerm}"</p>
          </div>
        )}

        <div className="view-all-wrapper">
          <Link to="/products" className="btn-view-all">
            Xem Tất Cả Sản Phẩm
            <ArrowRight className="btn-icon" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts


