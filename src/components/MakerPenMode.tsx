import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Box as BoxIcon, Circle, Triangle, Save, Eraser, PenTool, Share2, Globe, ArrowRight } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

export function MakerPenMode({ 
  onClose, 
  userEmail, 
  onSpawn,
  onClear 
}: { 
  onClose: () => void, 
  userEmail?: string | null,
  onSpawn: (type: string, color: string) => void,
  onClear: () => void
}) {
  const [objectsCount, setObjectsCount] = useState(0);
  const [roomName, setRoomName] = useState('My Awesome Room');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#rec-purple'); // Default placeholder

  const shapes = [
    { icon: <BoxIcon />, label: 'Cube', type: 'box' },
    { icon: <Circle />, label: 'Sphere', type: 'sphere' },
    { icon: <Triangle />, label: 'Pyramid', type: 'box' }, // Simplified cone as box for physics
  ];

  const handleSpawn = (type: string) => {
    onSpawn(type, '#8b5cf6'); // Purple as default
    setObjectsCount(prev => prev + 1);
  };

  const handlePublish = async () => {
    if (!auth.currentUser) return;
    setPublishing(true);
    try {
      await addDoc(collection(db, 'published_rooms'), {
        name: roomName,
        creator: userEmail || 'Anonymous Player',
        creatorId: auth.currentUser.uid,
        objectsCount: objectsCount + Math.floor(Math.random() * 50), 
        createdAt: serverTimestamp(),
      });
      setPublished(true);
      setTimeout(() => {
        setPublished(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error publishing room:", error);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pointer-events-none" style={{ perspective: '2000px' }}>
      <motion.div 
        initial={{ y: 100, opacity: 0, rotateX: 30 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        className="bg-rec-slate-sidebar/95 backdrop-blur-2xl rounded-[60px] border-t-8 border-white p-12 w-full max-w-4xl shadow-2xl pointer-events-auto overflow-hidden relative"
      >
        <AnimatePresence>
          {published && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-50 bg-rec-blue flex flex-col items-center justify-center text-white"
            >
              <Globe size={120} className="animate-spin-slow mb-6" />
              <h2 className="text-6xl font-black italic uppercase tracking-tighter">ROOM PUBLISHED!</h2>
              <p className="font-bold opacity-60 uppercase tracking-widest mt-4">Everyone can see it now</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-rec-purple rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-6">
              <PenTool size={48} className="text-white" />
            </div>
            <div>
              <input 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="bg-transparent text-6xl font-black text-white italic uppercase tracking-tighter leading-none outline-none border-b-4 border-white/10 focus:border-rec-purple transition-colors"
                placeholder="Enter Room Name..."
              />
              <p className="text-rec-purple font-black uppercase tracking-[0.4em] text-xs mt-2">Creative Studio v1.0 • Creator: {userEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-6 bg-white/10 rounded-3xl text-white hover:bg-rec-orange transition-all">
            <X size={40} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {shapes.map((s) => (
             <button 
               key={s.label}
               onClick={() => handleSpawn(s.type)}
               className="bg-white/5 rounded-[40px] p-10 flex flex-col items-center gap-4 hover:bg-rec-purple hover:scale-105 transition-all border-b-8 border-black/20 group"
             >
                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <span className="text-2xl font-black text-white italic uppercase tracking-tighter">{s.label}</span>
             </button>
          ))}
        </div>

        <div className="mt-12 flex gap-4">
           <button 
              onClick={() => { onClear(); setObjectsCount(0); }}
              className="flex-1 bg-white/10 py-8 rounded-[32px] text-white font-black italic uppercase tracking-tighter text-2xl border-b-6 border-black/30 flex items-center justify-center gap-4 hover:bg-rec-orange transition-all"
           >
             <Eraser size={32} /> Clear
           </button>
           <button 
             onClick={handlePublish}
             disabled={publishing}
             className="flex-1 bg-rec-blue py-8 rounded-[32px] text-white font-black italic uppercase tracking-tighter text-3xl border-t-4 border-white/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
           >
             {publishing ? (
               <div className="w-10 h-10 border-6 border-white border-t-transparent rounded-full animate-spin" />
             ) : (
               <>
                 <Share2 size={40} /> PUBLISH TO GLOBAL
               </>
             )}
           </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute left-10 bottom-10 bg-black/40 backdrop-blur-md p-6 rounded-3xl border-l-8 border-rec-purple"
      >
        <p className="text-white font-black italic uppercase text-xs tracking-widest opacity-50 mb-2">Maker Guide</p>
        <p className="text-white text-sm font-bold">1. Select a shape</p>
        <p className="text-white text-sm font-bold">2. Point and place in 3D</p>
        <p className="text-white text-sm font-bold">3. Scale with triggers</p>
      </motion.div>
    </div>
  );
}

export function GlobalRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const q = query(collection(db, 'published_rooms'), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        setRooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <Globe size={40} className="text-rec-blue" />
        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Community Rooms</h3>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
            <div className="w-16 h-16 border-8 border-rec-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
          {rooms.map((room) => (
            <motion.div 
              key={room.id}
              whileHover={{ x: 10 }}
              className="bg-white/5 border-l-8 border-rec-blue p-6 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all"
            >
              <div>
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">{room.name}</h4>
                <p className="text-white/40 font-bold text-sm uppercase tracking-widest">By @{room.creator.split('@')[0]}</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-rec-blue font-black text-xl leading-none">{room.objectsCount}</p>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Objects</p>
                 </div>
                 <ArrowRight className="text-white opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
