"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";

function SynapseOrb() {
  const mesh = useRef();
  // Animates the orb's distortion over time
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.position.y = Math.sin(t) * 0.1;
  });

  return (
    <Sphere ref={mesh} args={[1, 64, 64]}>
      <MeshDistortMaterial 
        color="#3b82f6" 
        attach="material" 
        distort={0.4} 
        speed={2} 
        roughness={0.1} 
        metalness={0.5}
      />
    </Sphere>
  );
}

export default function RobotGuide() {
  return (
    <div className="h-[250px] w-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <SynapseOrb />
      </Canvas>
    </div>
  );
}