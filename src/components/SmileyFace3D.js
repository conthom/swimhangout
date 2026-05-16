'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeAccent } from '../context/AccentColorContext';

const FACE_Z = 0.21;

function DiscOutline({ color }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1, 1, 0.4, 64]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Edges color={color} threshold={12} />
    </mesh>
  );
}

function SmileyFaceSide({ zSign }) {
  const z = FACE_Z * zSign;
  const mouthRotation =
    zSign > 0 ? [0, 0, Math.PI] : [0, Math.PI, Math.PI];

  return (
    <>
      <mesh position={[-0.3, 0.22, z]} renderOrder={1}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshBasicMaterial toneMapped={false} depthTest depthWrite />
      </mesh>
      <mesh position={[0.3, 0.22, z]} renderOrder={1}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshBasicMaterial toneMapped={false} depthTest depthWrite />
      </mesh>
      <mesh position={[0, -0.1, z]} rotation={mouthRotation} renderOrder={1}>
        <torusGeometry args={[0.36, 0.065, 12, 32, Math.PI]} />
        <meshBasicMaterial toneMapped={false} depthTest depthWrite />
      </mesh>
    </>
  );
}

function useSmileyColorSync(groupRef, color, animate = true) {
  const displayColor = useRef(new THREE.Color(color));
  const targetColor = useRef(new THREE.Color(color));
  const frontFaceRef = useRef(null);
  const backFaceRef = useRef(null);
  const worldPos = useRef(new THREE.Vector3());
  const frontNormal = useRef(new THREE.Vector3(0, 0, 1));
  const backNormal = useRef(new THREE.Vector3(0, 0, -1));
  const toCamera = useRef(new THREE.Vector3());

  useEffect(() => {
    targetColor.current.set(color);
  }, [color]);

  useEffect(() => {
    if (frontFaceRef.current) frontFaceRef.current.visible = true;
    if (backFaceRef.current) backFaceRef.current.visible = false;
  }, []);

  const { camera } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const dt = delta > 0 ? delta : state.clock.getDelta() || 1 / 60;

    displayColor.current.lerp(targetColor.current, Math.min(1, dt * 2.5));

    if (animate) {
      groupRef.current.rotation.y += dt * 0.85;
      groupRef.current.rotation.x =
        Math.sin(groupRef.current.rotation.y * 0.5) * 0.12;
    }

    groupRef.current.traverse((child) => {
      if (child.material?.color) {
        child.material.color.copy(displayColor.current);
      }
    });

    groupRef.current.getWorldPosition(worldPos.current);
    toCamera.current.copy(camera.position).sub(worldPos.current).normalize();

    frontNormal.current.set(0, 0, 1);
    frontNormal.current.applyQuaternion(groupRef.current.quaternion);

    backNormal.current.set(0, 0, -1);
    backNormal.current.applyQuaternion(groupRef.current.quaternion);

    let frontFacing = frontNormal.current.dot(toCamera.current) > 0.08;
    let backFacing = backNormal.current.dot(toCamera.current) > 0.08;

    if (!frontFacing && !backFacing) {
      if (
        frontNormal.current.dot(toCamera.current) >=
        backNormal.current.dot(toCamera.current)
      ) {
        frontFacing = true;
      } else {
        backFacing = true;
      }
    }

    if (frontFaceRef.current) {
      frontFaceRef.current.visible = frontFacing;
    }
    if (backFaceRef.current) {
      backFaceRef.current.visible = backFacing;
    }
  });

  return { frontFaceRef, backFaceRef };
}

function SmileyModel({ color, animate = true }) {
  const groupRef = useRef(null);
  const { frontFaceRef, backFaceRef } = useSmileyColorSync(
    groupRef,
    color,
    animate
  );

  return (
    <group ref={groupRef}>
      <DiscOutline color={color} />
      <group ref={frontFaceRef}>
        <SmileyFaceSide zSign={1} />
      </group>
      <group ref={backFaceRef}>
        <SmileyFaceSide zSign={-1} />
      </group>
    </group>
  );
}

function SmileyScene({ color }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <SmileyModel color={color} animate />
    </>
  );
}

function StaticSmiley({ color }) {
  const groupRef = useRef(null);
  const { frontFaceRef, backFaceRef } = useSmileyColorSync(
    groupRef,
    color,
    false
  );

  return (
    <group ref={groupRef} rotation={[0.15, 0.6, 0]}>
      <DiscOutline color={color} />
      <group ref={frontFaceRef}>
        <SmileyFaceSide zSign={1} />
      </group>
      <group ref={backFaceRef}>
        <SmileyFaceSide zSign={-1} />
      </group>
    </group>
  );
}

function subscribeReducedMotion(mq, onChange) {
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }
  mq.addListener(onChange);
  return () => mq.removeListener(onChange);
}

function getMobileGlConfig() {
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  return {
    alpha: true,
    antialias: !coarsePointer,
    powerPreference: 'high-performance',
  };
}

export function SmileyFace3D() {
  const { color } = useThemeAccent();
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [glConfig, setGlConfig] = useState({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });

  useEffect(() => {
    setMounted(true);
    setGlConfig(getMobileGlConfig());

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    return subscribeReducedMotion(mq, update);
  }, []);

  return (
    <div
      className="relative w-full h-[200px] sm:h-[260px] md:h-[280px] pointer-events-none select-none"
      aria-hidden="true"
    >
      {mounted ? (
        <Canvas
          frameloop="always"
          camera={{ position: [0, 0, 3.6], fov: 42 }}
          dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
          gl={glConfig}
          resize={{ scroll: false, debounce: 0 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          {reducedMotion ? (
            <StaticSmiley color={color} />
          ) : (
            <SmileyScene color={color} />
          )}
        </Canvas>
      ) : null}
    </div>
  );
}
