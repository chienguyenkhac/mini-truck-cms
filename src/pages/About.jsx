import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, PresentationControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useSiteSettings } from '../context/SiteSettingsContext'

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
  const { settings } = useSiteSettings()
  const hotline = settings.contact_phone || '0382.890.990'
  const address = settings.address || 'Thôn 1, Xã Lại Yên, Hoài Đức, Hà Nội (cách cầu vượt An Khánh 300m)'
  const email = settings.contact_email || 'hnsinotruk@gmail.com'
  const companyName =
    (settings.site_name && settings.site_name.toUpperCase()) ||
    'CÔNG TY CỔ PHẦN SINOTRUK HÀ NỘI'

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
      {/* Compact Header */}
      <div className="relative py-10 md:py-14 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-white to-sky-50" />

        {/* Text content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center px-4"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 tracking-tighter mb-2">
              GIỚI <span className="text-primary">THIỆU</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              Đối tác tin cậy trong lĩnh vực phụ tùng xe tải
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-10 space-y-6 md:space-y-8 lg:space-y-10 relative z-20">
        {/* Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { value: '15+', label: 'Năm kinh nghiệm' },
            { value: '3000+', label: 'Khách hàng tin tưởng' },
            { value: '50K+', label: 'Phụ tùng đã bán' },
            { value: '63', label: 'Tỉnh thành phủ sóng' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl p-3 md:p-4 text-center shadow-sm">
              <div className="text-primary text-2xl md:text-3xl font-bold">{stat.value}</div>
              <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
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
            {companyName}
          </h2>
          <div className="text-slate-500 space-y-4 leading-relaxed">
            <p>
              {companyName} xin gửi lời chào trân trọng cùng lời chúc sức khoẽ, tới toàn thể Quý Khách Hàng đã quan tâm
              và sử dụng các sản phẩm mà Công ty chúng tôi phân phối trên thị trường trong suốt thời gian qua.
            </p>
            <p>
              {companyName} là công ty chuyên nhập khẩu và phân phối phụ tùng cho xe tải hạng nặng, xe chuyên dụng, xe máy
              công trình do Trung Quốc sản xuất: HOWO/SINOTRUK, CHENGLONG. Chúng tôi chuyên cung cấp phụ tùng để bảo hành,
              thay thế cho xe của hãng Sinotruk với các chủng loại HOWO A7, 420, 375, 380 , Xe trộn bê tông/ Xe ben Howo
              336-371 và các chủng loại sơ mi rơ mooc CIMC.
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
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3"
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
                  <div className="aspect-square relative mb-2 bg-white rounded-lg p-1.5 border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <img
                      src={vehicle.thumbnail || '/images/default-truck.svg'}
                      alt={vehicle.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Prevent infinite loop: only try fallback once
                        if (!e.target.dataset.errorHandled) {
                          e.target.dataset.errorHandled = 'true'
                          e.target.src = '/images/default-truck.svg'
                        } else {
                          // If fallback also fails, hide the image
                          e.target.style.display = 'none'
                        }
                      }}
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-primary transition-colors uppercase leading-tight line-clamp-2">
                    {vehicle.name}
                  </h3>
                  {vehicle.code && (
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 uppercase">{vehicle.code}</p>
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
          <div className="text-slate-500 space-y-6 leading-relaxed">
            <p>
              Sản phẩm chúng tôi bán thông qua hệ thống trực tuyến, trực tiếp qua kênh phân phối và cung cấp toàn lãnh thổ Việt Nam. Để nắm rõ thông tin, quy chế bán hàng xin vui lòng liên hệ theo:
            </p>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">Thông tin liên lạc:</h3>
              <p className="font-bold text-slate-700 uppercase">{companyName}</p>
              <ul className="mt-2 space-y-1 pl-0 list-none">
                <li>Địa chỉ: {address}</li>
                <li>Điện thoại: {hotline}</li>
                <li>Email: {email}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">1. Thời gian chờ xử lý:</h3>
              <p>
                Chúng tôi sẽ thông tin lại cho Quý khách hàng trong vòng 24 giờ sau khi nhận được đơn đặt hàng của Quý khách. Thời gian làm việc của chúng tôi được bắt đầu tất cả các ngày làm việc trong tuần từ 08h00 – 17h00. Không bao gồm các buổi tối hoặc ngày nghỉ cuối tuần.
              </p>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">2. Thời gian đặt hàng:</h3>
              <p>
                Thời gian đặt hàng thông thường từ 10-15 ngày ngay sau khi ký hợp đồng. Trong trường hợp đặc biệt (có thể cấm biên hay vì lý do nào đó...điều này bất khả kháng) thì thời gian đặt hàng có thể kéo dài tối đa 30 ngày sau khi ký hợp đồng. Trong trường hợp này chúng tôi sẽ liên lạc với bạn qua điện thoại, Email hoặc Fax để lấy ý kiến của khách tiếp tục hay hủy bỏ đơn hàng.
              </p>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">3. Điều kiện giao hàng:</h3>
              <p>
                Quý khách có thể lựa chọn hình thức vận chuyển đường bộ thông qua hệ thống tàu hỏa, xe tải, xe ôm hoặc công ty vận chuyển Bắc Nam. Chúng tôi không chịu trách nhiệm trong trường hợp hàng giao trễ khi Quý khách đã lựa chọn một trong các hình thức trên vì lý do bất khả kháng của các hãng vận chuyển.
              </p>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">4. Hủy đơn hàng:</h3>
              <p>
                Quý khách hàng có thời gian 1-2 ngày làm việc (không bao gồm các ngày nghỉ lễ hoặc cuối tuần) để hủy bỏ đơn hàng (trả lại hàng) sau khi nhận được hàng trong trường hợp hàng không đúng theo yêu cầu, hàng sai về mặt kỹ thuật, hàng lỗi. Nếu quá ngày trên chúng tôi sẽ không đồng ý cho Quý khách trả lại hàng. Trường hợp Quý khách sẽ không trả lại hàng nếu hàng được đặt theo yêu cầu kỹ thuật riêng.
              </p>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">5. Gửi trả lại hàng:</h3>
              <p>
                Chúng tôi sẽ không chịu trách nhiệm hoàn tiền cho Quý khách hàng nếu không nhận được hàng trả lại. Chúng tôi chịu mọi chi phí trả hàng, nhưng chỉ áp dụng với sản phẩm không đạt tiêu chuẩn kỹ thuật. Chúng tôi có quyền từ chối mọi trường hợp trả hàng nếu hàng không do chúng tôi cung cấp, bị hư hỏng, đã thay thế hoặc thay đổi.
              </p>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">6. Hoàn lại tiền:</h3>
              <p>
                Chúng tôi sẽ xử lý hoàn tiền nhanh chóng, trong vòng 1-2 ngày làm việc (không bao gồm ngày nghỉ lễ hoặc cuối tuần) sau khi nhận được đơn hủy và hàng trả lại từ Quý khách. Thời gian xử lý hoàn tiền chậm nhất là 7 ngày. Chúng tôi có quyền từ chối hoàn tiền theo điều khoản của công ty.
              </p>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">7. Khiếu nại, tố tụng:</h3>
              <p>
                Nếu Quý khách có khiếu nại về hàng hóa hoặc dịch vụ, vui lòng gọi đường dây nóng quản lý bán hàng: <span className="font-bold text-slate-700">{hotline}</span>.
              </p>
            </div>
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
