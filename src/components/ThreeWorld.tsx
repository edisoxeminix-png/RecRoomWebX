import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, ContactShadows, Environment, Stars, Box, Sphere, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Physics, useBox, useSphere, usePlane } from '@react-three/cannon';
import { Avatar } from './Avatar';
import { PlayerState, AvatarConfig } from '../types';

interface MakerObject {
  id: string;
  type: 'box' | 'sphere' | 'cone';
  position: [number, number, number];
  color: string;
}

interface ThreeWorldProps {
  localPlayer: {
    position: [number, number, number];
    rotation: [number, number, number];
    avatar: AvatarConfig;
    handLOffset?: [number, number, number];
    handROffset?: [number, number, number];
    gripL?: number;
    gripR?: number;
    isLHandActive?: boolean;
    isRHandActive?: boolean;
  };
  otherPlayers: PlayerState[];
  makerObjects?: MakerObject[];
}

function PhysicalBox({ position, color }: { position: [number, number, number], color: string }) {
  const [ref] = useBox(() => ({ mass: 1, position, args: [1, 1, 1] }));
  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function PhysicalSphere({ position, color }: { position: [number, number, number], color: string }) {
  const [ref] = useSphere(() => ({ mass: 1, position, args: [0.5] }));
  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function PhysicalFloor() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#2c3e50" />
    </mesh>
  );
}

function OtherPlayer({ player }: { player: PlayerState }) {
  // Extract values carefully from PlayerState
  const pos: [number, number, number] = player.position ? [player.position.x, player.position.y, player.position.z] : [0, 0, 0];
  const rot: [number, number, number] = player.rotation ? [player.rotation.x, player.rotation.y, player.rotation.z] : [0, 0, 0];

  return (
    <group>
      <Avatar 
        position={pos} 
        rotation={rot} 
        config={player.avatar} 
        isLocal={false} 
      />
      {/* Visual hands for other players if they have offsets/grips */}
      <group position={pos} rotation={[0, rot[1], 0]}>
        {player.handLOffset && (
          <Hand 
            position={[-0.4 + player.handLOffset[0], 1.25 + player.handLOffset[1], -0.6 + player.handLOffset[2]]}
            rotation={[0.2, 0.4, 0]}
            color={player.avatar.color}
            grip={player.gripL || 0}
          />
        )}
        {player.handROffset && (
          <Hand 
            position={[0.4 + player.handROffset[0], 1.25 + player.handROffset[1], -0.6 + player.handROffset[2]]}
            rotation={[0.2, -0.4, 0]}
            color={player.avatar.color}
            isRight
            grip={player.gripR || 0}
          />
        )}
      </group>
      <Text
        position={[pos[0], pos[1] + 2.1, pos[2]]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {player.username}
        <meshBasicMaterial attach="material" color="white" />
      </Text>
    </group>
  );
}

function Hand({ 
  position, 
  rotation, 
  color, 
  hasWatch, 
  isRight, 
  fingerStrength = 0, 
  gyroOffset = 0,
  grip = 0
}: { 
  position: [number, number, number], 
  rotation: [number, number, number], 
  color: string, 
  hasWatch?: boolean, 
  isRight?: boolean, 
  fingerStrength?: number,
  gyroOffset?: number,
  grip?: number
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Combine breathing movement with grip for fingers
  const combinedFingers = Math.max(grip * 1.5, fingerStrength);

  return (
    <group position={[position[0], position[1] + gyroOffset, position[2]]} rotation={rotation}>
      {/* Upper Arm & Forearm segments */}
      <group>
        <mesh position={[isRight ? -0.32 : 0.32, 0.42, 0.82]} rotation={[1.1, 0, isRight ? -0.35 : 0.35]}>
          <capsuleGeometry args={[0.07, 0.65, 4, 12]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[isRight ? -0.16 : 0.16, 0.18, 0.32]} rotation={[0.4, 0, isRight ? -0.2 : 0.2]}>
          <capsuleGeometry args={[0.065, 0.55, 4, 12]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      </group>
      
      {/* Hand Body / Palm */}
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.05, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      
      {/* Thumb */}
      <group 
        position={[isRight ? -0.075 : 0.075, -0.01, 0.05]} 
        rotation={[0.2, isRight ? -0.7 : 0.7, 0]}
      >
        <group rotation={[0, 0, combinedFingers * 0.5]}>
          <mesh position={[0, 0, -0.04]} castShadow>
            <capsuleGeometry args={[0.02, 0.06, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      </group>

      {/* Fingers */}
      <group position={[0, 0, -0.09]}>
        {[...Array(4)].map((_, i) => (
          <group key={i} position={[isRight ? -0.057 + (i * 0.038) : 0.057 - (i * 0.038), 0, 0]}>
            <group rotation={[-combinedFingers * 0.8, 0, 0]}>
              <mesh position={[0, 0, -0.04]} castShadow>
                <capsuleGeometry args={[0.018, 0.07, 4, 8]} />
                <meshStandardMaterial color={color} />
              </mesh>
              <group position={[0, 0, -0.07]} rotation={[-combinedFingers * 0.8, 0, 0]}>
                <mesh position={[0, 0, -0.03]} castShadow>
                  <capsuleGeometry args={[0.018, 0.05, 4, 8]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              </group>
            </group>
          </group>
        ))}
      </group>

      {/* Wrist / Clock */}
      <group position={[0, 0, 0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.07, 0.08]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {hasWatch && (
          <group position={[0, 0.04, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 0.02, 0.09]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <Text
              position={[0, 0.012, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.03}
              color="#38bdf8"
              anchorX="center"
              anchorY="middle"
            >
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </group>
        )}
      </group>
    </group>
  );
}


function SceneContent({ localPlayer, otherPlayers, makerObjects = [] }: ThreeWorldProps) {
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const [breathing, setBreathing] = useState(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const breathe = Math.abs(Math.sin(time * 2)) * 0.1;
    setBreathing(breathe);

    // Camera sync
    const pos = localPlayer.position;
    const rot = localPlayer.rotation;
    
    if (!isNaN(pos[0]) && !isNaN(pos[1]) && !isNaN(pos[2])) {
      const targetPos = new THREE.Vector3(pos[0], pos[1] + 1.6, pos[2]);
      state.camera.position.lerp(targetPos, 0.15); // Slower lerp for smoothness
    }
    if (!isNaN(rot[1])) {
      state.camera.rotation.set(0, rot[1], 0, 'YXZ');
    }

    // Hands sync
    if (leftHandRef.current && rightHandRef.current) {
      leftHandRef.current.position.set(pos[0], pos[1], pos[2]);
      leftHandRef.current.rotation.set(0, rot[1], 0);
      
      rightHandRef.current.position.set(pos[0], pos[1], pos[2]);
      rightHandRef.current.rotation.set(0, rot[1], 0);
    }
  });

  return (
    <>
      <color attach="background" args={['#0f172a']} />
      
      <Sky sunPosition={[100, 100, 20]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={1.5} />
      <pointLight position={[0, 8, 0]} intensity={2} decay={1} castShadow />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      
      <Physics gravity={[0, -9.81, 0]}>
        <PhysicalFloor />
        
        {makerObjects.map((obj) => {
          if (obj.type === 'box') return <PhysicalBox key={obj.id} position={obj.position} color={obj.color} />;
          if (obj.type === 'sphere') return <PhysicalSphere key={obj.id} position={obj.position} color={obj.color} />;
          return <PhysicalBox key={obj.id} position={obj.position} color={obj.color} />;
        })}

        {/* Dynamic Markers */}
        <PhysicalBox position={[0, 5, -5]} color="orange" />
        <PhysicalBox position={[5, 2, 0]} color="green" />
        <PhysicalBox position={[-5, 2, 0]} color="red" />
      </Physics>

      {/* Local Player Hands */}
      <group ref={leftHandRef}>
        <group position={[0, 1.25, -0.6]}>
          <Hand 
            position={[-0.4 + (localPlayer.handLOffset?.[0] || 0), (localPlayer.handLOffset?.[1] || 0) + (localPlayer.isLHandActive ? 0.4 : 0), (localPlayer.handLOffset?.[2] || 0)]} 
            rotation={[localPlayer.isLHandActive ? 0.4 : 0.2, 0.4, 0]} 
            color={localPlayer.avatar.color} 
            hasWatch={true} 
            grip={localPlayer.gripL}
            fingerStrength={breathing}
          />
        </group>
      </group>

      <group ref={rightHandRef}>
        <group position={[0, 1.25, -0.6]}>
          <Hand 
            position={[0.4 + (localPlayer.handROffset?.[0] || 0), (localPlayer.handROffset?.[1] || 0) + (localPlayer.isRHandActive ? 0.4 : 0), (localPlayer.handROffset?.[2] || 0)]} 
            rotation={[localPlayer.isRHandActive ? 0.4 : 0.2, -0.4, 0]} 
            color={localPlayer.avatar.color} 
            isRight={true}
            grip={localPlayer.gripR}
            fingerStrength={breathing}
          />
        </group>
      </group>

      {/* Walls (Static) */}
      <Box args={[22, 10, 1]} position={[0, 5, -11]} receiveShadow>
        <meshStandardMaterial color="#cbd5e1" />
      </Box>
      <Box args={[22, 10, 1]} position={[0, 5, 11]} receiveShadow>
        <meshStandardMaterial color="#cbd5e1" />
      </Box>
      <Box args={[1, 10, 22]} position={[-11, 5, 0]} receiveShadow>
        <meshStandardMaterial color="#cbd5e1" />
      </Box>
      <Box args={[1, 10, 22]} position={[11, 5, 0]} receiveShadow>
        <meshStandardMaterial color="#cbd5e1" />
      </Box>

      <gridHelper args={[20, 20]} position={[0, 0.05, 0]} />

      {otherPlayers.map((p) => (
        <OtherPlayer key={p.userId} player={p} />
      ))}
      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.4} far={10} color="#000000" />
    </>
  );
}

export function ThreeWorld({ localPlayer, otherPlayers, makerObjects }: ThreeWorldProps) {
  return (
    <div className="w-full h-full bg-slate-900 relative">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 1.6, 0] }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <SceneContent localPlayer={localPlayer} otherPlayers={otherPlayers} makerObjects={makerObjects} />
        </Suspense>
      </Canvas>
    </div>
  );
}
