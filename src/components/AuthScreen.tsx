import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, User as UserIcon } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';

interface AuthScreenProps {
  onSuccess: (user: any) => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rec-slate-dark p-6" style={{ perspective: '2000px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, rotateY: 30, z: -500 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          rotateY: 0, 
          z: 0,
          y: [0, -15, 0]
        }}
        transition={{ 
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          default: { type: 'spring', damping: 20, stiffness: 80 }
        }}
        className="max-w-xl w-full bg-rec-slate-sidebar/95 backdrop-blur-2xl p-16 rounded-[60px] border-t-[12px] border-white rec-card-shadow text-center shadow-[0_80px_160px_rgba(0,0,0,0.8)] transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="w-32 h-32 bg-rec-orange rounded-[40px] mx-auto mb-10 flex items-center justify-center shadow-2xl border-t-4 border-white/20 transform rotate-6">
          <UserIcon className="w-16 h-16 text-white drop-shadow-lg" />
        </div>
        
        <h1 className="text-7xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none drop-shadow-2xl">
          Rec Room <span className="text-rec-blue font-mono not-italic block mt-2 text-3xl tracking-widest opacity-80">WEB EDITION</span>
        </h1>
        <p className="text-white/40 mb-12 font-black uppercase tracking-[0.4em] text-xs">
          Comunidad Social & Juegos VR
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-24 flex items-center justify-center gap-6 bg-rec-orange text-white font-black rounded-[32px] rec-card-shadow rec-btn-hover transition-all duration-300 disabled:opacity-50 uppercase italic text-3xl border-t-4 border-white/30"
        >
          {loading ? (
            <div className="w-10 h-10 border-8 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-10 h-10" />
              JOIN THE FUN
            </>
          )}
        </button>

        <div className="mt-16 flex justify-center gap-6 opacity-20">
          <div className="w-3 h-3 rounded-full bg-rec-blue animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 rounded-full bg-rec-orange animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 rounded-full bg-rec-purple animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </motion.div>
    </div>
  );
}
