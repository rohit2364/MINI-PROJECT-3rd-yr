import React, { useEffect } from 'react';
import {
  Home,
  LayoutDashboard,
  Bot,
  MessageSquare,
  TrendingUp,
  Map,
  Bell,
  FileText,
  Database,
  Info,
  KeyRound,
  X,
  Activity,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import SentiPulseLogo from './SentiPulseLogo';
import { useSurveillance } from '../context/SurveillanceContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, setActivePage, isSidebarOpen, setIsSidebarOpen }) {
  const { alerts, serverOnline } = useSurveillance();
  const { currentUser } = useAuth();
  const activeAlertsCount = alerts.filter(a => a.status === 'Active' || a.status === 'Under Review' || a.status === 'New').length;

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, setIsSidebarOpen]);

  const navItems = [
    { id: 'home', label: 'Home Overview', icon: Home, desc: 'Project vision & system architecture' },
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, desc: 'Real-time syndromic metrics' },
    { id: 'agent', label: 'AI Epidemiologist', icon: Bot, isAgent: true, desc: 'SentiPulse AI reasoning assistant' },
    { id: 'social-insights', label: 'Social Media NLP', icon: MessageSquare, desc: 'Symptom NLP & noise filter' },
    { id: 'predictions', label: 'Outbreak Prediction', icon: TrendingUp, desc: 'Multi-horizon ML forecasting' },
    { id: 'map', label: 'Outbreak Map', icon: Map, desc: 'Interactive geographic risk clusters' },
    { id: 'alerts', label: 'Early Warnings', icon: Bell, badge: activeAlertsCount, desc: 'Active triage & protocols' },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText, desc: 'Executive PDF summary & CSV' },
    { id: 'data-sources', label: 'Data Provenance', icon: Database, desc: 'Ingestion feeds & privacy guard' },
    { id: 'about', label: 'About & Ethics', icon: Info, desc: 'Responsible non-clinical AI' },
    { id: 'login', label: 'Access & Roles', icon: KeyRound, desc: 'Role permissions & demo personas' },
  ];

  const handleSelect = (pageId) => {
    setActivePage(pageId);
    setIsSidebarOpen(false); // Automatically collapse sidebar upon navigation
  };

  return (
    <>
      {/* 1. Subtle Backdrop Overlay (Does not excessively darken application) */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-200 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Off-Canvas Sidebar Attached to Left Edge */}
      <aside
        aria-label="Sidebar Navigation"
        className={`fixed inset-y-0 left-0 z-50 w-[265px] h-full bg-[#080d19] text-slate-200 border-r border-slate-800 shadow-2xl flex flex-col justify-between transition-transform duration-250 ease-in-out font-sans ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SentiPulseLogo size="sm" />
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close navigation (Esc)"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1 no-scrollbar font-sans">
          <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
            Navigation Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition cursor-pointer group relative ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-teal-400" />
                )}

                <div className="flex items-center gap-2.5 min-w-0 pl-1">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-300'
                    }`}
                  />
                  <div className="truncate">
                    <p className="truncate text-xs leading-snug">{item.label}</p>
                    <p className="text-[11px] text-slate-400 truncate leading-none mt-0.5 font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {item.isAgent && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1 shrink-0 font-sans">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI
                  </span>
                )}

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#060a14] space-y-2 font-sans">
          {/* Active User Card */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="w-7 h-7 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 font-sans">
              {currentUser?.avatar || 'EV'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight font-sans">
                {currentUser?.name || 'Dr. Evelyn Vance'}
              </p>
              <p className="text-[11px] text-teal-400 truncate font-sans">
                {currentUser?.role || 'Public Health Officer'}
              </p>
            </div>
          </div>

          {/* Engine Status */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-sans">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {serverOnline ? 'REST Engine Active' : 'SentiPulse Standalone'}
            </span>
            <span className="text-slate-500 font-mono text-[10px]">v1.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}
