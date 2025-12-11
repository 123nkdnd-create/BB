import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const BloodCell = ({ position, scale, rotationSpeed }) => {
  const mesh = useRef();
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * rotationSpeed.x;
      mesh.current.rotation.y += delta * rotationSpeed.y;
      mesh.current.rotation.z += delta * rotationSpeed.z;
    }
  });

  // Create a custom geometry for biconcave shape using a Torus and a Sphere? 
  // Or just a flattened sphere which is a good approximation.
  // Let's use a flattened sphere with a specific material.

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={1}>
      <mesh ref={mesh} position={position} scale={scale}>
        {/* Flattened sphere */}
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial 
          color="#aa0000" 
          roughness={0.2} 
          metalness={0.1} 
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </Float>
  );
};

const BloodCellModel = () => {
  const cells = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 10, 
        (Math.random() - 0.5) * 10, 
        (Math.random() - 0.5) * 5
      ],
      scale: [
        1 + Math.random() * 0.5, 
        1 + Math.random() * 0.5, 
        0.3 + Math.random() * 0.1 // Flattened Z axis
      ],
      rotationSpeed: {
        x: Math.random() * 0.5,
        y: Math.random() * 0.5,
        z: Math.random() * 0.5
      }
    }));
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true} 
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={5} 
          maxDistance={20}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0000" />
        
        <group>
          {/* Main Hero Cell */}
          <BloodCell 
            position={[0, 0, 0]} 
            scale={[1.5, 1.5, 0.4]} 
            rotationSpeed={{ x: 0.2, y: 0.3, z: 0.1 }} 
          />
          
          {/* Background Cells */}
          {cells.map((props, i) => (
            <BloodCell key={i} {...props} />
          ))}
        </group>
        
        <Environment preset="sunset" />
        <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  );
};

export default BloodCellModel;
