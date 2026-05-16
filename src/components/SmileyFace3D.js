'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeAccent } from '../context/AccentColorContext';

const EYE_RADIUS = 0.09;
const EYE_THICKNESS = 0.001;
const MOUTH_RADIUS = 0.36;
const MOUTH_TUBE = 0.065;

function FeatureMaterial({ color }) {
  return <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />;
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
      <mesh>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial transparent opacity={0} />
        <Edges color={color} threshold={12} />
      </mesh>
      <mesh position={[-0.3, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[EYE_RADIUS, EYE_RADIUS, EYE_THICKNESS, 16]} />
        <FeatureMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[EYE_RADIUS, EYE_RADIUS, EYE_THICKNESS, 16]} />
        <FeatureMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <ringGeometry
          args={[
            MOUTH_RADIUS - MOUTH_TUBE,
            MOUTH_RADIUS + MOUTH_TUBE,
            32,
            1,
            Math.PI,
            Math.PI,
          ]}
        />
        <FeatureMaterial color={color} />
      </mesh>
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
