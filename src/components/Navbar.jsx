import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Sun,
  Moon,
  RefreshCw,
  User,
  Shield,
  Menu,
  X,
  Server,
  Bot,
  Bell,
  ChevronDown,
  Check,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import SentiPulseLogo from './SentiPulseLogo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSurveillance } from '../context/SurveillanceContext';

export default function Navbar({ activePage, setActivePage, isSidebarOpen, setIsSidebarOpen }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, availableUsers, switchRole } = useAuth();
  const { serverOnline, lastUpdated, refreshSurveillance, alerts } = useSurveillance();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const roleMenuRef = useRef(null);
  const alertsMenuRef = useRef(null);

  const activeAlerts = alerts.filter(a => a.status === 'Active' || a.status === 'Under Review' || a.status === 'New');

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(event.target)) {
        setAlertsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshSurveillance();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#080d19]/95 backdrop-blur-md border-b border-slate-800 font-sans transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-15">
          
          {/* Left: Extreme Left Fixed Hamburger Menu & Enterprise Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-slate-700/60"
              title="Toggle Navigation Menu (Esc to close)"
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X className="w-4 h-4 text-teal-400" /> : <Menu className="w-4 h-4 text-slate-200" />}
            </button>

            <div 
              onClick={() => setActivePage('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <SentiPulseLogo size="md" />
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-sans font-medium bg-slate-800 text-slate-300 border border-slate-700">
                v2.4 Enterprise
              </span>
            </div>
          </div>

          {/* Center / Right: Enterprise Status, AI Agent, Alerts, Role Profile */}
          <div className="flex items-center gap-2 sm:gap-3 font-sans">
            
            {/* Backend Connectivity Indicator */}
            <div 
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0b1220] border border-slate-800 text-xs text-slate-300 font-sans"
              title="Surveillance REST engine health status"
            >
              <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium">{serverOnline ? 'REST API Online' : 'SentiPulse Standalone'}</span>
              <span className="text-slate-500 font-mono text-[11px]">| 24ms</span>
            </div>

            {/* AI Agent Quick Launcher */}
            <button
              onClick={() => setActivePage('agent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                activePage === 'agent'
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-xs'
                  : 'bg-teal-500/10 text-teal-300 border-teal-500/20 hover:bg-teal-500/20'
              }`}
              title="Consult SentiPulse Intelligence Assistant"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">SentiPulse AI</span>
            </button>

            {/* Early Warning Notifications Bell with Dropdown */}
            <div className="relative" ref={alertsMenuRef}>
              <button
                onClick={() => setAlertsDropdownOpen(!alertsDropdownOpen)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
                title={`${activeAlerts.length} Active Early Warnings`}
                aria-label="Alerts notification center"
              >
                <Bell className="w-4 h-4" />
                {activeAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {alertsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0b1220] border border-slate-800 shadow-2xl z-50 overflow-hidden text-xs text-slate-200 font-sans">
                  <div className="p-3.5 bg-[#070b14] border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-white">Active Early Warnings ({activeAlerts.length})</span>
                    </div>
                    <button
                      onClick={() => { setActivePage('alerts'); setAlertsDropdownOpen(false); }}
                      className="text-teal-400 hover:underline text-xs font-medium cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80 no-scrollbar">
                    {activeAlerts.slice(0, 4).map((alert) => (
                      <div 
                        key={alert.id}
                        onClick={() => { setActivePage('alerts'); setAlertsDropdownOpen(false); }}
                        className="p-3.5 hover:bg-slate-800/50 cursor-pointer transition flex items-start gap-2.5"
                      >
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          alert.risk_tier === 'Critical' ? 'bg-rose-400' : 'bg-amber-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">{alert.headline || `${alert.region_name} - ${alert.disease}`}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{alert.trigger_explanation}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                            <span>{alert.region_name}</span>
                            <span>•</span>
                            <span className="text-teal-400 font-mono">{alert.detected_velocity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Data Sync Button */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
              title={`Last synchronized: ${lastUpdated}. Click to re-fetch telemetry.`}
              aria-label="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
              title={darkMode ? "Switch to Light Interface" : "Switch to Dark Interface"}
              aria-label="Toggle display theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative" ref={roleMenuRef}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-[#0b1220] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition cursor-pointer text-left"
                aria-label="User role profile"
              >
                <div className="w-6 h-6 rounded bg-teal-500/15 border border-teal-500/25 text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser?.avatar || 'EV'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-medium text-white leading-tight truncate max-w-[120px]">
                    {currentUser?.name?.split(',')[0] || 'Dr. Evelyn Vance'}
                  </p>
                  <p className="text-[10px] text-teal-400 leading-none truncate max-w-[120px]">
                    {currentUser?.role || 'Health Officer'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0b1220] border border-slate-800 shadow-2xl z-50 p-2 text-xs text-slate-200 font-sans">
                  <div className="p-2.5 border-b border-slate-800 mb-1">
                    <p className="font-bold text-white text-xs">{currentUser?.name}</p>
                    <p className="text-xs text-teal-400">{currentUser?.organization}</p>
                    <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#070b14] text-slate-300 border border-slate-800">
                      Role: {currentUser?.role}
                    </span>
                  </div>

                  <div className="px-2.5 py-1 text-xs uppercase font-semibold text-slate-400 tracking-wider">
                    Switch Access Persona
                  </div>

                  <div className="space-y-0.5">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchRole(user.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${
                          currentUser?.id === user.id
                            ? 'bg-teal-500/15 text-teal-300 font-medium border border-teal-500/30'
                            : 'hover:bg-slate-800/70 text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-xs">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.role}</p>
                        </div>
                        {currentUser?.id === user.id && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => { setActivePage('login'); setRoleDropdownOpen(false); }}
                      className="w-full text-center py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      Manage Role Permissions →
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
