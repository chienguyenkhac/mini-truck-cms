
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, PerspectiveCamera, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

export const StylizedTruck = ({ color = "#ea2a33", ...props }) => {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.position.y = Math.sin(t * 0.5) * 0.1;
    group.current.rotation.y = Math.sin(t * 0.2) * 0.1;
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Cabin */}
      <mesh position={[0, 1.2, 0.5]}>
        <boxGeometry args={[1.8, 1.5, 1.4]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 1.5, 1.21]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[1.6, 0.8]} />
        <meshPhysicalMaterial 
          color="#88ccff" 
          transmission={0.8} 
          thickness={0.5} 
          roughness={0} 
          envMapIntensity={2} 
        />
      </mesh>

      {/* Chassis */}
      <mesh position={[0, 0.4, -0.5]}>
        <boxGeometry args={[1.7, 0.4, 4]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Wheels */}
      {[
        [-0.9, 0.4, 1.2], [0.9, 0.4, 1.2], 
        [-0.9, 0.4, -1.2], [0.9, 0.4, -1.2],
        [-0.9, 0.4, -2.2], [0.9, 0.4, -2.2]
      ].map((pos, i) => (
        <mesh key={i} position={pos as any} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.4, 32]} />
          <meshStandardMaterial color="#050505" roughness={0.8} />
          {/* Rim */}
          <mesh position={[0, 0.21, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
            <meshStandardMaterial color="#666" metalness={1} />
          </mesh>
        </mesh>
      ))}

      {/* Cargo Bed / Mixer / Box (Contextual) */}
      <mesh position={[0, 1.4, -1.5]}>
        <boxGeometry args={[1.75, 1.6, 3]} />
        <meshStandardMaterial color="#ddd" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
};

export const AbstractTruckScene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ea2a33" />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      
      <PresentationControls
        global
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
      >
        <StylizedTruck scale={1.2} />
      </PresentationControls>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <MeshDistortMaterial
          color="#1a0d0d"
          speed={2}
          distort={0.1}
          radius={1}
        />
      </mesh>
    </>
  );
};
