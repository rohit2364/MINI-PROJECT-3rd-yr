import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Sliders,
  Filter,
  Check,
  RotateCcw,
  ShieldCheck,
  FileText,
  HelpCircle,
  MessageSquare,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X,
  Volume2,
  Mail,
  Send,
  ArrowUpRight,
  Activity,
  Sparkles,
  SlidersHorizontal,
  History
} from 'lucide-react';
import OutbreakRiskBadge from '../components/OutbreakRiskBadge';
import { useSurveillance } from '../context/SurveillanceContext';
import { useAuth } from '../context/AuthContext';

export default function AlertsPage() {
  const { alerts, updateAlertStatus, sensitivityThreshold, setSensitivityThreshold, regions } = useSurveillance();
  const { currentUser } = useAuth();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Drawer / modal states
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Notification configuration options state
  const [notificationConfig, setNotificationConfig] = useState({
    emailAlerts: true,
    webhookDispatch: false,
    soundBeacon: true,
    autoEscalateCritical: true,
    dispatchEmail: 'epidemic-desk@health.internal'
  });

  // Local audit trail log
  const [auditLog, setAuditLog] = useState([
    {
      id: "LOG-901",
      timestamp: "10 minutes ago",
      officer: "Dr. Aris Thorne (Chief Epidemiologist)",
      alert_id: "ALT-2026-002",
      action: "Status Transition",
      details: "Set to 'Under Investigation' — requested serology corroboration from São Paulo clinic."
    },
    {
      id: "LOG-902",
      timestamp: "2 hours ago",
      officer: "System Auto-Trigger",
      alert_id: "ALT-2026-001",
      action: "Anomaly Threshold Exceeded",
      details: "Z-score +3.42σ crossed critical trigger cutoff (Z ≥ 3.0σ)."
    }
  ]);

  // Normalize alert status for filter comparison
  const normalizeStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'new';
    if (s === 'under review') return 'under investigation';
    if (s === 'acknowledged') return 'reviewed';
    return s;
  };

  // Filter alerts based on criteria
  const filteredAlerts = alerts.filter((a) => {
    // Sensitivity cutoff
    if (a.anomaly_z_score < sensitivityThreshold) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        a.id.toLowerCase().includes(q) ||
        a.region_name.toLowerCase().includes(q) ||
        a.disease.toLowerCase().includes(q) ||
        (a.symptom_cluster && a.symptom_cluster.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      const norm = normalizeStatus(a.status);
      if (norm !== statusFilter.toLowerCase()) return false;
    }

    // Risk tier filter
    if (riskFilter !== 'all' && a.risk_tier.toLowerCase() !== riskFilter.toLowerCase()) {
      return false;
    }

    // Region filter
    if (regionFilter !== 'all' && a.region_id !== regionFilter) {
      return false;
    }

    return true;
  });

  const handleTriage = async (alertId, newStatus, note = '') => {
    const noteToSave = note || reviewNoteInput;
    await updateAlertStatus(alertId, newStatus, noteToSave);

    // Append to audit trail
    const newLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      officer: `${currentUser?.name || 'Surveillance Officer'} (${currentUser?.role || 'Epidemiologist'})`,
      alert_id: alertId,
      action: `Status Update -> ${newStatus}`,
      details: noteToSave || `Alert marked as ${newStatus} with operational verification checklist.`
    };
    setAuditLog(prev => [newLogEntry, ...prev.slice(0, 19)]);

    setActionSuccessMsg(`Alert ${alertId} updated to: ${newStatus}`);
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert(prev => ({
        ...prev,
        status: newStatus,
        review_notes: noteToSave || prev.review_notes
      }));
    }
    setReviewNoteInput('');
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Metric counts
  const totalCount = alerts.length;
  const criticalCount = alerts.filter(a => a.risk_tier === 'Critical').length;
  const activeCount = alerts.filter(a => normalizeStatus(a.status) === 'new' || a.status === 'Active').length;
  const underReviewCount = alerts.filter(a => normalizeStatus(a.status) === 'under investigation' || a.status === 'Under Review').length;
  const reviewedCount = alerts.filter(a => normalizeStatus(a.status) === 'reviewed' || a.status === 'Acknowledged').length;

  return (
    <div className="space-y-6 pb-12 min-w-0">
      
      {/* Header and Operational Notice */}
      <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                Early Warning & Alert Management Center
              </h1>
              <span className="bg-rose-500/10 text-rose-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-rose-500/20 font-sans">
                Triage Console
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-sans leading-relaxed">
              Automated syndromic anomaly triggers flagged by rolling Z-score statistical models. All alerts remain internal demonstration signals and do not initiate emergency dispatch without laboratory corroboration.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-sans text-xs">
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#070b14] border border-slate-800 hover:border-teal-500 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
              <span>Configure Notifications</span>
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="mt-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 font-sans font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Operational Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 font-sans min-w-0">
        <div className="p-4 rounded-xl bg-[#0b1220]/90 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium block">Total Signals</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">{totalCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5">All surveillance hubs</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0b1220]/90 border border-rose-500/30 bg-rose-500/5 flex flex-col justify-between">
          <span className="text-xs text-rose-300 font-medium block">Critical Threats</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">{criticalCount}</span>
          <span className="text-[11px] text-rose-400/80 mt-0.5">Z ≥ 3.0σ Anomaly</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0b1220]/90 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-xs text-amber-300 font-medium block">New / Unreviewed</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">{activeCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Awaiting initial triage</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0b1220]/90 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-xs text-sky-300 font-medium block">Under Investigation</span>
          <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">{underReviewCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Clinical cross-check</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0b1220]/90 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-xs text-emerald-300 font-medium block">Reviewed / Closed</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">{reviewedCount}</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Advisory handled</span>
        </div>
      </div>

      {/* Structured Filter & Control Toolbar */}
      <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-4 shadow-xs space-y-3.5 min-w-0 font-sans">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, region, disease or symptom..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#070b14] border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500 font-sans"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[#070b14] border border-slate-800 text-xs text-slate-200 outline-none focus:border-teal-500 font-sans cursor-pointer"
            >
              <option value="all">Status: All Statuses</option>
              <option value="new">Status: New / Active</option>
              <option value="under investigation">Status: Under Investigation</option>
              <option value="reviewed">Status: Reviewed</option>
              <option value="resolved">Status: Resolved</option>
              <option value="dismissed">Status: Dismissed</option>
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div className="md:col-span-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[#070b14] border border-slate-800 text-xs text-slate-200 outline-none focus:border-teal-500 font-sans cursor-pointer"
            >
              <option value="all">Risk: All Tiers</option>
              <option value="critical">Risk: Critical</option>
              <option value="high">Risk: High</option>
              <option value="moderate">Risk: Moderate</option>
              <option value="low">Risk: Low</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="md:col-span-3">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[#070b14] border border-slate-800 text-xs text-slate-200 outline-none focus:border-teal-500 font-sans cursor-pointer"
            >
              <option value="all">Region: All Sentinel Nodes</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Anomaly Z-Score Slider & Active Counts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-sans">
          <div className="flex items-center gap-3 bg-[#070b14] px-3.5 py-1.5 rounded-lg border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-300">Cutoff Sensitivity:</span>
            <span className="font-bold text-teal-400 font-mono">Z &ge; +{sensitivityThreshold.toFixed(1)}σ</span>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.2"
              value={sensitivityThreshold}
              onChange={(e) => setSensitivityThreshold(parseFloat(e.target.value))}
              className="accent-teal-500 w-24 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>Showing <strong className="text-white font-mono">{filteredAlerts.length}</strong> of <span className="font-mono">{alerts.length}</span> early warnings</span>
            {(searchQuery || statusFilter !== 'all' || riskFilter !== 'all' || regionFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setRiskFilter('all');
                  setRegionFilter('all');
                }}
                className="text-teal-400 hover:underline cursor-pointer pl-2 border-l border-slate-800 font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Structured Enterprise Alert Table */}
      <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-xs min-w-0 font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            
            {/* Table Header */}
            <thead className="bg-[#070b14] border-b border-slate-800 text-slate-400 text-xs font-semibold">
              <tr>
                <th className="py-3 px-3.5">Alert ID</th>
                <th className="py-3 px-3">Region</th>
                <th className="py-3 px-3">Symptom Category</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Detection Time</th>
                <th className="py-3 px-3">Signal Count</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-sans">
                    No early warning alerts match the selected sensitivity and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const norm = normalizeStatus(alert.status);
                  const isSelected = selectedAlert?.id === alert.id;

                  return (
                    <tr
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={`hover:bg-slate-900/60 transition cursor-pointer ${
                        isSelected ? 'bg-teal-500/10' : ''
                      } ${alert.risk_tier === 'Critical' ? 'bg-rose-500/[0.02]' : ''}`}
                    >
                      {/* Alert ID */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded font-mono text-[11px] border border-teal-500/20">
                          {alert.id}
                        </span>
                      </td>

                      {/* Region */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-white block">{alert.region_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{alert.region_id}</span>
                      </td>

                      {/* Symptom Category */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-200 block">{alert.disease}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs block font-sans">
                          {alert.symptom_cluster}
                        </span>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <OutbreakRiskBadge tier={alert.risk_tier} score={alert.risk_score} size="xs" />
                          <span className="text-[11px] text-rose-400 font-bold font-mono">
                            +{alert.anomaly_z_score}σ
                          </span>
                        </div>
                      </td>

                      {/* Detection Time */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="text-slate-300 block">{alert.first_detected}</span>
                        <span className="text-[11px] text-slate-400">Updated: {alert.last_updated}</span>
                      </td>

                      {/* Signal Count */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono">
                        <span className="text-white font-bold block text-xs">
                          {alert.detected_velocity || "+48% spike"}
                        </span>
                        <span className="text-[11px] text-teal-400 font-sans">Multi-source</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          norm === 'new' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25' :
                          norm === 'under investigation' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' :
                          norm === 'reviewed' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/25' :
                          norm === 'resolved' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {norm === 'new' ? 'New' :
                           norm === 'under investigation' ? 'Under Investigation' :
                           norm === 'reviewed' ? 'Reviewed' :
                           norm === 'resolved' ? 'Resolved' : alert.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="px-2.5 py-1 rounded bg-[#070b14] hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-800"
                            title="Inspect alert details"
                          >
                            Inspect
                          </button>

                          {norm !== 'reviewed' && (
                            <button
                              onClick={() => handleTriage(alert.id, 'Reviewed')}
                              className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold transition cursor-pointer border border-teal-500/30"
                              title="Mark as reviewed"
                            >
                              Review
                            </button>
                          )}

                          {alert.risk_tier === 'Critical' && norm !== 'escalated' && (
                            <button
                              onClick={() => handleTriage(alert.id, 'Under Investigation', 'Escalated to High Priority Sentinel Desk')}
                              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition cursor-pointer border border-rose-500/30"
                              title="Escalate alert"
                            >
                              Escalate
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Operational Audit Trail Log */}
      <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs space-y-3.5 min-w-0 font-sans">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-sans">
              Surveillance Audit Trail & Action Log
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-sans">Session Log • Real-Time</span>
        </div>

        <div className="space-y-2">
          {auditLog.map((log) => (
            <div key={log.id} className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80 text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-teal-400 font-mono font-bold text-[11px]">{log.alert_id}</span>
                <span className="text-slate-400 font-mono text-[11px]">[{log.timestamp}]</span>
                <span className="text-white font-medium">{log.action}:</span>
                <span className="text-slate-400 text-xs">{log.details}</span>
              </div>
              <span className="text-[11px] text-slate-500 whitespace-nowrap self-end sm:self-auto font-sans">
                By: {log.officer}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ALERT DETAIL DRAWER / MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto space-y-4 font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    {selectedAlert.id}
                  </span>
                  <OutbreakRiskBadge tier={selectedAlert.risk_tier} score={selectedAlert.risk_score} size="xs" />
                  <span className="text-xs text-slate-400">
                    Status: <strong className="text-white">{selectedAlert.status}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1.5 font-sans">
                  {selectedAlert.region_name} — {selectedAlert.disease}
                </h2>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trigger Cause and Statistical Metrics */}
            <div className="p-4 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-2.5 text-xs font-sans">
              <span className="font-semibold text-white uppercase text-xs block">Trigger Etiology & Anomaly Metrics:</span>
              <p className="text-slate-300 leading-relaxed text-xs">
                {selectedAlert.trigger_explanation}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Anomaly Z:</span>
                  <span className="font-bold text-rose-400 font-mono">+{selectedAlert.anomaly_z_score}σ</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Velocity:</span>
                  <span className="font-bold text-teal-400 font-mono">{selectedAlert.detected_velocity}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">First Detected:</span>
                  <span className="text-slate-300">{selectedAlert.first_detected}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Last Update:</span>
                  <span className="text-slate-300">{selectedAlert.last_updated}</span>
                </div>
              </div>
            </div>

            {/* Recommended Protocol Checklist */}
            <div className="p-4 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-2 font-sans">
              <span className="font-semibold text-white text-xs uppercase block">
                Standard Operational Protocols:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedAlert.recommended_protocol.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Existing Review Notes */}
            {selectedAlert.review_notes && (
              <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/25 text-xs text-teal-200 font-sans">
                <strong>Officer Review Notes:</strong> {selectedAlert.review_notes}
              </div>
            )}

            {/* Add New Triage Note */}
            <div className="font-sans">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Append Epidemiological Triage Notes:
              </label>
              <textarea
                rows={3}
                value={reviewNoteInput}
                onChange={(e) => setReviewNoteInput(e.target.value)}
                placeholder="e.g. Cross-checked with municipal health lab. Verified 12% positivity rate increase. Advisory pending..."
                className="w-full rounded-lg border border-slate-800 bg-[#070b14] p-3 text-xs text-white placeholder-slate-500 focus:border-teal-500 outline-none font-sans"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTriage(selectedAlert.id, 'Under Investigation')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30 transition cursor-pointer"
                >
                  Under Investigation
                </button>
                <button
                  onClick={() => handleTriage(selectedAlert.id, 'Reviewed')}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition cursor-pointer shadow-xs"
                >
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => handleTriage(selectedAlert.id, 'Resolved')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30 transition cursor-pointer"
                >
                  Resolve
                </button>
              </div>

              <button
                onClick={() => handleTriage(selectedAlert.id, 'Dismissed')}
                className="px-3 py-1.5 rounded-lg bg-[#070b14] hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer border border-slate-800"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NOTIFICATION CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl text-slate-200 space-y-4 font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Notification & Dispatch Settings
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white p-1 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <label className="flex items-center justify-between p-3 rounded-lg bg-[#070b14] border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white block font-medium">Email Digest Alerts</span>
                  <span className="text-slate-400 text-xs">Dispatch daily syndromic anomaly digest</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationConfig.emailAlerts}
                  onChange={(e) => setNotificationConfig({ ...notificationConfig, emailAlerts: e.target.checked })}
                  className="accent-teal-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#070b14] border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white block font-medium">Simulated Webhook Dispatch</span>
                  <span className="text-slate-400 text-xs">Send JSON payloads to public health webhook</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationConfig.webhookDispatch}
                  onChange={(e) => setNotificationConfig({ ...notificationConfig, webhookDispatch: e.target.checked })}
                  className="accent-teal-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#070b14] border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white block font-medium">Audio Signal Beacon</span>
                  <span className="text-slate-400 text-xs">Chime on Critical (Z ≥ 3.0σ) alert ingestion</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationConfig.soundBeacon}
                  onChange={(e) => setNotificationConfig({ ...notificationConfig, soundBeacon: e.target.checked })}
                  className="accent-teal-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#070b14] border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white block font-medium">Auto-Escalate Critical Signals</span>
                  <span className="text-slate-400 text-xs">Place Z &ge; 3.0σ alerts into immediate triage</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationConfig.autoEscalateCritical}
                  onChange={(e) => setNotificationConfig({ ...notificationConfig, autoEscalateCritical: e.target.checked })}
                  className="accent-teal-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <div>
                <label className="block text-xs text-slate-400 uppercase font-medium mb-1">
                  Recipient Dispatch Address:
                </label>
                <input
                  type="email"
                  value={notificationConfig.dispatchEmail}
                  onChange={(e) => setNotificationConfig({ ...notificationConfig, dispatchEmail: e.target.value })}
                  className="w-full rounded-lg bg-[#070b14] border border-slate-800 px-3 py-2 text-white text-xs outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end text-xs font-sans">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition cursor-pointer shadow-xs"
              >
                Save Configuration
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
