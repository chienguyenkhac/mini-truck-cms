import { useRef } from 'react'
import { Shield, Truck, Award, Headphones } from 'lucide-react'
import './WhyChooseUs.css'

const features = [
  {
    icon: Shield,
    title: 'Chính Hãng 100%',
    description: 'Cam kết sản phẩm chính hãng, có đầy đủ giấy tờ và bảo hành',
    color: '#e74c3c',
  },
  {
    icon: Truck,
    title: 'Giao Hàng Nhanh',
    description: 'Giao hàng toàn quốc, thanh toán linh hoạt, hỗ trợ 24/7',
    color: '#3498db',
  },
  {
    icon: Award,
    title: 'Uy Tín Lâu Năm',
    description: 'Kinh nghiệm nhiều năm trong ngành, được khách hàng tin tưởng',
    color: '#f39c12',
  },
  {
    icon: Headphones,
    title: 'Hỗ Trợ Tận Tình',
    description: 'Đội ngũ tư vấn chuyên nghiệp, hỗ trợ kỹ thuật miễn phí',
    color: '#27ae60',
  },
]

const WhyChooseUs = () => {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  return (
    <section ref={sectionRef} className="why-choose-us section">
      <div className="container">
        <h2 className="section-title">
          TẠI SAO CHỌN CHÚNG TÔI
        </h2>
        <p className="section-subtitle">
          Đối tác tin cậy cho mọi nhu cầu phụ tùng xe tải
        </p>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                ref={(el) => (cardsRef.current[index] = el)}
                className="feature-card"
                style={{ '--feature-color': feature.color }}
              >
                <div className="feature-icon-wrapper">
                  <Icon className="feature-icon" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs

