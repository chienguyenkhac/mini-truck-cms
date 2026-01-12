import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, PresentationControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

// 3D Truck Model
const TruckModel = () => {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Cabin */}
      <mesh position={[0, 0.8, 1.2]}>
        <boxGeometry args={[2, 1.6, 1.5]} />
        <meshStandardMaterial color="#1e9ba8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin window */}
      <mesh position={[0, 1.1, 1.95]}>
        <boxGeometry args={[1.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Cargo container */}
      <mesh position={[0, 1, -1]}>
        <boxGeometry args={[2.2, 2, 4]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Chassis */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 0.3, 5]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Wheels */}
      {[
        [-0.9, -0.2, 1.5], [0.9, -0.2, 1.5],
        [-0.9, -0.2, 0], [0.9, -0.2, 0],
        [-0.9, -0.2, -1.5], [0.9, -0.2, -1.5],
        [-0.9, -0.2, -2.5], [0.9, -0.2, -2.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[-0.6, 0.5, 1.96]}>
        <boxGeometry args={[0.3, 0.2, 0.05]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.6, 0.5, 1.96]}>
        <boxGeometry args={[0.3, 0.2, 0.05]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// Floating decorative spheres
const FloatingSphere = ({ position, color, size }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh position={position}>
        <icosahedronGeometry args={[size, 4]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.5}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

// 3D Scene
const Scene3D = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#fff" />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#1e9ba8" />
      <pointLight position={[5, -5, -5]} intensity={0.4} color="#2dbbc9" />

      <PresentationControls
        global
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0.1, 0.3, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <TruckModel />
      </PresentationControls>

      <FloatingSphere position={[-4, 2, -3]} color="#1e9ba8" size={0.6} />
      <FloatingSphere position={[4, -1, -4]} color="#1e9ba8" size={0.4} />
      <FloatingSphere position={[3, 3, -5]} color="#2dbbc9" size={0.5} />
      <FloatingSphere position={[-3, -2, -4]} color="#38bdf8" size={0.3} />
    </>
  )
}

const About = () => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_visible', true)
          .eq('is_vehicle_name', true)
          .order('name')

        if (!error && data) {
          setCategories(data)
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Clean gradient without 3D */}
      <div className="relative h-[35vh] md:h-[40vh] overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-white to-sky-50" />

        {/* Text content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center px-4"
          >
            <span className="text-primary font-bold text-sm tracking-[0.3em] uppercase mb-4 block">
              SINOTRUK HÀ NỘI
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tighter mb-6">
              GIỚI <span className="text-primary">THIỆU</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-xl mx-auto mb-8">
              Đối tác tin cậy trong lĩnh vực phụ tùng xe tải
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20 space-y-16 -mt-10 relative z-20">
        {/* Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: '15+', label: 'Năm kinh nghiệm' },
            { value: '500+', label: 'Khách hàng tin tưởng' },
            { value: '50K+', label: 'Phụ tùng đã bán' },
            { value: '63', label: 'Tỉnh thành phủ sóng' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-primary text-4xl md:text-5xl font-bold">{stat.value}</div>
              <div className="text-slate-500 text-sm mt-2">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Company Info */}
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm"
        >
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 text-center">
            CÔNG TY CỔ PHẦN SINOTRUK HÀ NỘI
          </h2>
          <div className="text-slate-500 space-y-4 leading-relaxed">
            <p>
              CÔNG TY CỔ PHẦN SINOTRUK HÀ NỘI xin gửi lời chào trân trọng cùng lời chúc sức khoẻ, tới toàn thể Quý Khách Hàng đã quan tâm và sử dụng các sản phẩm mà Công ty chúng tôi phân phối trên thị trường trong suốt thời gian qua.
            </p>
            <p>
              CÔNG TY CỔ PHẦN SINOTRUK HÀ NỘI là công ty chuyên nhập khẩu và phân phối phụ tùng cho xe tải hạng nặng, xe chuyên dụng, xe máy công trình do Trung Quốc sản xuất: HOWO/SINOTRUK, CHENGLONG. Chúng tôi chuyên cung cấp phụ tùng để bảo hành, thay thế cho xe của hãng Sinotruk với các chủng loại HOWO A7, 420, 375, 380 , Xe trộn bê tông/ Xe ben Howo 336-371 và các chủng loại sơ mi rơ mooc CIMC.
            </p>
            <p>
              Với sự hiểu biết sâu sắc về các chủng loại xe tải nặng do Trung Quốc sản xuất, phong cách phục vụ chuyên nghiệp và giá cả cạnh tranh cùng chế độ bảo hành cho sản phẩm, chúng tôi mong rằng sẽ trở thành đối tác tin cậy của Quý khách hàng trên toàn quốc.
            </p>
          </div>
        </motion.section>

        {/* Category Showcase - No Title */}
        {categories.length > 0 && (
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {categories.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/products?vehicle=${vehicle.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block text-center"
                >
                  <div className="aspect-square relative mb-3 bg-white rounded-lg p-2 border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <img
                      src={vehicle.thumbnail || '/images/default-truck.png'}
                      alt={vehicle.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { e.target.src = '/images/default-truck.png' }}
                    />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors uppercase leading-tight line-clamp-2">
                    {vehicle.name}
                  </h3>
                  {vehicle.code && (
                    <p className="text-xs text-slate-400 mt-0.5 uppercase">{vehicle.code}</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.section>
        )}

        {/* Warranty Policy */}
        <motion.section
          id="warranty"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/30">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              CHÍNH SÁCH BẢO HÀNH
            </h2>
          </div>
          <div className="text-slate-500 space-y-6 leading-relaxed">
            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">1. Điều kiện bảo hành</h3>
              <ul className="space-y-2 pl-6">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Sản phẩm phải được mua tại công ty
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Sản phẩm phải còn nguyên tem bảo hành
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Sản phẩm phải trong thời hạn bảo hành từ ngày mua
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Sản phẩm có lỗi kỹ thuật do nhà cung cấp (không bảo hành lỗi do người dùng)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">2. Chính sách đổi trả</h3>
              <p>
                Chúng tôi nhận đổi trả ngay lập tức nếu phụ tùng xe tải do công
                ty cung cấp không đúng mã sản phẩm, chất lượng hoặc mô tả so
                với đơn hàng của khách hàng.
              </p>
              <p className="mt-3">
                <span className="text-primary font-bold">Thời gian đổi trả:</span> Trong vòng 03 ngày kể từ
                ngày khách hàng nhận hàng, với điều kiện hàng hóa còn nguyên
                vẹn, chưa sử dụng.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Supply Policy */}
        <motion.section
          id="supply"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/30">
              <span className="material-symbols-outlined text-3xl">inventory_2</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              CHÍNH SÁCH CUNG CẤP
            </h2>
          </div>
          <div className="text-slate-500 leading-relaxed">
            <p>
              Chúng tôi cam kết cung cấp sản phẩm chính hãng với chất lượng
              cao nhất. Tất cả sản phẩm đều được kiểm tra kỹ lưỡng trước khi
              giao đến tay khách hàng.
            </p>
          </div>
        </motion.section>

        {/* Payment Methods */}
        <motion.section
          id="payment"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/30">
              <span className="material-symbols-outlined text-3xl">payments</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              PHƯƠNG THỨC THANH TOÁN
            </h2>
          </div>
          <div className="text-slate-500 leading-relaxed">
            <p className="mb-4">Chúng tôi chấp nhận các hình thức thanh toán sau:</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: 'local_atm', label: 'Tiền mặt (COD)' },
                { icon: 'account_balance', label: 'Chuyển khoản' },
                { icon: 'wallet', label: 'Ví điện tử' },
              ].map((method, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-primary/30 transition-colors">
                  <span className="material-symbols-outlined text-primary text-2xl">{method.icon}</span>
                  <span className="text-slate-700 font-medium">{method.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default About
