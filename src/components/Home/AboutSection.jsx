import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { motion } from 'framer-motion'
import { IMAGES } from '../../constants/images'

// 3D Floating Sphere
const FloatingSphere = ({ position, color, size = 1, speed = 1 }) => {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} position={position}>
                <icosahedronGeometry args={[size, 4]} />
                <MeshDistortMaterial
                    color={color}
                    transparent
                    opacity={0.6}
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    )
}

// 3D Truck Icon
const TruckIcon3D = () => {
    const groupRef = useRef()

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
        }
    })

    return (
        <group ref={groupRef} scale={0.8}>
            {/* Cabin */}
            <mesh position={[0, 0.5, 0.8]}>
                <boxGeometry args={[1.2, 1, 1]} />
                <meshStandardMaterial color="#1e9ba8" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Cargo */}
            <mesh position={[0, 0.6, -0.5]}>
                <boxGeometry args={[1.1, 1.2, 2]} />
                <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Wheels */}
            {[[-0.5, 0, 0.8], [0.5, 0, 0.8], [-0.5, 0, -0.8], [0.5, 0, -0.8]].map((pos, i) => (
                <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                    <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
            ))}
        </group>
    )
}

// 3D Scene
const Scene3D = () => {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#1e9ba8" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fff" />

            <TruckIcon3D />

            <FloatingSphere position={[-3, 1, -2]} color="#1e9ba8" size={0.5} speed={0.8} />
            <FloatingSphere position={[3, -1, -2]} color="#1e9ba8" size={0.3} speed={1.2} />
            <FloatingSphere position={[2, 2, -3]} color="#2dbbc9" size={0.4} speed={1} />
        </>
    )
}

const AboutSection = () => {
    const features = [
        { label: 'Chính Hãng 100%', icon: 'verified_user', desc: 'Nhập khẩu trực tiếp từ SINOTRUK' },
        { label: 'Bảo Hành Uy Tín', icon: 'handyman', desc: 'Bảo hành chính hãng toàn quốc' },
        { label: 'Giá Cạnh Tranh', icon: 'savings', desc: 'Cam kết giá tốt nhất thị trường' }
    ]

    return (
        <section className="relative py-32 overflow-hidden bg-background">
            {/* 3D Background - hidden on mobile for performance */}
            <div className="absolute inset-0 z-0 opacity-40 hidden lg:block">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
                    <Suspense fallback={null}>
                        <Scene3D />
                    </Suspense>
                </Canvas>
            </div>

            {/* Background Image Overlay */}
            <div
                className="absolute inset-0 z-[1] opacity-20 bg-cover bg-center"
                style={{ backgroundImage: `url("${IMAGES.about.background}")` }}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-b from-background via-transparent to-background" />
            <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background via-transparent to-background" />

            <div className="relative z-10 container mx-auto px-4 md:px-10 lg:px-20">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div>
                            <span className="text-primary font-bold text-sm tracking-[0.3em] uppercase mb-4 block">
                                Về Chúng Tôi
                            </span>
                            <h2 className="text-slate-800 text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                                Tiên Phong <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">
                                    Công Nghệ
                                </span>
                            </h2>
                        </div>

                        <p className="text-slate-500 text-lg leading-relaxed">
                            Với hơn <span className="text-primary font-bold">15 năm</span> hình thành và phát triển,
                            SINOTRUK HÀ NỘI tự hào là đơn vị cung cấp phụ tùng chính hãng HOWO, SITRAK hàng đầu.
                            Chúng tôi cam kết mang đến sản phẩm chất lượng cao, giá cạnh tranh
                            và dịch vụ hậu mãi chuyên nghiệp nhất.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-3 px-5 py-3 bg-gray-100 border border-gray-300 rounded-xl shadow-sm">
                                <span className="text-primary text-3xl font-bold">500+</span>
                                <span className="text-slate-500 text-sm">Khách hàng<br />tin tưởng</span>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3 bg-gray-100 border border-gray-300 rounded-xl shadow-sm">
                                <span className="text-primary text-3xl font-bold">50K+</span>
                                <span className="text-slate-500 text-sm">Phụ tùng<br />đã bán</span>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-3 bg-gray-100 border border-gray-300 rounded-xl shadow-sm">
                                <span className="text-primary text-3xl font-bold">63</span>
                                <span className="text-slate-500 text-sm">Tỉnh thành<br />phủ sóng</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Feature Cards */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {features.map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ x: 10, scale: 1.02 }}
                                className="group flex items-center gap-6 p-6 bg-gray-100 border border-gray-300 rounded-2xl hover:border-primary/30 transition-all cursor-pointer shadow-sm"
                            >
                                <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-800 font-bold text-lg group-hover:text-primary transition-colors">{item.label}</h4>
                                    <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary ml-auto transition-colors">
                                    arrow_forward
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        </section>
    )
}

export default AboutSection
