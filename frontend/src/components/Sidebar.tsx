import React from 'react';
import {
  ShieldAlert,
  SearchCheck,
  CalendarCheck2,
  BadgeDollarSign,
  ClipboardList,
  CloudSun,
  BookOpenText,
  Building2,
  Sparkles
} from 'lucide-react';

export type ActiveTab =
  | 'safety'
  | 'crack'
  | 'planner'
  | 'valuation'
  | 'daily-site'
  | 'weather'
  | 'knowledge';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: Array<{
    id: ActiveTab;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'safety',
      label: 'Safety & PPE Monitor',
      description: 'Hazard identification & PPE compliance',
      icon: ShieldAlert,
      badge: 'Visual AI',
    },
    {
      id: 'crack',
      label: 'Structural Defect & Cracks',
      description: 'Forensic diagnostics & repair methods',
      icon: SearchCheck,
      badge: 'NDT Vision',
    },
    {
      id: 'planner',
      label: 'Planner & Material Estimator',
      description: 'Bill of quantities, cost & Gantt charts',
      icon: CalendarCheck2,
    },
    {
      id: 'valuation',
      label: 'Real Estate Valuation',
      description: 'Replacement cost & financial yields',
      icon: BadgeDollarSign,
    },
    {
      id: 'daily-site',
      label: 'Daily Field Log Assistant',
      description: 'Crew headcount, blockers & executive brief',
      icon: ClipboardList,
    },
    {
      id: 'weather',
      label: 'Weather-Aware Advisory',
      description: 'Concrete pour suitability & crane limits',
      icon: CloudSun,
      badge: 'Live',
    },
    {
      id: 'knowledge',
      label: 'Engineering Knowledge Base',
      description: 'ACI, OSHA & IBC code Q&A bot',
      icon: BookOpenText,
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
            Core Intelligence Modules
          </span>
          <nav className="mt-2.5 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left flex items-start space-x-3 px-3.5 py-3 rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      isActive ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isActive
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-amber-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Decision Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Integrated ACI 318, OSHA 1926 & IBC guidelines for high-precision field guidance.
        </p>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
          <span>BuildIntel Enterprise</span>
          <span className="text-emerald-400 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
