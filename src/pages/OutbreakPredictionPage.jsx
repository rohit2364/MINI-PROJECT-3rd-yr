import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  AlertTriangle,
  Brain,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import OutbreakRiskBadge from '../components/OutbreakRiskBadge';
import { useSurveillance } from '../context/SurveillanceContext';
import { generateForecast, calculateRiskScore } from '../services/clientPrediction';

export default function OutbreakPredictionPage() {
  const { regions, selectedRegionId, setSelectedRegionId, timeSeries } = useSurveillance();

  const [forecastHorizon, setForecastHorizon] = useState(14); // 7, 14, 30 days
  const [modelType, setModelType] = useState('damped_smoothing');
  const [simulatedGrowthSlider, setSimulatedGrowthSlider] = useState(48); // % weekly growth slider for simulation

  // Active region selection
  const currentRegion = regions.find((r) => r.id === selectedRegionId) || regions[0];

  // Calculate live risk breakdown and forecast data
  const riskAnalysis = useMemo(() => {
    return calculateRiskScore({
      currentVolume: currentRegion.active_signals * (1 + simulatedGrowthSlider / 100),
      baselineMean: currentRegion.baseline_signals,
      zScore: currentRegion.anomaly_z + (simulatedGrowthSlider - 48) / 30,
      growthRatePct: simulatedGrowthSlider,
      syndromicSeverity: 2.4
    });
  }, [currentRegion, simulatedGrowthSlider]);

  const forecastData = useMemo(() => {
    return generateForecast(timeSeries, forecastHorizon);
  }, [timeSeries, forecastHorizon]);

  return (
    <div className="space-y-6 pb-12 min-w-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Epidemic Outbreak Prediction & Trajectory Engine
            </h1>
            <OutbreakRiskBadge tier={riskAnalysis.tier} score={riskAnalysis.score} size="md" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-sans leading-relaxed">
            Statistical anomaly detection & time-series forecasting. Integrates social discussion velocity with historical seasonal baselines to compute probabilistic outbreak indicators.
          </p>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-2 text-xs font-sans">
          <label className="text-slate-400 font-medium">Target Node:</label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="rounded-lg border border-slate-800 bg-[#070b14] px-3 py-1.5 text-xs text-slate-200 font-sans outline-none focus:border-teal-500 cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.risk_tier})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Forecast Horizons & Chart */}
      <div className="bg-[#0b1220]/90 rounded-xl border border-slate-800/80 p-5 shadow-xs min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-800/80 pb-3.5">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2 font-sans">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Multi-Horizon Forecast Trajectory: {forecastHorizon}-Day Ahead Curve
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Projected signal volume with 80% (inner band) and 95% (outer band) Poisson confidence cones.
            </p>
          </div>

          {/* Horizon Toggle */}
          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="text-slate-400">Horizon:</span>
            <div className="flex items-center bg-[#070b14] border border-slate-800 p-0.5 rounded-lg">
              {[7, 14, 30].map((h) => (
                <button
                  key={h}
                  onClick={() => setForecastHorizon(h)}
                  className={`px-3 py-1 rounded-md transition cursor-pointer font-medium text-xs ${
                    forecastHorizon === h
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {h} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Forecast Visualization */}
        <div className="h-80 sm:h-96 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="cone95" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="cone80" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter, sans-serif' }} tickLine={false} stroke="#334155" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }} tickLine={false} stroke="#334155" domain={['auto', 'auto']} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontFamily: 'Inter, sans-serif' }} />

              {/* 95% Confidence Interval Upper/Lower */}
              <Area
                type="monotone"
                dataKey="upper_95"
                name="95% Upper Bound"
                stroke="none"
                fill="url(#cone95)"
              />
              <Area
                type="monotone"
                dataKey="lower_95"
                name="95% Lower Bound"
                stroke="none"
                fill="#0b1220"
              />

              {/* 80% Confidence Interval */}
              <Area
                type="monotone"
                dataKey="upper_80"
                name="80% Uncertainty Band"
                stroke="#14b8a6"
                strokeDasharray="3 3"
                strokeWidth={1}
                fill="url(#cone80)"
              />
              <Area
                type="monotone"
                dataKey="lower_80"
                name="80% Lower Bound"
                stroke="#14b8a6"
                strokeDasharray="3 3"
                strokeWidth={1}
                fill="#0b1220"
              />

              {/* Central Projected Signals Line */}
              <Line
                type="monotone"
                dataKey="projected_signals"
                name="Expected Forecast (Mean)"
                stroke="#14b8a6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#14b8a6' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 font-sans">
          <span>* Model uses Damped Exponential Smoothing with Poisson dispersion for confidence band expansion over horizon t.</span>
          <span className="text-teal-400 font-mono text-[11px]">
            Dampening factor: φ = 0.88 | Variance σ = 45.0
          </span>
        </div>
      </div>

      {/* Two Column Section: Risk Factors & Scenario Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">
        
        {/* Contributing Risk Factors Breakdown */}
        <div className="bg-[#0b1220]/90 rounded-xl border border-slate-800/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-sans">
                <Brain className="w-4 h-4 text-teal-400" />
                Contributing Outbreak Risk Factors
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Logistic weighting breakdown producing the {riskAnalysis.score}% risk index.
              </p>
            </div>
            <OutbreakRiskBadge tier={riskAnalysis.tier} score={riskAnalysis.score} size="sm" />
          </div>

          <div className="space-y-2.5">
            {riskAnalysis.factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-800/80 bg-[#070b14]/70 text-xs flex flex-col justify-between font-sans"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-white">
                    {factor.name}
                  </span>
                  <span className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-teal-400 font-semibold">
                    Weight: {factor.weight}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-slate-300">
                    Observed: <strong className="font-mono text-white">{factor.val}</strong>
                  </span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    factor.severity === 'Severe' || factor.severity === 'High'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                      : factor.severity === 'Elevated' || factor.severity === 'Moderate'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {factor.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-sans">
            <span>Mathematical activation: <code className="font-mono text-teal-300 text-[11px]">P(outbreak) = σ(0.38·Z + 0.28·V + 0.22·S + 0.12·R)</code></span>
          </div>
        </div>

        {/* Dynamic Scenario Simulator */}
        <div className="bg-[#0b1220]/90 rounded-xl border border-slate-800/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-sans">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  What-If Syndromic Velocity Simulator
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Simulate discussion volume spikes to evaluate potential public health alert escalation.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800/80">
                <div className="flex justify-between text-xs font-sans mb-2">
                  <span className="text-slate-300">Simulated Weekly Discussion Velocity:</span>
                  <span className="font-bold text-teal-400 text-sm font-mono">+{simulatedGrowthSlider}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={simulatedGrowthSlider}
                  onChange={(e) => setSimulatedGrowthSlider(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 font-sans mt-1">
                  <span>0% (Baseline)</span>
                  <span>+50% (Surge)</span>
                  <span>+150% (Extreme Outbreak)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Projected Social Mentions:</span>
                  <span className="text-white font-bold font-mono">
                    {Math.round(currentRegion.active_signals * (1 + simulatedGrowthSlider / 100)).toLocaleString()} posts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Simulated Z-Score Anomaly:</span>
                  <span className="text-rose-400 font-bold font-mono">
                    +{(currentRegion.anomaly_z + (simulatedGrowthSlider - 48) / 30).toFixed(2)}σ
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Resulting Outbreak Probability:</span>
                  <span className="text-teal-400 font-bold text-sm font-mono">
                    {riskAnalysis.score}% ({riskAnalysis.tier} Risk Tier)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Sensitivity simulation enables health ministries to test contingency response triggers before real-world hospital admission surges materialize.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
