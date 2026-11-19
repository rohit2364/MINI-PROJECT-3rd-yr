import React from 'react';
import {
  Info,
  ShieldCheck,
  HeartHandshake,
  Cpu,
  Mail,
  GraduationCap,
  Sparkles,
  Lock,
  Layers,
  AlertTriangle,
  Github,
  Globe
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#091122] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              About SentiPulse — Mission & Governance
            </h1>
            <span className="bg-teal-500/15 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-teal-500/30 font-sans">
              Responsible AI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl font-sans">
            A production-style public health intelligence platform bridging natural language surveillance and predictive epidemiology to discover emerging illness signals before clinical hospitalization waves.
          </p>
        </div>
      </div>

      {/* Vision & Objectives */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-white mb-3 font-sans uppercase tracking-wider">
          Project Objectives & Epidemiological Rationale
        </h3>
        <div className="text-xs text-slate-300 leading-relaxed space-y-3 font-sans">
          <p>
            Traditional public health surveillance relies on laboratory-confirmed PCR tests and clinical electronic health record (EHR) admissions. While gold-standard, these indicators suffer from a <strong>7 to 14-day reporting lag</strong> caused by test processing turnaround and healthcare-seeking delays.
          </p>
          <p>
            When symptomatic individuals experience initial febrile, respiratory, or gastrointestinal distress, they frequently share experiences online or seek community advice days before consulting a clinician. <strong>SentiPulse</strong> monitors permitted, publicly accessible, and anonymized social discussions to estimate statistical anomalies in symptom frequency, providing healthcare administrators with earlier situational awareness.
          </p>
        </div>
      </div>

      {/* Responsible AI & Public Health Ethics */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white font-sans uppercase tracking-wider">
              Responsible AI & Public Health Ethical Framework
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Core operating principles guiding surveillance modeling, data handling, and public health communications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white text-xs">
              1. Non-Diagnostic Medical Stance
            </h4>
            <p className="text-[11px] text-slate-400">
              SentiPulse never diagnoses individual illnesses or provides personal health recommendations. All indicators reflect population-level syndromic chatter.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white text-xs">
              2. Zero PII Storage & Anonymization
            </h4>
            <p className="text-[11px] text-slate-400">
              Automated regex and pseudonymization engines strip handles, phone numbers, email addresses, and URLs at the network boundary. No individual user profiles are indexed.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white text-xs">
              3. Mandatory Secondary Verification Gate
            </h4>
            <p className="text-[11px] text-slate-400">
              All automated alerts remain designated as "Unverified Public Health Signals" until cross-referenced with PCR positivity rates or clinic chief complaints.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white text-xs">
              4. Research Prototype Disclosure
            </h4>
            <p className="text-[11px] text-slate-400">
              When live third-party social API credentials are unavailable, the platform seamlessly activates a deterministic Synthetic Sentinel engine clearly labeled as simulated research demonstration.
            </p>
          </div>
        </div>
      </div>

      {/* Technologies & Open Source Stack */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-white mb-3 font-sans uppercase tracking-wider">
          Architecture & Technology Stack
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Frontend</span>
            <p className="font-bold text-white mt-1">React 18 + Vite</p>
            <p className="text-[11px] text-teal-400 mt-0.5">Tailwind CSS + Recharts</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Geospatial</span>
            <p className="font-bold text-white mt-1">Leaflet.js</p>
            <p className="text-[11px] text-teal-400 mt-0.5">OpenStreetMap Tiles</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Backend API</span>
            <p className="font-bold text-white mt-1">REST Server</p>
            <p className="text-[11px] text-teal-400 mt-0.5">Zero Dependency Engine</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Intelligence</span>
            <p className="font-bold text-white mt-1">SentiPulse Intelligence</p>
            <p className="text-[11px] text-teal-400 mt-0.5">RAG Reasoning System</p>
          </div>
        </div>
      </div>

    </div>
  );
}
