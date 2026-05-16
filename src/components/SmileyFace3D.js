'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { useThemeAccent } from '../context/AccentColorContext';

const FACE_Z = 0.21;

function SmileyFaceSide({ zSign, color }) {
  const z = FACE_Z * zSign;
  const mouthRotation =
    zSign > 0 ? [0, 0, Math.PI] : [0, Math.PI, Math.PI];

  return (
    <>
      <mesh position={[-0.3, 0.22, z]}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 0.22, z]}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.1, z]} rotation={mouthRotation}>
        <torusGeometry args={[0.36, 0.065, 12, 32, Math.PI]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
}

function SmileyModel({ color }) {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.85;
      groupRef.current.rotation.x =
        Math.sin(groupRef.current.rotation.y * 0.5) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.4, 64]} />
        <meshStandardMaterial transparent opacity={0} />
        <Edges scale={1.001} color={color} threshold={12} />
      </mesh>
      <SmileyFaceSide zSign={1} color={color} />
      <SmileyFaceSide zSign={-1} color={color} />
    </group>
  );
}

export function SmileyFace3D() {
  const { color } = useThemeAccent();

  return (
    <div
      className="relative w-full h-[200px] sm:h-[260px] md:h-[280px] pointer-events-none select-none"
      aria-hidden="true"
    >
      <Canvas camera={{ position: [0, 0, 3.6], fov: 42 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SmileyModel color={color} />
      </Canvas>
    </div>
  );
}
