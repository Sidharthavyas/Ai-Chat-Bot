import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh, Vector3 } from 'three';
import { motion as m } from 'framer-motion';

function FloatingParticle({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  const speed = useRef({
    rotateX: Math.random() * 0.2 + 0.1,
    rotateY: Math.random() * 0.2 + 0.1,
    moveY: Math.random() * 0.002 + 0.001,
  });
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * speed.current.rotateX;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * speed.current.rotateY;
    
    // Add floating motion
    meshRef.current.position.y = initialY + Math.sin(state.clock.getElapsedTime()) * 0.3;
  });

  return (
    <mesh
      ref={meshRef}
      position={new Vector3(...position)}
    >
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial
        color="#4f46e5"
        emissive="#2f26c5"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function ParticleField() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5,
    ] as [number, number, number],
  }));

  return (
    <>
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} position={particle.position} />
      ))}
    </>
  );
}

export function Background() {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 -z-10"
    >
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParticleField />
        <fog attach="fog" args={['#000', 5, 15]} />
      </Canvas>
    </m.div>
  );
}