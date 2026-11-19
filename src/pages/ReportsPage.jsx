import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { useSurveillance } from '../context/SurveillanceContext';
import { exportRegionsCSV } from '../services/clientPrediction';
import OutbreakRiskBadge from '../components/OutbreakRiskBadge';

export default function ReportsPage() {
  const { regions, alerts, timeSeries, lastUpdated } = useSurveillance();
  const [reportCadence, setReportCadence] = useState('weekly');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportRegionsCSV(regions);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Export Actions (Hidden during print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#091122] border border-slate-800 rounded-xl p-4 sm:p-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Surveillance Intelligence Reports & Export Center
            </h1>
            <span className="bg-teal-500/15 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-teal-500/30 font-sans">
              Export Center
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl font-sans">
            Generate formal syndromic intelligence reports, export structured datasets to CSV, or print an executive summary suitable for municipal health authorities.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto font-sans text-xs">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500 text-slate-200 font-semibold shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span>Download CSV Dataset</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Cadence Selector Tabs (Hidden during print) */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-3.5 shadow-xs flex items-center justify-between no-print text-xs font-sans">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-medium">Reporting Cadence:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            {['daily', 'weekly', 'monthly'].map((cadence) => (
              <button
                key={cadence}
                onClick={() => setReportCadence(cadence)}
                className={`px-3 py-1 rounded capitalize font-medium transition cursor-pointer ${
                  reportCadence === cadence
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cadence}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-400 text-[11px] font-sans">
          Window: {reportCadence === 'daily' ? 'Past 24 Hours' : reportCadence === 'weekly' ? 'Past 7 Days (Standard)' : 'Past 30 Days (Rolling)'}
        </span>
      </div>

      {/* Formal Printable Document Card */}
      <div className="bg-[#0b1220] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xs card text-slate-200">
        
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-teal-400">
                  SentiPulse Surveillance Intelligence Report
                </span>
                <span className="bg-slate-900 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded text-slate-400">
                  CONF-2026-SP89
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mt-1 font-sans">
                Executive Public Health Syndromic Summary
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Generated: {new Date().toLocaleDateString()} at {lastUpdated} • Mode: Simulated Research Surveillance
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Threat Level</span>
              <div className="mt-1">
                <OutbreakRiskBadge tier="High" score={76.4} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Executive Overview Narrative */}
        <div className="space-y-3 mb-6 text-xs text-slate-300 leading-relaxed font-sans">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-teal-400">
            1. Epidemiological Assessment & Executive Summary
          </h3>
          <p>
            Over the current surveillance window, automated natural language processing pipelines analyzed approximately <strong>438,920 public health discussions</strong> across indexed social media channels and regional health boards. Statistical anomaly detection flagged <strong>34 anomalous discussion clusters (Z &ge; 2.0σ)</strong> exceeding expected seasonal baselines.
          </p>
          <p>
            The primary syndromic surge is concentrated in <strong>Respiratory Illness mentions (42.5%)</strong> with notable regional epicenters in the New York Metropolitan area (Z = +3.42σ) and Greater London (Z = +2.54σ). Additionally, a sustained high-intensity vector-borne symptom spike (Dengue Serotypes 1/2) is corroborated in São Paulo, Brazil.
          </p>
        </div>

        {/* Region-wise Risk Summaries Table */}
        <div className="mb-6">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-teal-400 mb-3">
            2. Regional Syndromic Risk Stratification Matrix
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-sans font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Node</th>
                  <th className="py-2.5 px-3">Syndrome</th>
                  <th className="py-2.5 px-3 text-right">Social Signals</th>
                  <th className="py-2.5 px-3 text-right">Seasonal Base</th>
                  <th className="py-2.5 px-3 text-right">Z-Score</th>
                  <th className="py-2.5 px-3 text-center">Threat Tier</th>
                  <th className="py-2.5 px-3 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {regions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/60 font-sans">
                    <td className="py-2.5 px-3 font-semibold text-white">{r.name}</td>
                    <td className="py-2.5 px-3 text-teal-300 font-medium">{r.active_disease}</td>
                    <td className="py-2.5 px-3 text-right text-white font-bold font-mono">{r.active_signals.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-mono">{r.baseline_signals.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-red-400 font-bold font-mono">+{r.anomaly_z}σ</td>
                    <td className="py-2.5 px-3 text-center">
                      <OutbreakRiskBadge tier={r.risk_tier} score={r.risk_score} showScore={false} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white font-mono">{r.risk_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Disclaimer */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 font-sans">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Non-clinical decision support prototype. All alerts must undergo secondary epidemiological review and laboratory corroboration.</span>
        </div>

      </div>

    </div>
  );
}
