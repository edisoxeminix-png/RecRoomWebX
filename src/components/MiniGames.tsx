import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Trophy, Play, Gamepad2, ArrowRight, User as UserIcon, Globe } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Sky, ContactShadows, Environment, Sphere, Box, Text } from '@react-three/drei';
import { Avatar } from './Avatar';
import { AvatarConfig } from '../types';
import { GlobalRooms } from './MakerPenMode';

interface MiniGamesModalProps {
  onClose: () => void;
  avatar: AvatarConfig;
}

function DartGame({ avatar }: { avatar: AvatarConfig }) {
  const [score, setScore] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);

  const throwDart = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    
    // Simple dart throw feedback
    setTimeout(() => {
      setScore(s => s + 10);
      setIsLaunching(false);
    }, 400);
  };

  return (
    <div className="w-full h-full relative cursor-crosshair" onClick={throwDart}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Floor */}
        <Box args={[20, 0.1, 20]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#2d3436" />
        </Box>
        
        {/* Target Board */}
        <group position={[0, 2, -6]}>
           <Sphere args={[1.2, 32, 32]} scale={[1, 1, 0.1]}>
              <meshStandardMaterial color="#fdf2e9" />
           </Sphere>
           <Sphere args={[0.9, 32, 32]} scale={[1, 1, 0.11]} position={[0, 0, 0.01]}>
              <meshStandardMaterial color="#ff4444" />
           </Sphere>
           <Sphere args={[0.6, 32, 32]} scale={[1, 1, 0.12]} position={[0, 0, 0.02]}>
              <meshStandardMaterial color="#fdf2e9" />
           </Sphere>
           <Sphere args={[0.3, 32, 32]} scale={[1, 1, 0.13]} position={[0, 0, 0.03]}>
              <meshStandardMaterial color="#ff4444" />
           </Sphere>
           <Text position={[0, 1.8, 0.2]} fontSize={0.3} color="white" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKOBc.woff">
             VR DART RANGE
           </Text>
        </group>

        {/* Player Avatar */}
        <group position={[0, 0, 1.5]} rotation={[0, 0, 0]}>
           <Avatar position={[0, 0, 0]} rotation={[0, 0, 0]} config={avatar} isLocal={true} />
        </group>

        <ContactShadows resolution={1024} scale={15} blur={2.5} opacity={0.6} far={10} color="#000000" />
        <Environment preset="city" />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-10 left-10 bg-black/50 backdrop-blur-xl p-8 rounded-[40px] border-t-2 border-white/20 shadow-2xl">
        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Current Score</p>
        <p className="text-6xl font-black text-white italic tracking-tighter tabular-nums">{score}</p>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="px-10 py-4 bg-rec-orange/90 backdrop-blur-md rounded-full text-white font-black italic uppercase text-2xl tracking-tighter shadow-2xl animate-bounce">
          CLICK TO THROW!
        </div>
      </div>
    </div>
  );
}

function HoopGame({ avatar }: { avatar: AvatarConfig }) {
  const [score, setScore] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);

  const shootBall = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    
    setTimeout(() => {
      setScore(s => s + 2);
      setIsLaunching(false);
    }, 600);
  };

  return (
    <div className="w-full h-full relative cursor-crosshair" onClick={shootBall}>
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Floor */}
        <Box args={[30, 0.1, 30]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#c0392b" />
        </Box>
        
        {/* Hoop Backboard */}
        <group position={[0, 4, -10]}>
           <Box args={[4, 3, 0.2]} position={[0, 0, 0]}>
              <meshStandardMaterial color="white" />
           </Box>
           <Box args={[1.5, 1.2, 0.21]} position={[0, -0.2, 0.01]}>
              <meshStandardMaterial color="white" transparent opacity={0.5} />
           </Box>
           {/* Rim */}
           <group position={[0, -0.8, 0.8]} rotation={[Math.PI/2, 0, 0]}>
             <mesh>
               <torusGeometry args={[0.5, 0.05, 16, 32]} />
               <meshStandardMaterial color="#ff4444" />
             </mesh>
           </group>
        </group>

        {/* Player Avatar */}
        <group position={[0, 0, 4]} rotation={[0, 0, 0]}>
           <Avatar position={[0, 0, 0]} rotation={[0, 0, 0]} config={avatar} isLocal={true} />
        </group>

        <ContactShadows resolution={1024} scale={20} blur={2.5} opacity={0.6} far={15} color="#000000" />
        <Environment preset="city" />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-10 left-10 bg-black/50 backdrop-blur-xl p-8 rounded-[40px] border-t-2 border-white/20 shadow-2xl">
        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] mb-2">POINTS</p>
        <p className="text-6xl font-black text-white italic tracking-tighter tabular-nums">{score}</p>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="px-10 py-4 bg-rec-blue/90 backdrop-blur-md rounded-full text-white font-black italic uppercase text-2xl tracking-tighter shadow-2xl animate-pulse">
          SHOOT FOR 3!
        </div>
      </div>
    </div>
  );
}

export function MiniGamesModal({ onClose, avatar }: MiniGamesModalProps) {
  const [selectedGame, setSelectedGame] = useState<'menu' | 'darts' | 'hoops'>('menu');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" style={{ perspective: '2000px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, rotateY: -30, translateZ: -500 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          rotateY: 0, 
          translateZ: 0,
          rotateZ: [0, 0.5, 0, -0.5, 0],
          y: [0, 15, 0]
        }}
        exit={{ opacity: 0, scale: 0.5, rotateY: 30, translateZ: -500 }}
        transition={{ 
          rotateZ: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          default: { type: 'spring', damping: 20, stiffness: 80 }
        }}
        className="w-full max-w-6xl aspect-video bg-rec-slate-sidebar/95 backdrop-blur-3xl rounded-[80px] border-t-[12px] border-white/20 shadow-[0_80px_160px_rgba(0,0,0,0.8)] relative overflow-hidden pointer-events-auto transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {selectedGame === 'menu' ? (
          <div className="w-full h-full p-20 flex flex-col">
            <div className="flex justify-between items-center mb-16">
              <div>
                <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-lg">Activities</h2>
                <p className="text-rec-blue font-black uppercase tracking-[0.5em] text-sm mt-6 ml-2">LEVEL UP YOUR EXPERIENCE</p>
              </div>
              <button 
                onClick={onClose}
                className="w-24 h-24 bg-white/10 rounded-[40px] text-white flex items-center justify-center hover:bg-rec-orange transition-all rec-card-shadow border-t-2 border-white/10"
              >
                <X size={48} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-10 flex-1 overflow-hidden">
               <div className="flex flex-col gap-6">
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setSelectedGame('darts')}
                  className="group relative bg-rec-orange rounded-[40px] overflow-hidden flex flex-col p-8 text-left border-t-8 border-white/20 rec-card-shadow transition-all"
                >
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-6 transition-transform">
                      <Target size={40} className="text-rec-orange" />
                    </div>
                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">3D DARTS</h3>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="px-6 py-2 bg-white/20 rounded-full text-white font-black uppercase text-[10px] tracking-widest">
                        PLAY NOW
                      </div>
                      <ArrowRight size={24} className="text-white transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setSelectedGame('hoops')}
                  className="group relative bg-rec-blue rounded-[40px] overflow-hidden flex flex-col p-8 text-left border-t-8 border-white/20 rec-card-shadow transition-all"
                >
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:-rotate-6 transition-transform">
                      <Trophy size={40} className="text-rec-blue" />
                    </div>
                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">HOOP SHOOT</h3>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="px-6 py-2 bg-white/20 rounded-full text-white font-black uppercase text-[10px] tracking-widest">
                        NEW GAME
                      </div>
                      <ArrowRight size={24} className="text-white transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="bg-white/5 rounded-[60px] p-10 border-t-4 border-white/10 flex flex-col overflow-hidden">
                 <GlobalRooms />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <button 
              onClick={() => setSelectedGame('menu')}
              className="absolute top-10 right-10 z-50 w-20 h-20 bg-white/20 rounded-[32px] text-white flex items-center justify-center hover:bg-rec-orange transition-all backdrop-blur-xl border-t-2 border-white/20"
            >
              <ArrowRight className="rotate-180" size={32} />
            </button>
            
            {selectedGame === 'darts' && <DartGame avatar={avatar} />}
            {selectedGame === 'hoops' && <HoopGame avatar={avatar} />}
          </div>
        )}
      </motion.div>
    </div>
  );
}
