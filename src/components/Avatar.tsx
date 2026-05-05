import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarConfig } from '../types';

interface AvatarProps {
  position: [number, number, number];
  rotation: [number, number, number];
  config: AvatarConfig;
  isLocal?: boolean;
}

export function Avatar({ position, rotation, config, isLocal }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Mesh>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (!isLocal) {
      groupRef.current.position.lerp(new THREE.Vector3(...position), 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation[1], 0.1);
    } else {
      groupRef.current.position.set(...position);
      groupRef.current.rotation.set(...rotation);
    }

    const time = state.clock.elapsedTime;
    
    // Floating Head Bob
    if (headRef.current) {
      headRef.current.position.y = 1.7 + Math.sin(time * 2) * 0.03;
    }

    // Floating Hands Animation
    if (leftHandRef.current && rightHandRef.current) {
      leftHandRef.current.position.y = 0.9 + Math.sin(time * 3) * 0.05;
      leftHandRef.current.position.x = -0.5 + Math.cos(time * 1.5) * 0.02;
      
      rightHandRef.current.position.y = 0.9 + Math.cos(time * 3) * 0.05;
      rightHandRef.current.position.x = 0.5 + Math.sin(time * 1.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Torso (The floating egg-like body) */}
      <Sphere args={[0.35, 32, 16]} position={[0, 0.9, 0]} scale={[1, 1.3, 0.7]}>
        <meshStandardMaterial color={config.color} roughness={0.1} metalness={0.1} />
      </Sphere>

      {/* Head */}
      <mesh ref={headRef}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#ffe0bd" />
        
        {/* Face Details */}
        <Box args={[0.04, 0.04, 0.04]} position={[0.08, 0.05, 0.18]}>
          <meshBasicMaterial color="black" />
        </Box>
        <Box args={[0.04, 0.04, 0.04]} position={[-0.08, 0.05, 0.18]}>
          <meshBasicMaterial color="black" />
        </Box>

        {/* Hair/Hat Area */}
        {config.hat === 'cap' && (
          <group position={[0, 0.15, 0]}>
            <Sphere args={[0.23, 32, 16]} scale={[1, 0.4, 1]}>
              <meshStandardMaterial color={config.color} />
            </Sphere>
            <Box args={[0.35, 0.01, 0.25]} position={[0, -0.05, 0.12]}>
              <meshStandardMaterial color={config.color} />
            </Box>
          </group>
        )}
      </mesh>

      {/* Floating Hands */}
      <mesh ref={leftHandRef} position={[-0.5, 0.9, 0.2]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffe0bd" />
      </mesh>
      
      <mesh ref={rightHandRef} position={[0.5, 0.9, 0.2]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffe0bd" />
      </mesh>
    </group>
  );
}
