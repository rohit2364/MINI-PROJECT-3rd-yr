import React, { useState } from 'react';
import {
  Activity,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Filter,
  Layers,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  BarChart2,
  Globe,
  Radio,
  FileSpreadsheet,
  Search,
  Bot,
  Brain,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Compass,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import MetricCard from '../components/MetricCard';
import OutbreakRiskBadge from '../components/OutbreakRiskBadge';
import LeafletOutbreakMap from '../components/LeafletOutbreakMap';
import { useSurveillance } from '../context/SurveillanceContext';
import { SYMPTOM_TAXONOMY_INFO } from '../data/mockData';

export default function DashboardPage({ setActivePage }) {
  const {
    regions,
    posts,
    alerts,
    timeSeries,
    lastUpdated,
    refreshSurveillance,
    selectedRegionId,
    setSelectedRegionId,
    isSimulatingStream,
    setIsSimulatingStream,
    serverOnline
  } = useSurveillance();

  const [timeRange, setTimeRange] = useState('30d');
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [signalSourceFilter, setSignalSourceFilter] = useState('all');
  const [signalSymptomFilter, setSignalSymptomFilter] = useState('all');

  // Currently inspected region in the tactical panel (defaults to São Paulo or NY or first)
  const activeRegion = regions.find(r => r.id === selectedRegionId) || 
                       regions.find(r => r.risk_tier === 'Critical') || 
                       regions[0];

  // Sliced time series based on timeRange
  const displayedTimeSeries = timeRange === '7d' 
    ? timeSeries.slice(-4) 
    : timeRange === '14d' 
      ? timeSeries.slice(-7) 
      : timeSeries;

  // Filtered regions for surveillance telemetry table
  const filteredRegions = regions.filter(r => {
    const matchesFilter = regionFilter === 'all' || r.risk_tier.toLowerCase() === regionFilter.toLowerCase();
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.active_disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered live signals stream
  const filteredSignals = posts.filter(p => {
    if (signalSourceFilter !== 'all' && !p.platform.toLowerCase().includes(signalSourceFilter.toLowerCase())) return false;
    if (signalSymptomFilter !== 'all' && p.symptom_category !== signalSymptomFilter) return false;
    return true;
  });

  const criticalCount = regions.filter(r => r.risk_tier === 'Critical').length;
  const highCount = regions.filter(r => r.risk_tier === 'High').length;
  const totalActiveSignals = regions.reduce((acc, r) => acc + (r.active_signals || 0), 0);

  return (
    <div className="space-y-6 pb-12 min-w-0">
      
      {/* 1. Tactical Command Center Header Bar */}
      <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Public Health Intelligence Command Center
            </h1>
            <OutbreakRiskBadge tier="High" score={76.4} size="sm" />
            <span className="text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
              Operational Status: Nominal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-sans leading-relaxed">
            Real-time syndromic surveillance telemetry aggregating 438,000+ public discussion signals across 10 global sentinel nodes. Designed for rapid epidemiological situational awareness.
          </p>
        </div>

        {/* Global Controls & Timeframe Selector */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs font-sans">
          <div className="flex items-center bg-[#070b14] border border-slate-800 rounded-lg p-0.5">
            {['7d', '14d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md transition cursor-pointer font-medium text-xs ${
                  timeRange === range
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-mono">{lastUpdated}</span>
          </div>

          <button
            onClick={() => setActivePage('agent')}
            className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consult Sentinel AI</span>
          </button>
        </div>
      </div>

      {/* 2. Operational Overview – Six Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-0">
        
        {/* Metric 1: Total Posts Analyzed */}
        <MetricCard
          title="Total Posts Analyzed"
          value="438,920"
          trend="+14.2%"
          trendDirection="up"
          trendPositiveIsGood={true}
          comparisonPeriod="vs 30d baseline"
          subtitle="Indexed from 4 public feeds"
          icon={MessageSquare}
          accentColor="sky"
          sparklineData={[30, 42, 45, 50, 65, 80, 95]}
          isSimulated={true}
        />

        {/* Metric 2: Health-Relevant Posts */}
        <MetricCard
          title="Health-Relevant Posts"
          value="84,310"
          trend="19.2% ratio"
          trendDirection="neutral"
          trendPositiveIsGood={true}
          comparisonPeriod="80.8% noise filtered"
          subtitle="Clinical keyword extraction"
          icon={Activity}
          accentColor="teal"
          sparklineData={[20, 35, 40, 52, 60, 75, 88]}
          isSimulated={true}
        />

        {/* Metric 3: Active Syndromic Signals */}
        <MetricCard
          title="Active Syndromic Signals"
          value={totalActiveSignals.toLocaleString()}
          trend="+18.4%"
          trendDirection="up"
          trendPositiveIsGood={false}
          comparisonPeriod="weekly surge velocity"
          subtitle="34 anomalous clusters"
          icon={TrendingUp}
          accentColor="rose"
          sparklineData={[25, 30, 38, 48, 65, 82, 100]}
          isSimulated={true}
        />

        {/* Metric 4: Regions Monitored */}
        <MetricCard
          title="Regions Monitored"
          value={`${regions.length} Nodes`}
          trend="100% active"
          trendDirection="neutral"
          trendPositiveIsGood={true}
          comparisonPeriod="continuous stream"
          subtitle="Americas, EMEA, APAC hubs"
          icon={Globe}
          accentColor="emerald"
          sparklineData={[100, 100, 100, 100, 100, 100, 100]}
          isSimulated={false}
        />

        {/* Metric 5: Active Warnings */}
        <MetricCard
          title="Active Warnings"
          value={`${alerts.filter(a => a.status === 'Active' || a.status === 'New').length} Alerts`}
          trend={`${criticalCount} Critical`}
          trendDirection="up"
          trendPositiveIsGood={false}
          comparisonPeriod="awaiting triage"
          subtitle="Z ≥ 2.5σ statistical triggers"
          icon={ShieldAlert}
          accentColor="amber"
          sparklineData={[15, 25, 35, 50, 70, 85, 95]}
          isSimulated={true}
        />

        {/* Metric 6: High-Risk Regions */}
        <MetricCard
          title="High-Risk Regions"
          value={`${criticalCount + highCount} Nodes`}
          trend="7 of 10 nodes"
          trendDirection="up"
          trendPositiveIsGood={false}
          comparisonPeriod="above baseline"
          subtitle="São Paulo, NY, Mumbai"
          icon={AlertTriangle}
          accentColor="rose"
          sparklineData={[40, 50, 60, 70, 80, 85, 90]}
          isSimulated={true}
        />

      </div>

      {/* 3. Primary Command Center Workspace: Interactive Map & Tactical Regional Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-w-0">
        
        {/* Left Column (7 cols): Interactive Geographic Surveillance Map */}
        <div className="lg:col-span-7 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-sans">
                  <Compass className="w-4 h-4 text-teal-400" />
                  Geographic Intelligence Surveillance Map
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Click any regional sentinel node to load real-time tactical convergence analytics.
                </p>
              </div>
              <button
                onClick={() => setActivePage('map')}
                className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer font-sans"
              >
                <span>Full Map View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-full min-h-[430px] rounded-lg overflow-hidden border border-slate-800">
              <LeafletOutbreakMap
                regions={regions}
                height="430px"
                onSelectRegion={(reg) => {
                  setSelectedRegionId(reg.id);
                }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-sans">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical (&gt;80%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> High (60–79%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate (35–59%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low (&lt;35%)</span>
            </span>
            <span className="text-slate-500 text-[11px] font-mono">10 Nodes Monitored</span>
          </div>
        </div>

        {/* Right Column (5 cols): Tactical Regional Intelligence Panel */}
        <div className="lg:col-span-5 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between min-w-0">
          <div>
            {/* 1. Region Name and Risk Status */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded font-semibold">
                    {activeRegion.id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    [{activeRegion.coordinates ? activeRegion.coordinates.join(', ') : 'N/A'}]
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5 leading-tight font-sans">
                  {activeRegion.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Population: <span className="font-mono text-slate-300">{activeRegion.population ? (activeRegion.population / 1_000_000).toFixed(1) : '10'}M</span> • {activeRegion.primary_sentinel}
                </p>
              </div>
              <OutbreakRiskBadge tier={activeRegion.risk_tier} score={activeRegion.risk_score} size="md" />
            </div>

            {/* 2. Tactical Metrics Grid (Discussion volume, baseline divergence, anomaly score, lab corroboration) */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
                
                {/* Discussion Volume */}
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium block">Discussion Volume</span>
                  <p className="text-lg font-bold text-white font-mono mt-0.5">
                    {activeRegion.active_signals.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Base: {activeRegion.baseline_signals.toLocaleString()} mentions</p>
                </div>

                {/* Baseline Divergence */}
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium block">Baseline Divergence</span>
                  <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                    {(activeRegion.active_signals / Math.max(1, activeRegion.baseline_signals)).toFixed(2)}x
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">vs seasonal expected norm</p>
                </div>

                {/* Anomaly Score */}
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium block">Anomaly Score</span>
                  <p className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                    +{activeRegion.anomaly_z}σ
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rolling 14-day SD</p>
                </div>

                {/* Historical Trend / Trajectory */}
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium block">Historical Trend</span>
                  <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                    +{((activeRegion.active_signals / Math.max(1, activeRegion.baseline_signals) - 1) * 22).toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">7-day signal velocity</p>
                </div>

              </div>

              {/* Dominant Syndromic Signal */}
              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80 text-xs font-sans">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-xs">Dominant Syndromic Signal:</span>
                  <span className="font-semibold text-teal-300">{activeRegion.active_disease}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Primary Symptom Cluster:</span>
                  <span className="text-white font-medium">{activeRegion.top_symptom}</span>
                </div>
              </div>

              {/* AI Interpretation & Protocol */}
              <div className="p-3.5 rounded-lg bg-teal-500/5 border border-teal-500/20 text-xs text-slate-300 font-sans">
                <p className="font-semibold text-xs text-teal-300 flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  AI Epidemiological Interpretation & Protocol
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeRegion.risk_tier === 'Critical'
                    ? `Sentinel telemetry detects acute transmission acceleration in ${activeRegion.name}. Recommended protocol: Targeted diagnostic PCR sampling and triage validation with regional emergency departments.`
                    : activeRegion.risk_tier === 'High'
                    ? `Elevated discussion velocity observed across municipal social feeds in ${activeRegion.name}. Recommended protocol: Survey regional wastewater genomics and cross-reference laboratory positivity.`
                    : `Background surveillance remains within expected seasonal moving variance. Standard continuous 10-minute cadence active.`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Dispatch Action Buttons */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center gap-2.5 font-sans">
            <button
              onClick={() => setActivePage('agent')}
              className="flex-1 py-2 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Query Sentinel AI About {activeRegion.name.split(',')[0]}</span>
            </button>
            <button
              onClick={() => setActivePage('predictions')}
              className="py-2 px-3.5 rounded-lg bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              title="View multi-horizon trajectory forecast"
            >
              <span>Forecast</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Temporal Syndromic Signal Volume vs Baseline Chart */}
      <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight font-sans">
                Temporal Syndromic Discussion Volume vs. 30-Day Seasonal Baseline
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Dual-axis temporal comparison showing daily social mentions against expected moving baseline (mean μ) and 7-day confirmed clinical laboratory cases.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-sans">
            <span className="flex items-center gap-1.5 text-teal-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-xs bg-teal-500" /> Social Mentions
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-0.5 bg-slate-400 border-dashed" /> Expected Baseline
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500" /> Confirmed Cases (7d)
            </span>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayedTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="socialSignalsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="confirmedCasesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter, sans-serif' }} 
                tickLine={false} 
                stroke="#334155" 
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }} 
                tickLine={false} 
                stroke="#334155" 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 11, fill: '#06b6d4', fontFamily: 'monospace' }} 
                tickLine={false} 
                stroke="#334155" 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b1220',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="social_signals"
                name="Social Mentions"
                stroke="#14b8a6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#socialSignalsGrad)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="baseline"
                name="Seasonal Baseline"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="confirmed_cases"
                name="Confirmed Cases (7d)"
                stroke="#06b6d4"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#confirmedCasesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 font-sans">
          <span>* Shaded teal region indicates social discussion acceleration preceding formal PCR laboratory confirmation waves by 7 to 10 days.</span>
          <button
            onClick={() => setActivePage('predictions')}
            className="text-teal-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Inspect 7, 14 & 30-Day Trajectory Forecasts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. Two-Column Operational Section: Symptom Taxonomy Breakdown & Live AI Epidemiologist Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        
        {/* Left Column (5 cols): Symptom Taxonomy Breakdown with ICD-10 Alignment */}
        <div className="lg:col-span-5 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-sans">
                  <BarChart2 className="w-4 h-4 text-teal-400" />
                  Symptom Taxonomy Breakdown (ICD-10)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Weighted syndromic classification
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#070b14] border border-slate-800 text-teal-400">
                11,343 mentions
              </span>
            </div>

            <div className="space-y-3.5">
              {SYMPTOM_TAXONOMY_INFO.map((sym) => (
                <div key={sym.category} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-sans">
                    <span className="font-medium text-slate-200">
                      {sym.category}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-teal-400 font-bold">
                        {sym.count.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-[11px]">({sym.percentage}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#070b14] h-1.5 rounded-full overflow-hidden border border-slate-800/60">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${sym.percentage * 2.2}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-sans">
                    <span className="truncate max-w-[65%]">{sym.subcategories.slice(0, 2).join(', ')}</span>
                    <span className={sym.trend.startsWith('+') ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                      {sym.trend} weekly
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800/80 font-sans">
            <button
              onClick={() => setActivePage('social-insights')}
              className="w-full py-2 bg-[#070b14] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-800"
            >
              <span>Test NLP Anonymization & Negation Engine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): AI Epidemiologist – Structured Intelligence Briefing Card */}
        <div className="lg:col-span-7 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-sans">
                    Sentinel AI — Daily Epidemiological Intelligence Briefing
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Automated analytical synthesis across all 10 sentinel telemetry nodes
                  </p>
                </div>
              </div>

              <span className="bg-teal-500/10 text-teal-300 text-xs font-sans font-medium px-2.5 py-0.5 rounded-full border border-teal-500/20">
                RAG Engine Online
              </span>
            </div>

            {/* 4 Structured Intelligence Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
              
              {/* Section 1: Regional Intelligence */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-teal-400 font-semibold uppercase tracking-wider block">
                  1. Regional Intelligence
                </span>
                <p className="text-white font-semibold text-xs">
                  São Paulo & New York Epicenters
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  São Paulo shows extreme vector-borne surge (2,340 mentions vs 720 base, Z = +3.65σ). New York reflects severe ILI acceleration (Z = +3.42σ).
                </p>
              </div>

              {/* Section 2: AI Findings */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider block">
                  2. Observed Findings
                </span>
                <p className="text-white font-semibold text-xs">
                  Multi-Symptom Co-occurrence
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  High co-occurrence of "high fever" and "dry cough" in Manhattan student discussions; acute gastrointestinal clusters detected in Central Texas.
                </p>
              </div>

              {/* Section 3: Risk Assessment */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block">
                  3. Risk Assessment
                </span>
                <p className="text-white font-semibold text-xs">
                  Threat Level: Elevated (76.4%)
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Model confidence 92%. Supporting evidence: 3.38x baseline volume divergence across respiratory and febrile illness clusters.
                </p>
              </div>

              {/* Section 4: Recommended Investigation */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider block">
                  4. Recommended Actions
                </span>
                <p className="text-white font-semibold text-xs">
                  PCR Testing & Triage Review
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Deploy targeted PCR sampling in São Paulo and query regional emergency room chief complaints in New York and Greater London trusts.
                </p>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between font-sans">
            <span className="text-xs text-slate-400">
              * Distinguishes model estimates from confirmed PCR tests.
            </span>
            <button
              onClick={() => setActivePage('agent')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Dedicated AI Intelligence Workspace</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 6. Regional Syndromic Telemetry & Anomaly Table */}
      <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2 font-sans">
              <Globe className="w-4 h-4 text-teal-400" />
              Regional Syndromic Surveillance Telemetry & Anomaly Rankings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Evaluating 10 global sentinel nodes against rolling baseline means and standard deviation multipliers.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2 font-sans">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search node or syndrome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#070b14] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 w-44 sm:w-56 font-sans"
              />
            </div>

            <div className="flex items-center bg-[#070b14] border border-slate-800 rounded-lg p-0.5 text-xs">
              {['all', 'critical', 'high', 'moderate'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setRegionFilter(tier)}
                  className={`px-2.5 py-1 rounded capitalize transition cursor-pointer font-medium ${
                    regionFilter === tier
                      ? 'bg-teal-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-[#070b14]">
                <th className="py-3 px-3.5">Node / Region</th>
                <th className="py-3 px-3">Dominant Condition</th>
                <th className="py-3 px-3">Primary Symptom</th>
                <th className="py-3 px-3 text-right">Discussion Vol.</th>
                <th className="py-3 px-3 text-right">Baseline Ratio</th>
                <th className="py-3 px-3 text-right">Z-Score</th>
                <th className="py-3 px-3 text-center">Risk Tier</th>
                <th className="py-3 px-3 text-right">Risk Score</th>
                <th className="py-3 px-3.5 text-center">Tactical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRegions.map((r) => {
                const divergence = (r.active_signals / Math.max(1, r.baseline_signals)).toFixed(2);
                const isSelected = r.id === activeRegion.id;

                return (
                  <tr 
                    key={r.id} 
                    className={`transition cursor-pointer ${
                      isSelected ? 'bg-teal-500/10' : 'hover:bg-slate-900/60'
                    }`}
                    onClick={() => setSelectedRegionId(r.id)}
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{r.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({r.id})</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-teal-300 font-medium">
                      {r.active_disease}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {r.top_symptom}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white font-mono">
                      {r.active_signals.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-400 font-mono">
                      {divergence}x
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        r.anomaly_z >= 3.0 
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25' 
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                      }`}>
                        +{r.anomaly_z}σ
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <OutbreakRiskBadge tier={r.risk_tier} score={r.risk_score} showScore={false} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white font-mono">
                      {r.risk_score}%
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRegionId(r.id);
                          setActivePage('map');
                        }}
                        className="p-1 px-3 rounded-md bg-[#070b14] border border-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 text-xs font-medium transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Live Surveillance Signal Feed & Anomaly Ticker */}
      <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">
                Live Public Health Discussion Signal Stream
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Incoming social chatter classified, anonymized, and scored for statistical anomaly velocity.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
            {/* Source Filter */}
            <select
              value={signalSourceFilter}
              onChange={(e) => setSignalSourceFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-[#070b14] px-3 py-1.5 text-slate-200 outline-none text-xs font-sans"
            >
              <option value="all">All Sources</option>
              <option value="reddit">Reddit</option>
              <option value="bluesky">Bluesky</option>
              <option value="twitter">X / Public</option>
            </select>

            {/* Stream Controller */}
            <button
              onClick={() => setIsSimulatingStream(!isSimulatingStream)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                isSimulatingStream
                  ? 'bg-[#070b14] text-slate-300 border-slate-800 hover:border-slate-700'
                  : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
              }`}
            >
              {isSimulatingStream ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-teal-400" />}
              <span>{isSimulatingStream ? 'Pause Stream' : 'Resume Stream'}</span>
            </button>
          </div>
        </div>

        {/* Signals List */}
        <div className="space-y-2.5">
          {filteredSignals.slice(0, 5).map((post) => (
            <div
              key={post.id}
              className="p-3.5 rounded-lg border border-slate-800/80 bg-[#070b14]/80 hover:bg-[#070b14] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-sans">
                  <span className="font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded text-[11px]">
                    {post.platform}
                  </span>
                  <span className="text-slate-400">• {post.timestamp}</span>
                  <span className="text-slate-400">Node: <strong className="text-white font-mono">{post.region_id}</strong></span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans text-xs">
                  "{post.anonymized_text}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs font-sans">
                <span className="text-slate-400">{post.symptom_category}</span>
                {post.is_anomaly && (
                  <span className="bg-rose-500/15 text-rose-300 border border-rose-500/25 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Anomaly Z≥2.0
                  </span>
                )}
                <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded font-mono text-[11px]">
                  Conf: {(post.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
