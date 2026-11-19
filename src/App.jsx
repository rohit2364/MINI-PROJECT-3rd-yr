import React, { useState, Component } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SurveillanceProvider } from './context/SurveillanceContext';

import DisclaimerBanner from './components/DisclaimerBanner';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LiveSignalTicker from './components/LiveSignalTicker';
import FloatingAgentWidget from './components/FloatingAgentWidget';

import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AgentPage from './pages/AgentPage';
import SocialMediaInsightsPage from './pages/SocialMediaInsightsPage';
import OutbreakPredictionPage from './pages/OutbreakPredictionPage';
import OutbreakMapPage from './pages/OutbreakMapPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import DataSourcesPage from './pages/DataSourcesPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Surveillance ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-8 max-w-2xl mx-auto rounded-2xl bg-[#0b1220] border border-red-500/30 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <span className="text-xl font-bold font-mono">!</span>
          </div>
          <h2 className="text-lg font-bold text-white">Surveillance Module Recovered</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            A rendering exception occurred in this module. The background surveillance telemetry remains active and unaffected.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer font-mono"
            >
              Return to Main Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default hidden/collapsed

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />;
      case 'dashboard':
        return <DashboardPage setActivePage={setActivePage} />;
      case 'agent':
        return <AgentPage setActivePage={setActivePage} />;
      case 'social-insights':
        return <SocialMediaInsightsPage />;
      case 'predictions':
        return <OutbreakPredictionPage />;
      case 'map':
        return <OutbreakMapPage setActivePage={setActivePage} />;
      case 'alerts':
        return <AlertsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'data-sources':
        return <DataSourcesPage />;
      case 'about':
        return <AboutPage />;
      case 'login':
        return <LoginPage setActivePage={setActivePage} />;
      default:
        return <DashboardPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#070b14] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 1. Global Public Health Responsibility Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Top Navigation Bar (with fixed extreme-left hamburger toggle) */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* 3. Live Streaming Ingestion Ticker & Monitor */}
      <LiveSignalTicker />

      {/* 4. Collapsible Off-Canvas Sidebar (Attached to extreme left edge) */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* 5. Main Dashboard Container (occupies full available width when sidebar collapsed) */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-6 max-w-[1720px] mx-auto overflow-hidden">
        <ErrorBoundary onReset={() => setActivePage('dashboard')}>
          {renderActivePage()}
        </ErrorBoundary>
      </main>

      {/* 6. Enterprise Surveillance Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d19] py-5 text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
        <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white font-sans">
              Senti<span className="text-teal-400 font-black">Pulse</span>
            </span>
            <span className="font-sans">• AI-Powered Public Health Intelligence & Syndromic Surveillance Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-sans">
            <button onClick={() => setActivePage('about')} className="hover:text-teal-400 transition cursor-pointer">
              Responsible AI & Governance
            </button>
            <button onClick={() => setActivePage('data-sources')} className="hover:text-teal-400 transition cursor-pointer">
              Data Provenance & APIs
            </button>
            <button onClick={() => setActivePage('reports')} className="hover:text-teal-400 transition cursor-pointer">
              Export Center (CSV/PDF)
            </button>
            <span className="font-sans text-slate-500 font-medium">v2.4 Enterprise</span>
          </div>
        </div>
      </footer>

      {/* 7. Global Floating AI Epidemiologist Assistant Widget */}
      <FloatingAgentWidget setActivePage={setActivePage} />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SurveillanceProvider>
          <MainApp />
        </SurveillanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
