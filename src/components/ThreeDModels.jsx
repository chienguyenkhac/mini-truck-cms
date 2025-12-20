import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'

// Memoized geometry for performance
const TruckGeometry = () => {
    const wheelPositions = useMemo(() => [
        [-0.9, 0.4, 1.2], [0.9, 0.4, 1.2],
        [-0.9, 0.4, -1.2], [0.9, 0.4, -1.2],
        [-0.9, 0.4, -2.2], [0.9, 0.4, -2.2]
    ], [])

    return { wheelPositions }
}

export const StylizedTruck = ({ color = "#ea2a33", ...props }) => {
    const group = useRef(null)
    const { wheelPositions } = TruckGeometry()

    // Optimized animation - reduced frequency
    useFrame((state) => {
        if (!group.current) return
        const t = state.clock.getElapsedTime()
        // Slower, smoother animation
        group.current.position.y = Math.sin(t * 0.3) * 0.08
        group.current.rotation.y = Math.sin(t * 0.15) * 0.08
    })

    // Shared materials for performance
    const redMaterial = useMemo(() => (
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
    ), [color])

    const darkMaterial = useMemo(() => (
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
    ), [])

    const wheelMaterial = useMemo(() => (
        <meshStandardMaterial color="#050505" roughness={0.9} />
    ), [])

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Cabin - simplified geometry */}
            <mesh position={[0, 1.2, 0.5]}>
                <boxGeometry args={[1.8, 1.5, 1.4]} />
                {redMaterial}
            </mesh>

            {/* Windshield - simpler material */}
            <mesh position={[0, 1.5, 1.21]} rotation={[0.2, 0, 0]}>
                <planeGeometry args={[1.6, 0.8]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
            </mesh>

            {/* Chassis */}
            <mesh position={[0, 0.4, -0.5]}>
                <boxGeometry args={[1.7, 0.4, 4]} />
                {darkMaterial}
            </mesh>

            {/* Wheels - simplified, no nested mesh */}
            {wheelPositions.map((pos, i) => (
                <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.35, 16]} />
                    {wheelMaterial}
                </mesh>
            ))}

            {/* Cargo Bed - simplified */}
            <mesh position={[0, 1.4, -1.5]}>
                <boxGeometry args={[1.75, 1.6, 3]} />
                <meshStandardMaterial color="#ccc" metalness={0.4} roughness={0.6} />
            </mesh>
        </group>
    )
}

export const AbstractTruckScene = () => {
    return (
        <>
            {/* Simplified lighting */}
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ea2a33" />
            <directionalLight position={[-5, 5, 5]} intensity={0.8} />

            <PresentationControls
                global
                config={{ mass: 1, tension: 400 }}
                snap={{ mass: 2, tension: 800 }}
                rotation={[0, 0.3, 0]}
                polar={[-Math.PI / 4, Math.PI / 4]}
                azimuth={[-Math.PI / 2, Math.PI / 2]}
            >
                <StylizedTruck scale={1.1} />
            </PresentationControls>

            {/* Simplified ground - no distortion for performance */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#1a0d0d" />
            </mesh>
        </>
    )
}
