import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import * as THREE from 'three';
import { AuthScreen } from './components/AuthScreen';
import { ThreeWorld } from './components/ThreeWorld';
import { MiniGamesModal } from './components/MiniGames';
import { MakerPenMode } from './components/MakerPenMode';
import { WatchMenu } from './components/WatchMenu';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { UserProfile, PlayerState, AvatarConfig } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Settings, Users, Send, User as UserIcon, Gamepad2 } from 'lucide-react';

const COLORS = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8800'];
const DEFAULT_ROOM = 'the-rec-center';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<PlayerState[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showGames, setShowGames] = useState(false);
  const [showWatch, setShowWatch] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [showMakerPen, setShowMakerPen] = useState(false);
  const [showSwitchNotify, setShowSwitchNotify] = useState(false);
  const [makerObjects, setMakerObjects] = useState<any[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [hasEntered, setHasEntered] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const { 
    position, teleport, rotation, setRotation, update, isSwitchMode, plusButtonPressed, gamepadAxes,
    handLOffset, handROffset, gripL, gripR, isLHandActive, isRHandActive
  } = usePlayerMovement();

  const spawnMakerObject = (type: string, color: string) => {
    const forward = new THREE.Vector3(0, 0, -2).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation[1]);
    const spawnPos: [number, number, number] = [
      position[0] + forward.x,
      position[1] + 1.5,
      position[2] + forward.z
    ];
    setMakerObjects(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      color,
      position: spawnPos
    }]);
  };

  // Switch Mode Notification Timeout
  useEffect(() => {
    if (isSwitchMode) {
      setShowSwitchNotify(true);
      const timer = setTimeout(() => setShowSwitchNotify(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isSwitchMode]);

  // Watch for controller Menu (+) button
  useEffect(() => {
    if (plusButtonPressed) {
      if (!showWatch && !showGames && !showAvatarCustomizer && !showMakerPen) {
        setShowWatch(true);
      }
    }
  }, [plusButtonPressed, showWatch, showGames, showAvatarCustomizer, showMakerPen]);

  // Virtual Cursor for Gamepad
  useEffect(() => {
    if (isSwitchMode && (showWatch || showGames || showAvatarCustomizer || showMakerPen)) {
      setCursorPos(prev => ({
        x: Math.max(0, Math.min(100, prev.x + gamepadAxes[0] * 2)),
        y: Math.max(0, Math.min(100, prev.y + gamepadAxes[1] * 2))
      }));
    }
  }, [gamepadAxes, isSwitchMode, showWatch, showGames, showAvatarCustomizer, showMakerPen]);

  // Click simulation for virtual cursor
  useEffect(() => {
    if (isSwitchMode && (showWatch || showGames || showAvatarCustomizer || showMakerPen)) {
      let isPressed = false;
      const checkClick = () => {
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp) {
            const currentlyPressed = gp.buttons[0].pressed || gp.buttons[1].pressed; // A or B
            if (currentlyPressed && !isPressed) {
              const el = document.elementFromPoint(
                (cursorPos.x / 100) * window.innerWidth,
                (cursorPos.y / 100) * window.innerHeight
              ) as HTMLElement;
              if (el) {
                el.click();
                // Add a small scale effect to show interaction
                el.style.transform = 'scale(0.95)';
                setTimeout(() => el.style.transform = '', 100);
              }
            }
            isPressed = currentlyPressed;
          }
        }
      };
      const interval = setInterval(checkClick, 50);
      return () => clearInterval(interval);
    }
  }, [isSwitchMode, showWatch, showGames, cursorPos]);

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setLoadingProfile(true);
        // Artificial delay for stability and "feel"
        await new Promise(r => setTimeout(r, 1500));
        
        try {
          const profileDoc = await getDoc(doc(db, 'users', u.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `users/${u.uid}`);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
      }
    });
  }, []);

  // Update loop for movement
  useEffect(() => {
    if (!profile) return;
    
    let frameId: number;
    const loop = () => {
      if (!showWatch && !showGames && !showAvatarCustomizer && !showMakerPen) {
        update();
      }
      frameId = requestAnimationFrame(loop);
    };
    
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [profile, update]);

  // Sync state to Firebase
  useEffect(() => {
    if (!user || !profile) return;
    
    const sync = async () => {
      try {
        await setDoc(doc(db, `rooms/${DEFAULT_ROOM}/players`, user.uid), {
          userId: user.uid,
          username: profile.username,
          position: { x: position[0], y: position[1], z: position[2] },
          rotation: { x: rotation[0], y: rotation[1], z: rotation[2] },
          avatar: profile.avatar,
          handLOffset,
          handROffset,
          gripL,
          gripR,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        // Throttled sync error typically ignored in real-time
      }
    };

    const interval = setInterval(sync, 200); // 5Hz sync
    return () => clearInterval(interval);
  }, [user, profile, position, rotation]);

  // Listen for players and messages
  useEffect(() => {
    if (!user || !profile) return;

    const playersUnsub = onSnapshot(collection(db, `rooms/${DEFAULT_ROOM}/players`), (snap) => {
      const players: PlayerState[] = [];
      snap.forEach((doc) => {
        if (doc.id !== user.uid) {
          players.push(doc.data() as PlayerState);
        }
      });
      setOtherPlayers(players);
    });

    const messagesUnsub = onSnapshot(collection(db, `rooms/${DEFAULT_ROOM}/messages`), (snap) => {
      const msgs: any[] = [];
      snap.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
    });

    return () => {
      playersUnsub();
      messagesUnsub();
    };
  }, [user, profile]);

  const handleCreateProfile = async (username: string, color: string) => {
    if (!user) return;
    const newProfile: UserProfile = {
      uid: user.uid,
      username,
      email: user.email || undefined,
      avatar: { color, hat: 'cap' }
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    setProfile(newProfile);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user || !profile) return;
    try {
      await setDoc(doc(collection(db, `rooms/${DEFAULT_ROOM}/messages`)), {
        senderId: user.uid,
        senderName: profile.username,
        text: chatInput,
        timestamp: serverTimestamp(),
      });
      setChatInput('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `rooms/${DEFAULT_ROOM}/messages`);
    }
  };

  if (!user) return <AuthScreen onSuccess={setUser} />;

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-rec-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-black italic tracking-tighter uppercase opacity-50">Sincronizando con RecRoomWeb...</p>
        </div>
      </div>
    );
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-rec-slate-dark p-6" style={{ perspective: '1200px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotateY: -15, translateZ: -200 }} 
        animate={{ opacity: 1, scale: 1, rotateY: 0, translateZ: 0 }} 
        className="bg-rec-slate-sidebar p-12 rounded-[60px] max-w-md w-full rec-card-shadow border-t-8 border-white transform-gpu shadow-[0_60px_120px_rgba(0,0,0,0.8)]"
      >
        <h2 className="text-5xl font-black text-white mb-8 uppercase tracking-tighter italic text-center drop-shadow-lg">Tu Perfil VR</h2>
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-3 ml-2">Display Name</label>
            <input 
              id="username-input"
              type="text" 
              placeholder="REC_PLAYER" 
              className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-6 font-black italic text-2xl text-white placeholder:text-white/10 uppercase tracking-tighter focus:bg-white/10 transition-all outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                   const input = e.currentTarget as HTMLInputElement;
                   const color = (document.querySelector('.selected-color') as HTMLElement)?.dataset.color || COLORS[0];
                   handleCreateProfile(input.value || 'Novato', color);
                }
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4 ml-2">Identity Color</label>
            <div className="grid grid-cols-4 gap-4">
              {COLORS.map((c) => (
                <button
                  key={c}
                  data-color={c}
                  onClick={(e) => {
                    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected-color', 'ring-8', 'ring-rec-blue'));
                    e.currentTarget.classList.add('selected-color', 'ring-8', 'ring-rec-blue');
                  }}
                  className="color-btn aspect-square rounded-2xl shadow-inner transition-transform hover:scale-110 border-b-8 border-black/30"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button 
            onClick={() => {
              const input = document.getElementById('username-input') as HTMLInputElement;
              const color = (document.querySelector('.selected-color') as HTMLElement)?.dataset.color || COLORS[0];
              handleCreateProfile(input.value || 'Novato', color);
            }}
            className="w-full bg-rec-orange text-white font-black py-6 rounded-[32px] rec-card-shadow rec-btn-hover transition-all uppercase italic tracking-tighter text-3xl border-t-4 border-white/20"
          >
            ENTER REC ROOM
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (!hasEntered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 relative overflow-hidden" style={{ perspective: '1200px' }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-rec-blue rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -45, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-rec-orange rounded-full blur-[120px]"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative z-10 bg-[#1e293b]/80 backdrop-blur-3xl p-16 rounded-[60px] max-w-lg w-full rec-card-shadow border-t-8 border-white text-center"
        >
          <div className="mb-12">
            <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase mb-2 drop-shadow-2xl">
              RECROOMWEB
            </h1>
            <p className="text-rec-blue font-black tracking-[0.5em] uppercase text-sm italic">EDITION</p>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div 
                className="w-32 h-32 rounded-full border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: profile.avatar.color }}
              >
                <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse blur-xl" />
                <UserIcon className="w-16 h-16 text-white opacity-80 absolute" />
              </div>
              <p className="text-3xl font-black text-white italic tracking-tighter uppercase">
                Bienvenido, {profile.username}
              </p>
            </div>
            
            <button 
              onClick={() => setHasEntered(true)}
              className="w-full bg-rec-orange text-white font-black py-8 rounded-[40px] rec-card-shadow hover:scale-105 active:scale-95 transition-all uppercase italic tracking-tighter text-4xl border-t-4 border-white/30"
            >
              ENTRAR AL MUNDO
            </button>

            <button 
              onClick={() => { auth.signOut(); window.location.reload(); }}
              className="text-white/40 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
            >
              CERRAR SESIÓN
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-rec-slate-dark">
      {/* 3D Scene */}
      <div className={`fixed inset-0 transition-all duration-700 ${(showWatch || showGames) ? 'blur-md brightness-50 scale-105 rotate-1' : ''}`}>
        <ThreeWorld 
          localPlayer={{ 
            position, 
            rotation, 
            avatar: profile.avatar,
            handLOffset,
            handROffset,
            gripL,
            gripR
          }} 
          otherPlayers={otherPlayers} 
          makerObjects={makerObjects}
        />
      </div>

      {/* Virtual Cursor for Controller */}
      {isSwitchMode && (showWatch || showGames || showAvatarCustomizer || showMakerPen) && (
        <motion.div 
          animate={{ x: `${cursorPos.x}vw`, y: `${cursorPos.y}vh` }}
          transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.5 }}
          className="fixed z-[100] w-12 h-12 bg-white rounded-full border-4 border-rec-blue shadow-2xl pointer-events-none flex items-center justify-center overflow-hidden"
          style={{ transform: 'translate(-50%, -50%)', left: 0, top: 0 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-white to-rec-blue opacity-50 absolute inset-0" />
          <div className="w-2 h-2 bg-rec-blue rounded-full relative z-10 animate-pulse" />
          <div className="absolute inset-0 border-white/50 border-4 rounded-full scale-75" />
        </motion.div>
      )}

      {/* VR Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] z-10" />

      {/* Floating Notifications */}
      <div className="absolute top-8 left-8 right-8 pointer-events-none flex flex-col items-center gap-4 z-[60]">
        <AnimatePresence>
          {showSwitchNotify && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-rec-blue/90 backdrop-blur-xl px-8 py-3 rounded-full border-t-2 border-white/30 shadow-2xl flex items-center gap-4 border-b-4 border-black/20"
            >
              <Gamepad2 className="text-white w-6 h-6 animate-pulse" />
              <span className="text-white font-black italic uppercase tracking-tighter text-xl">CONTROLES SWITCH DETECTADOS</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Diegetic HUD (Floating UI) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-12" style={{ perspective: '1000px' }}>
        <div className="flex justify-between items-end">
          
          <div className="flex flex-col gap-4 pointer-events-auto transform-gpu" style={{ transform: 'rotateY(15deg) rotateX(5deg)', transformStyle: 'preserve-3d' }}>
            {/* Quick Watch Access */}
            <motion.button 
              whileHover={{ scale: 1.1, translateZ: 20 }}
              onClick={() => setShowWatch(true)}
              className="w-24 h-24 bg-rec-orange rounded-[40px] flex items-center justify-center border-t-4 border-white/40 rec-card-shadow shadow-[0_20px_50px_rgba(255,100,0,0.4)] relative"
            >
              <UserIcon className="text-white w-12 h-12 drop-shadow-lg" />
              <div className="absolute -bottom-2 w-16 h-2 bg-black/20 rounded-full blur-md" />
            </motion.button>
            <div className="bg-rec-slate-sidebar/90 backdrop-blur-md px-4 py-2 rounded-2xl border-t border-white/10 rec-card-shadow text-center">
               <p className="text-white font-black italic uppercase text-sm tracking-tighter">{profile.username}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 transform-gpu" style={{ transform: 'rotateY(-15deg) rotateX(5deg)', transformStyle: 'preserve-3d' }}>
            {/* Chat Floating Bubble */}
            <AnimatePresence>
              {showChat && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, translateZ: -100 }}
                  animate={{ opacity: 1, scale: 1, translateZ: 0 }}
                  exit={{ opacity: 0, scale: 0.8, translateZ: -100 }}
                  className="w-80 h-96 bg-rec-slate-sidebar/90 backdrop-blur-2xl rounded-[40px] border-t-4 border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.5)] mb-4 pointer-events-auto flex flex-col overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <p className="text-white font-black italic uppercase text-[10px] tracking-widest opacity-50">Local Chat</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
                    {messages.map((m) => (
                      <div key={m.id} className="bg-white/5 p-3 rounded-2xl border-t border-white/5">
                        <p className="font-black text-rec-orange uppercase text-[10px] italic mb-1">{m.senderName}</p>
                        <p className="text-white font-bold leading-tight text-sm">{m.text}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendMessage} className="p-4 bg-black/20 flex gap-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border-none rounded-xl px-4 py-3 text-white text-sm font-black italic uppercase tracking-tighter focus:ring-0"
                    />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pointer-events-auto">
              <button 
                onClick={() => setShowChat(!showChat)}
                className={`w-20 h-20 rounded-[32px] transition-all border-b-4 border-black/20 flex items-center justify-center ${showChat ? 'bg-rec-purple' : 'bg-white/10'} text-white shadow-2xl overflow-hidden relative group`}
              >
                <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Online Badge Overlay */}
      <div className="absolute top-8 left-8 pointer-events-none opacity-50">
        <p className="text-rec-blue font-black italic uppercase tracking-widest text-xs">^DormRoom • {otherPlayers.length + 1} ONLINE</p>
      </div>

      <AnimatePresence>
        {showMakerPen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xl pointer-events-auto" onClick={() => setShowMakerPen(false)} />
            <MakerPenMode 
              onClose={() => setShowMakerPen(false)} 
              userEmail={profile?.email} 
              onSpawn={spawnMakerObject}
              onClear={() => setMakerObjects([])}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md pointer-events-auto" onClick={() => setShowWatch(false)} />
            <WatchMenu 
              onClose={() => setShowWatch(false)} 
              onOpenAvatar={() => {
                setShowWatch(false);
                setShowAvatarCustomizer(true);
              }}
              onOpenMakerPen={() => {
                setShowWatch(false);
                setShowMakerPen(true);
              }}
              onOpenGames={() => {
                setShowWatch(false);
                setShowGames(true);
              }}
              onLogout={() => {
                auth.signOut();
                window.location.reload();
              }}
              onTeleport={(pos) => teleport(pos)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAvatarCustomizer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xl pointer-events-auto" onClick={() => setShowAvatarCustomizer(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ perspective: '2000px' }}>
               <motion.div 
                 initial={{ scale: 0.5, rotateY: 30, z: -500 }}
                 animate={{ scale: 1, rotateY: 0, z: 0 }}
                 className="w-full max-w-2xl bg-rec-slate-sidebar p-12 rounded-[60px] border-t-8 border-white rec-card-shadow relative overflow-hidden"
               >
                 <h2 className="text-5xl font-black text-white mb-8 uppercase italic text-center drop-shadow-lg tracking-tighter">Customize Avatar</h2>
                 <div className="space-y-10">
                   <div>
                     <label className="block text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-4 text-center">Skin Tone / Shirt Color</label>
                     <div className="grid grid-cols-4 gap-4">
                       {COLORS.map((c) => (
                         <button
                           key={c}
                           onClick={() => {
                             if (profile) {
                               const newProfile = { ...profile, avatar: { ...profile.avatar, color: c } };
                               setProfile(newProfile);
                               // Ideally persist to DB here
                             }
                           }}
                           className={`aspect-square rounded-[24px] border-b-8 border-black/30 transition-transform hover:scale-110 ${profile?.avatar.color === c ? 'ring-8 ring-white scale-110' : ''}`}
                           style={{ backgroundColor: c }}
                         />
                       ))}
                     </div>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-4 text-center">Headwear</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => profile && setProfile({ ...profile, avatar: { ...profile.avatar, hat: 'none' } })}
                          className={`py-6 rounded-[24px] font-black italic uppercase tracking-tighter text-xl border-b-4 border-black/20 ${profile?.avatar.hat === 'none' ? 'bg-rec-orange text-white' : 'bg-white/10 text-white/60'}`}
                        >
                          No Hat
                        </button>
                        <button 
                          onClick={() => profile && setProfile({ ...profile, avatar: { ...profile.avatar, hat: 'cap' } })}
                          className={`py-6 rounded-[24px] font-black italic uppercase tracking-tighter text-xl border-b-4 border-black/20 ${profile?.avatar.hat === 'cap' ? 'bg-rec-orange text-white' : 'bg-white/10 text-white/60'}`}
                        >
                          Rec Cap
                        </button>
                      </div>
                   </div>

                   <button 
                    onClick={() => setShowAvatarCustomizer(false)}
                    className="w-full bg-rec-blue text-white font-black py-6 rounded-[32px] rec-card-shadow transition-all uppercase italic tracking-tighter text-3xl border-t-2 border-white/20"
                   >
                    DONE
                   </button>
                 </div>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGames && profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowGames(false)} />
            <MiniGamesModal onClose={() => setShowGames(false)} avatar={profile.avatar} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
