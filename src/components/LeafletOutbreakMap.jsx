import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import OutbreakRiskBadge from './OutbreakRiskBadge';
import { ExternalLink, AlertTriangle, Users, TrendingUp, ShieldCheck } from 'lucide-react';

export default function LeafletOutbreakMap({
  regions = [],
  selectedDisease = 'all',
  selectedRisk = 'all',
  onSelectRegion,
  height = '500px'
}) {
  const [activePopupRegion, setActivePopupRegion] = useState(null);

  // Filter regions based on active disease and risk tier
  const filteredRegions = regions.filter((r) => {
    if (selectedRisk !== 'all' && r.risk_tier.toLowerCase() !== selectedRisk.toLowerCase()) {
      return false;
    }
    if (selectedDisease !== 'all' && !r.active_disease.toLowerCase().includes(selectedDisease.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getRiskColor = (tier) => {
    switch ((tier || '').toLowerCase()) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'moderate':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const getRadius = (signals) => {
    if (signals > 2000) return 26;
    if (signals > 1000) return 20;
    if (signals > 500) return 15;
    return 11;
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-navy-800 shadow-sm" style={{ height }}>
      <MapContainer
        center={[25.0, 5.0]}
        zoom={2.2}
        minZoom={2}
        maxZoom={10}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredRegions.map((region) => {
          const color = getRiskColor(region.risk_tier);
          const radius = getRadius(region.active_signals);

          return (
            <CircleMarker
              key={region.id}
              center={region.coordinates}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: 2
              }}
              eventHandlers={{
                click: () => {
                  setActivePopupRegion(region);
                  if (onSelectRegion) onSelectRegion(region);
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-xs p-1 text-slate-900 font-sans">
                  <strong>{region.name}</strong>
                  <br />
                  <span>Risk: <span style={{ color, fontWeight: 'bold' }}>{region.risk_tier}</span> ({region.risk_score}%)</span>
                  <br />
                  <span className="text-slate-500">Signals: {region.active_signals} (Z={region.anomaly_z}σ)</span>
                </div>
              </Tooltip>

              <Popup>
                <div className="p-1 max-w-xs font-sans text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-navy-700 pb-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {region.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Sentinel: {region.primary_sentinel}
                      </p>
                    </div>
                    <OutbreakRiskBadge tier={region.risk_tier} score={region.risk_score} size="sm" />
                  </div>

                  {/* Signal vs Confirmed Comparison */}
                  <div className="space-y-1.5 my-2">
                    <div className="flex justify-between items-center text-[11px] bg-slate-50 dark:bg-navy-800 p-1.5 rounded">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-teal-500" /> Social Discussion Signals:
                      </span>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                        {region.active_signals.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] bg-slate-50 dark:bg-navy-800 p-1.5 rounded">
                      <span className="text-slate-600 dark:text-slate-300">Expected Seasonal Baseline:</span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {region.baseline_signals.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] bg-slate-50 dark:bg-navy-800 p-1.5 rounded">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-sky-500" /> Confirmed Clinic Cases (7d):
                      </span>
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                        {region.confirmed_cases_7d.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Disease & Symptom cluster */}
                  <div className="text-[11px] border-t border-slate-200 dark:border-navy-700 pt-2 mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Active Cluster:</span>{' '}
                      {region.active_disease}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Leading Symptom:</span>{' '}
                      {region.top_symptom}
                    </div>
                  </div>

                  {/* Disclaimer notice */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-navy-700/60 text-[9px] text-amber-700 dark:text-amber-400 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>Unconfirmed social media signal. Requires clinical diagnostic corroboration.</span>
                  </div>

                  {onSelectRegion && (
                    <button
                      onClick={() => onSelectRegion(region)}
                      className="mt-2 w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                    >
                      <span>Deep Regional Inspection</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-navy-900/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-navy-800 shadow-md text-xs pointer-events-auto">
        <p className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1 text-[11px] uppercase tracking-wider">
          Risk Threshold Index
        </p>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-slate-700 dark:text-slate-300">Critical (&gt;80% | Z &ge; 3.0σ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-slate-700 dark:text-slate-300">High (60-79% | Z &ge; 2.0σ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-700 dark:text-slate-300">Moderate (35-59% | Z &ge; 1.0σ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-700 dark:text-slate-300">Low / Baseline (&lt;35%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
