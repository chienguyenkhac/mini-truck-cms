import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Package, Eye } from 'lucide-react'
import './ProductCard.css'

const ProductCard = ({ product, index }) => {
  const cardRef = useRef(null)

  return (
    <div ref={cardRef} className="product-card">
      <Link to={`/product/${product.slug || product.id}`} className="product-card-link">
        <div className="product-image-wrapper">
          <div className="product-image-placeholder">
            <Package className="product-placeholder-icon" />
          </div>
          <div className="product-category-badge">{product.category}</div>
          <div className="product-overlay">
            <Eye className="overlay-icon" />
            <span>Xem chi tiết</span>
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-codes">
            <div className="product-code">
              <span className="code-label">Mã:</span>
              <span className="code-value">{product.code}</span>
            </div>
            <div className="product-manufacturer-code">
              <span className="code-label">Mã NSX:</span>
              <span className="code-value">{product.manufacturerCode}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
