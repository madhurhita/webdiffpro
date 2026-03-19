import React from 'react';
import { Activity, ShieldCheck, Search, Github } from 'lucide-react';

interface NavbarProps {
  onHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHome }) => {
  return (
    <nav className="w-full h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-[100] transition-colors hover:bg-background">
      <div 
        onClick={onHome} 
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
           <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
           <h1 className="text-xl font-extrabold tracking-tighter text-white">WebDiff <span className="text-blue-400">Pro</span></h1>
           <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold group-hover:text-zinc-400 transition-colors">Visual Analysis Engine</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-10">
        <NavLink icon={<ShieldCheck className="w-4 h-4" />} label="Security" />
        <NavLink icon={<Search className="w-4 h-4" />} label="Analysis" />
        <NavLink icon={<Activity className="w-4 h-4" />} label="Performance" />
      </div>

      <div className="flex items-center gap-4">
        <a 
          href="https://github.com" 
          target="_blank" 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-all"
        >
          <Github className="w-4 h-4" />
          STAR ON GITHUB
        </a>
      </div>
    </nav>
  );
};

const NavLink = ({ icon, label }: any) => (
  <button className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors relative group">
    {icon}
    {label}
    <div className="absolute -bottom-8 left-0 right-0 h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
  </button>
);

export default Navbar;
