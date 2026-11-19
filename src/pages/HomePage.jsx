import React from 'react';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Bell,
  ArrowRight,
  Database,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Globe,
  Radio,
  FileSpreadsheet,
  Binary
} from 'lucide-react';
import OutbreakRiskBadge from '../components/OutbreakRiskBadge';
import { useSurveillance } from '../context/SurveillanceContext';

export default function HomePage({ setActivePage }) {
  const { regions, posts, alerts } = useSurveillance();

  const totalSignals = regions.reduce((acc, r) => acc + r.active_signals, 0);
  const criticalCount = regions.filter(r => r.risk_tier === 'Critical').length;
  const highCount = regions.filter(r => r.risk_tier === 'High').length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Hero Section (Compact & Professional) */}
      <section className="relative overflow-hidden rounded-2xl bg-[#091122] border border-slate-800 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          
          {/* System Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="uppercase tracking-wider text-[11px] font-semibold">AI-Powered Public Health Intelligence Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-2 font-sans flex items-center gap-2">
            Senti<span className="text-teal-400 font-black">Pulse</span>
          </h1>

          {/* Tagline & Subtitle */}
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-400 font-sans mb-1.5">
            Social Intelligence. Earlier Signals. Smarter Public Health.
          </p>

          <h2 className="text-base sm:text-lg font-semibold text-slate-200 tracking-normal mb-3 font-sans">
            AI-Powered Public Health Intelligence & Syndromic Surveillance Platform
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mb-6 font-sans">
            Transforming public social-media discussions into actionable syndromic intelligence through natural language processing, anomaly detection, geographic analysis, and predictive modelling.
          </p>

          {/* Three Primary Actions (Compact & Professional) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePage('dashboard')}
              className="px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm shadow-teal-500/20 font-sans"
            >
              <Activity className="w-4 h-4" />
              <span>Open Surveillance Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActivePage('agent')}
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-teal-500/40 text-teal-300 font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer font-sans"
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Consult SentiPulse Intelligence</span>
            </button>

            <button
              onClick={() => setActivePage('map')}
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer font-sans"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Explore Outbreak Map</span>
            </button>

            <button
              onClick={() => setActivePage('social-insights')}
              className="px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 font-sans font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Test NLP Pipeline</span>
            </button>
          </div>
        </div>

        {/* High-Density KPI Metric Strip Immediately Below Hero */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-semibold">Total Posts Processed</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">438,920</p>
            <p className="text-[11px] text-teal-400 font-sans mt-0.5">Automated Multi-Feed Stream</p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-semibold">Health-Relevant Mentions</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">84,310</p>
            <p className="text-[11px] text-sky-400 font-sans mt-0.5">19.2% Relevance Filter Ratio</p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-semibold">Active Syndromic Signals</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mt-1">{totalSignals.toLocaleString()}</p>
            <p className="text-[11px] text-amber-300 font-sans mt-0.5">+18.4% Weekly Surge Velocity</p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-semibold">Critical Epicenters</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400 font-mono mt-1">{criticalCount} Nodes</p>
            <p className="text-[11px] text-red-300 font-sans mt-0.5">Z &ge; 3.0σ Above Baseline</p>
          </div>
        </div>
      </section>

      {/* 2. End-to-End Surveillance Architecture Pipeline */}
      <section className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-sans uppercase tracking-wider text-teal-400 font-semibold">
            System Methodology & Workflow
          </p>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1 font-sans">
            Surveillance Lag Problem vs. Syndromic Social Intelligence
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-sans">
            Traditional laboratory surveillance suffers from a 7–14 day confirmation lag. SentiPulse detects acute community symptom spikes within 24–48 hours of onset.
          </p>
        </div>

        {/* 5-Stage Technical Architecture Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative">
            <div className="w-7 h-7 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-400 font-mono text-xs font-bold flex items-center justify-center mb-3">
              01
            </div>
            <h4 className="text-xs font-bold text-white">Ingestion & Privacy</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Streams public posts from Reddit, Bluesky, & forums. Zero PII storage; usernames, URLs, and phone numbers redacted at ingestion boundary.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative">
            <div className="w-7 h-7 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-400 font-mono text-xs font-bold flex items-center justify-center mb-3">
              02
            </div>
            <h4 className="text-xs font-bold text-white">NLP & Negation</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              4-word lookbehind negation handling (e.g. "no fever", "tested negative"). Slang & figurative noise filters discard non-health content.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative">
            <div className="w-7 h-7 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center justify-center mb-3">
              03
            </div>
            <h4 className="text-xs font-bold text-white">Z-Score Anomaly</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Calculates rolling 14-day standard deviation (mean μ, std σ). Triggers anomalous signal alerts when discussions exceed Z ≥ 2.0σ.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative">
            <div className="w-7 h-7 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-400 font-mono text-xs font-bold flex items-center justify-center mb-3">
              04
            </div>
            <h4 className="text-xs font-bold text-white">Multi-Horizon ML</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Generates 7, 14, and 30-day forecast curves using damped exponential smoothing with expanding 80% & 95% Poisson confidence cones.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative">
            <div className="w-7 h-7 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-400 font-mono text-xs font-bold flex items-center justify-center mb-3">
              05
            </div>
            <h4 className="text-xs font-bold text-white">SentiPulse Intelligence</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Retrieval-Augmented reasoning engine answering complex public health queries with live surveillance telemetry & intervention protocols.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Global Surveillance Nodes Quick Overview Grid */}
      <section className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-400" />
              Active Sentinel Nodes & Regional Risk Overview
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              10 global geographic monitoring stations tracking respiratory, febrile, vector-borne, and gastrointestinal discussions.
            </p>
          </div>
          <button
            onClick={() => setActivePage('map')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Interactive Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {regions.slice(0, 6).map((region) => (
            <div
              key={region.id}
              onClick={() => setActivePage('map')}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white truncate group-hover:text-teal-300 transition">
                    {region.name}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">({region.id})</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Dominant: <span className="text-teal-400 font-medium">{region.active_disease}</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                  <span>{region.active_signals.toLocaleString()} mentions</span>
                  <span>•</span>
                  <span>Z = +{region.anomaly_z}σ</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <OutbreakRiskBadge tier={region.risk_tier} score={region.risk_score} size="sm" />
                <p className="text-[10px] text-slate-500 font-mono mt-1">Score: {region.risk_score}%</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
