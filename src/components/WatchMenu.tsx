import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Users, 
  PlusCircle, 
  Home, 
  Ticket, 
  Mail, 
  CheckSquare, 
  Briefcase, 
  Users2, 
  ShoppingBag, 
  Building2,
  X,
  LogOut,
  User as UserIcon,
  ChevronLeft,
  Search,
  MessageSquare,
  Trophy,
  Coffee,
  Coins,
  Settings,
  Cpu
} from 'lucide-react';

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}

function MenuButton({ icon, label, color, onClick }: MenuButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative w-full aspect-square rounded-[32px] flex flex-col items-center justify-center gap-2 rec-card-shadow transition-all group overflow-hidden border-t-4 border-white/20`}
      style={{ backgroundColor: color }}
    >
      <div className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-white font-black italic uppercase text-[10px] tracking-widest drop-shadow-md">
        {label}
      </span>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    </motion.button>
  );
}

export function WatchMenu({ 
  onClose, 
  onOpenGames, 
  onOpenAvatar, 
  onOpenMakerPen, 
  onLogout,
  onTeleport
}: { 
  onClose: () => void, 
  onOpenGames: () => void, 
  onOpenAvatar: () => void, 
  onOpenMakerPen: () => void, 
  onLogout: () => void,
  onTeleport: (pos: [number, number, number]) => void
}) {
  const [activeTab, setActiveTab] = useState<'main' | 'events' | 'people' | 'store' | 'backpack' | 'clubs' | 'rec-center' | 'this-room' | 'messages' | 'challenges' | 'mods'>('main');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <h3 className="text-4xl font-black text-slate-800 italic uppercase italic tracking-tighter mb-6 flex items-center gap-4">
              <Ticket size={40} className="text-rec-purple" /> Live Events
            </h3>
            {[
              { title: 'Paintball Tournament', time: 'Starting in 5m', people: '128' },
              { title: 'Laser Tag Pro League', time: 'In Progress', people: '44' },
              { title: 'Dorm Room Party', time: 'Tonight 8PM', people: '12k' }
            ].map((e, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border-b-8 border-slate-200 flex justify-between items-center">
                 <div>
                    <p className="font-black italic uppercase text-2xl text-slate-800">{e.title}</p>
                    <p className="text-rec-purple font-black uppercase text-xs tracking-widest">{e.time}</p>
                 </div>
                 <div className="text-right">
                    <p className="font-black text-slate-400">{e.people} JOINED</p>
                 </div>
              </div>
            ))}
          </div>
        );
      case 'people':
        return (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl mb-6">
              <Search className="text-slate-400" />
              <input className="bg-transparent border-none outline-none font-bold text-xl flex-1" placeholder="Search friends..." />
            </div>
            {[
              { name: 'Coach', status: 'Online - Rec Center', color: '#ff4444' },
              { name: 'MakerBot', status: 'Online - Creating', color: '#44ff44' },
              { name: 'VR_Pro', status: 'Offline', color: '#4444ff' }
            ].map((p, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border-b-6 border-slate-100 flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl" style={{ backgroundColor: p.color }} />
                 <div>
                    <p className="font-black italic uppercase text-2xl text-slate-800">{p.name}</p>
                    <p className="text-slate-400 font-bold uppercase text-xs">{p.status}</p>
                 </div>
              </div>
            ))}
          </div>
        );
      case 'store':
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl font-black text-slate-800 italic uppercase">Avatar Store</h3>
              <div className="flex items-center gap-2 bg-rec-blue/10 px-6 py-2 rounded-full">
                <Coins size={20} className="text-rec-orange" />
                <span className="font-black text-rec-blue">5,200</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
              {[
                { name: 'Epic Hat', price: 500, img: '🎩' },
                { name: 'Cool Shoes', price: 1200, img: '👟' },
                { name: 'Rec Hoodie', price: 800, img: '🧥' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border-b-4 border-slate-200 flex flex-col items-center">
                   <div className="text-6xl mb-4">{item.img}</div>
                   <p className="font-black text-slate-800 uppercase text-xs mb-2 text-center">{item.name}</p>
                   <button className="bg-rec-blue text-white w-full py-2 rounded-xl font-black">
                      {item.price}
                   </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'backpack':
        return (
          <div className="flex-1">
             <h3 className="text-4xl font-black text-slate-800 italic uppercase mb-8">Your Tools</h3>
              <div className="grid grid-cols-2 gap-6">
                <div onClick={onOpenMakerPen} className="bg-rec-purple p-8 rounded-3xl border-b-8 border-black/20 text-white flex flex-col items-center cursor-pointer hover:scale-105 transition-all">
                  <PlusCircle size={64} />
                  <p className="font-black italic text-2xl uppercase mt-4">Maker Pen</p>
                </div>
                 <div className="bg-white p-8 rounded-3xl border-b-8 border-slate-200 text-slate-400 flex flex-col items-center opacity-50">
                  <Coffee size={64} />
                  <p className="font-black italic text-2xl uppercase mt-4">Root Beer</p>
                </div>
              </div>
          </div>
        );
      case 'messages':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <Mail size={80} className="mb-4 opacity-20" />
             <p className="font-black italic uppercase tracking-tighter text-2xl">Inbox is Empty</p>
             <p className="text-xs uppercase tracking-widest font-bold">Go make some friends!</p>
          </div>
        );
      case 'challenges':
        return (
          <div className="flex-1 space-y-4">
             <h3 className="text-4xl font-black text-slate-800 italic uppercase mb-8">Daily Challenges</h3>
             {[
               { t: 'Complete a Game', p: '25%', c: 'Ticket' },
               { t: 'Spawn 5 Objects', p: '0%', c: 'Box' },
               { t: 'Visit the Rec Center', p: '100%', c: 'Outfit' }
             ].map((c, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border-b-4 border-slate-200">
                   <div className="flex justify-between items-center mb-2">
                      <p className="font-black text-slate-800 italic uppercase">{c.t}</p>
                      <span className="text-rec-blue font-black">{c.p}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-rec-blue" style={{ width: c.p }} />
                   </div>
                </div>
             ))}
          </div>
        );
      case 'this-room':
        return (
          <div className="flex-1 space-y-6">
             <div className="bg-rec-orange/10 p-8 rounded-[40px] border-b-6 border-rec-orange/20">
                <h3 className="text-4xl font-black text-slate-800 italic uppercase italic tracking-tighter mb-2">^DormRoom</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Created by Coach • Privacy: Public</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border-b-4 border-slate-100 flex flex-col items-center">
                   <Users className="text-rec-blue mb-2" size={32} />
                   <p className="font-black text-slate-800 uppercase text-xs">5 Players</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border-b-4 border-slate-100 flex flex-col items-center">
                   <Settings className="text-slate-400 mb-2" size={32} />
                   <p className="font-black text-slate-800 uppercase text-xs">Room Settings</p>
                </div>
             </div>
          </div>
        );
      case 'rec-center':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
             <Building2 size={120} className="text-rec-orange mb-6" />
             <h3 className="text-5xl font-black text-slate-800 italic uppercase">Going to Rec Center?</h3>
             <p className="text-slate-400 font-bold max-w-md mt-4 mb-8 uppercase tracking-widest text-sm">Join hundreds of other players in the social hub of RecRoomWeb!</p>
             <button onClick={() => { onTeleport([0, 5, 0]); onClose(); }} className="bg-rec-orange text-white px-12 py-6 rounded-[32px] font-black italic uppercase text-2xl rec-card-shadow">
                TRAVEL NOW
             </button>
          </div>
        );
      case 'clubs':
        return (
          <div className="flex-1 space-y-4">
             <h3 className="text-4xl font-black text-slate-800 italic uppercase mb-8">Your Clubs</h3>
              {[
                { name: 'Builders Alliance', members: '12k', color: '#8E24AA' },
                { name: 'Paintball Pros', members: '50k', color: '#FF3D00' }
              ].map((club, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border-b-6 border-slate-100 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: club.color }} />
                      <div>
                        <p className="font-black italic uppercase text-xl text-slate-800">{club.name}</p>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">{club.members} Members</p>
                      </div>
                   </div>
                   <button className="bg-slate-100 px-4 py-2 rounded-xl text-slate-800 font-black text-xs uppercase">Enter</button>
                </div>
              ))}
          </div>
        );
      case 'mods':
        return (
          <div className="flex-1 space-y-4">
             <h3 className="text-4xl font-black text-slate-800 italic uppercase mb-8">Experimental Mods</h3>
             {[
               { name: 'Low Gravity', desc: 'Jump like you are on the moon', active: false, color: '#38bdf8' },
               { name: 'Speed Boost', desc: 'Run 2x faster than normal', active: true, color: '#f87171' },
               { name: 'Night Mode', desc: 'Darken the room for cozy vibes', active: false, color: '#818cf8' },
               { name: 'Infinite Ink', desc: 'Never run out of Maker Pen ink', active: true, color: '#34d399' }
             ].map((mod, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border-b-6 border-slate-100 flex justify-between items-center">
                   <div>
                      <p className="font-black italic uppercase text-xl text-slate-800">{mod.name}</p>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{mod.desc}</p>
                   </div>
                   <div className={`w-16 h-8 rounded-full p-1 cursor-pointer transition-colors ${mod.active ? 'bg-rec-purple' : 'bg-slate-200'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full transition-transform ${mod.active ? 'translate-x-8' : 'translate-x-0'}`} />
                   </div>
                </div>
             ))}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-4 gap-6">
            <MenuButton icon={<Gamepad2 size={56} />} label="Play" color="#FF3D00" onClick={onOpenGames} />
            <MenuButton icon={<Ticket size={56} />} label="Events" color="#6200EA" onClick={() => setActiveTab('events')} />
            <MenuButton icon={<PlusCircle size={56} />} label="Create" color="#2E7D32" onClick={onOpenMakerPen} />
            <MenuButton icon={<Home size={56} />} label="This Room" color="#00796B" onClick={() => setActiveTab('this-room')} />
            
            <MenuButton icon={<Users size={56} />} label="People" color="#C2185B" onClick={() => setActiveTab('people')} />
            <MenuButton icon={<Mail size={56} />} label="Messages" color="#0288D1" onClick={() => setActiveTab('messages')} />
            <MenuButton icon={<CheckSquare size={56} />} label="Challenges" color="#FBC02D" onClick={() => setActiveTab('challenges')} />
            <MenuButton icon={<Cpu size={56} />} label="Mods" color="#4F46E5" onClick={() => setActiveTab('mods')} />
            
            <MenuButton icon={<Briefcase size={56} />} label="Backpack" color="#E64A19" onClick={() => setActiveTab('backpack')} />
            <MenuButton icon={<Users2 size={56} />} label="Clubs" color="#8E24AA" onClick={() => setActiveTab('clubs')} />
            <MenuButton icon={<ShoppingBag size={56} />} label="Store" color="#0097A7" onClick={() => setActiveTab('store')} />
            <MenuButton icon={<Building2 size={56} />} label="Rec Center" color="#D32F2F" onClick={() => setActiveTab('rec-center')} />
            <button 
             onClick={onLogout}
             className="relative aspect-square rounded-[32px] bg-slate-800 flex flex-col items-center justify-center gap-2 rec-card-shadow border-t-4 border-white/10 text-white font-black italic uppercase text-[10px] tracking-widest"
            >
              <LogOut size={56} />
              LOGOUT
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" style={{ perspective: '2000px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotateX: 60, z: -500 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          rotateX: 0, 
          z: 0,
          y: [0, -20, 0] // Floating pulse
        }}
        exit={{ opacity: 0, scale: 0.5, rotateX: 60, z: -500 }}
        transition={{ 
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          default: { type: 'spring', damping: 20, stiffness: 80 }
        }}
        className="w-full max-w-4xl bg-[#fdf2e9]/95 backdrop-blur-2xl rounded-[80px] p-16 border-[12px] border-white rec-card-shadow shadow-[0_80px_160px_rgba(0,0,0,0.7)] relative overflow-hidden pointer-events-auto transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-4 bg-white/20" />

        {/* Watch Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            {activeTab !== 'main' ? (
              <button 
                onClick={() => setActiveTab('main')}
                className="w-20 h-20 bg-slate-800 rounded-[32px] flex items-center justify-center text-white shadow-lg hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={48} />
              </button>
            ) : (
              <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-inner border-2 border-white">
                <div className="w-12 h-12 bg-rec-orange rounded-2xl shadow-lg" />
              </div>
            )}
            <div>
              <h2 className="text-6xl font-black italic uppercase text-slate-800 tracking-tighter leading-none">
                {activeTab === 'main' ? 'Your Watch' : activeTab.replace('-', ' ')}
              </h2>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Connected • v1.4.2</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onOpenAvatar}
              className="p-5 bg-rec-blue rounded-3xl text-white rec-card-shadow rec-btn-hover transition-all flex items-center gap-3 px-8"
            >
              <UserIcon size={32} />
              <span className="font-black italic uppercase">Avatar</span>
            </button>
            <button onClick={onClose} className="p-5 bg-rec-orange rounded-3xl text-white rec-card-shadow rec-btn-hover transition-all">
              <X className="w-10 h-10" />
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-6 h-32 bg-slate-300 rounded-full opacity-20" />
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-32 bg-slate-300 rounded-full opacity-20" />
      </motion.div>
    </div>
  );
}
