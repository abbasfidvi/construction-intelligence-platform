import React from 'react';
import { HardHat, Activity, Cpu, Sparkles, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  aiStatus: string;
  activeSite: string;
  setActiveSite: (site: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ aiStatus, activeSite, setActiveSite }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <HardHat className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              BuildIntel <span className="text-amber-500">AI</span>
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              MULTIMODAL v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400">Intelligent Construction Field & Engineering Platform</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Project Selector */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 rounded-lg px-3 py-1.5 border border-slate-700/60">
          <span className="text-xs text-slate-400 font-medium">Project:</span>
          <select
            value={activeSite}
            onChange={(e) => setActiveSite(e.target.value)}
            className="bg-transparent text-xs font-semibold text-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="Skyline Apex Tower - Phase III" className="bg-slate-900 text-slate-200">Skyline Apex Tower - Phase III</option>
            <option value="Metro Logistic Hub & Depots" className="bg-slate-900 text-slate-200">Metro Logistic Hub & Depots</option>
            <option value="Grandview Coastal Residences" className="bg-slate-900 text-slate-200">Grandview Coastal Residences</option>
          </select>
        </div>

        {/* AI Model Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Gemini 3.8 Flash</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>
    </header>
  );
};
