import React, { useState } from 'react';
import {
  Map,
  Filter,
  Layers,
  MapPin,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Users,
  Compass,
  FileSpreadsheet,
  Bot
} from 'lucide-react';
import LeafletOutbreakMap from '../components/LeafletOutbreakMap';
import OutbreakRiskBadge from '../components/OutbreakRiskBadge';
import { useSurveillance } from '../context/SurveillanceContext';
import { exportRegionsCSV } from '../services/clientPrediction';

export default function OutbreakMapPage({ setActivePage }) {
  const { regions, selectedRegionId, setSelectedRegionId } = useSurveillance();

  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('7d');

  // Active region inspector
  const activeRegion = regions.find((r) => r.id === selectedRegionId) || regions[0];

  const handleSelectRegionFromMap = (reg) => {
    setSelectedRegionId(reg.id);
  };

  return (
    <div className="space-y-6 pb-12 min-w-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Interactive Geospatial Outbreak Surveillance Map
            </h1>
            <span className="bg-teal-500/10 text-teal-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-teal-500/20 font-sans">
              OpenStreetMap Nodes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-sans leading-relaxed">
            Multi-region geographic risk stratification synthesizing public social signals with regional seasonal baselines and laboratory corroboration.
          </p>
        </div>

        {/* Export CSV of Geo Data */}
        <button
          onClick={() => exportRegionsCSV(regions)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#070b14] border border-slate-800 hover:border-teal-500 text-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer self-start md:self-auto font-sans"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
          <span>Export Geospatial CSV</span>
        </button>
      </div>

      {/* Map Filter Control Bar */}
      <div className="bg-[#0b1220]/90 rounded-xl border border-slate-800/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-sans min-w-0">
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Disease Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-medium text-slate-300">Syndrome:</span>
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-[#070b14] px-3 py-1.5 text-slate-200 outline-none focus:border-teal-500 font-sans text-xs cursor-pointer"
            >
              <option value="all">All Syndromes</option>
              <option value="Influenza">Influenza-Like Illness (ILI)</option>
              <option value="COVID">COVID-19 Variants</option>
              <option value="Dengue">Dengue / Vector-borne</option>
              <option value="Norovirus">Norovirus / GI</option>
              <option value="RSV">RSV Respiratory</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-300">Risk Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-[#070b14] px-3 py-1.5 text-slate-200 outline-none focus:border-teal-500 font-sans text-xs cursor-pointer"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">Critical (&gt;80%)</option>
              <option value="high">High (60-79%)</option>
              <option value="moderate">Moderate (35-59%)</option>
              <option value="low">Low (&lt;35%)</option>
            </select>
          </div>
        </div>

        {/* Date Window */}
        <div className="flex items-center gap-2 text-xs font-sans">
          <span className="text-slate-400">Horizon:</span>
          <div className="flex items-center bg-[#070b14] border border-slate-800 p-0.5 rounded-lg text-xs">
            {['24h', '7d', '30d'].map((win) => (
              <button
                key={win}
                onClick={() => setDateRangeFilter(win)}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  dateRangeFilter === win
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {win}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Map & Regional Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-w-0">
        
        {/* Full Interactive Map Container (7 cols) */}
        <div className="lg:col-span-8 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-4 shadow-xs flex flex-col justify-between min-w-0">
          <div className="w-full min-h-[540px] rounded-lg overflow-hidden border border-slate-800">
            <LeafletOutbreakMap
              regions={regions}
              selectedDisease={diseaseFilter}
              selectedRisk={riskFilter}
              onSelectRegion={handleSelectRegionFromMap}
              height="540px"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-sans">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">10 Monitored Coordinates</span>
          </div>
        </div>

        {/* Selected Regional Deep Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-[#0b1220]/90 rounded-xl border border-slate-800/80 p-5 shadow-xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5 mb-4">
              <div>
                <span className="font-mono text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded font-semibold">
                  {activeRegion.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5 font-sans">
                  {activeRegion.name}
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {activeRegion.country} • Population: <span className="font-mono text-slate-300">{(activeRegion.population / 1_000_000).toFixed(1)}M</span>
                </p>
              </div>
              <OutbreakRiskBadge tier={activeRegion.risk_tier} score={activeRegion.risk_score} size="md" />
            </div>

            {/* Signal vs Confirmed Dual Inspection */}
            <div className="space-y-3 font-sans">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Surveillance Convergence Metrics
              </h4>

              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-2.5 text-xs">
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                    Observed Social Signals:
                  </span>
                  <span className="font-bold text-teal-400 text-sm font-mono">
                    {activeRegion.active_signals.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Expected Seasonal Baseline:</span>
                  <span className="text-slate-300 font-mono">
                    {activeRegion.baseline_signals.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Baseline Divergence:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {(activeRegion.active_signals / activeRegion.baseline_signals).toFixed(2)}x expected
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Confirmed Clinic Cases (7d):
                  </span>
                  <span className="font-bold text-cyan-400 text-sm font-mono">
                    {activeRegion.confirmed_cases_7d.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Anomaly Z-Score & Syndrome */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Anomaly Z-Score</span>
                  <p className="text-base font-bold text-rose-400 font-mono mt-0.5">
                    +{activeRegion.anomaly_z}σ
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Active Condition</span>
                  <p className="text-xs font-semibold text-white mt-1 truncate">
                    {activeRegion.active_disease}
                  </p>
                </div>
              </div>

              {/* Action Protocol Recommendation */}
              <div className="p-3.5 rounded-lg bg-teal-500/5 border border-teal-500/20 text-xs text-slate-300">
                <div className="font-semibold text-teal-300 flex items-center gap-1.5 mb-1 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Public Health Recommendation</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">
                  {activeRegion.risk_tier === 'Critical'
                    ? 'Cross-reference hospital emergency department chief complaints and notify municipal public health officer for rapid syndromic survey.'
                    : activeRegion.risk_tier === 'High'
                    ? 'Maintain elevated social listening and query regional wastewater pathogen concentrations.'
                    : 'Passive background monitoring; social mentions remain within acceptable seasonal confidence bands.'}
                </p>
              </div>

            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800/80 space-y-2 font-sans">
            <button
              onClick={() => setActivePage('predictions')}
              className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Forecast Trajectory for {activeRegion.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActivePage('agent')}
              className="w-full py-1.5 bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-teal-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Sentinel AI About {activeRegion.name}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
