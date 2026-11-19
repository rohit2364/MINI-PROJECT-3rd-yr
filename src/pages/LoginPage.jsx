import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ setActivePage }) {
  const { currentUser, availableUsers, switchRole } = useAuth();
  const [successNote, setSuccessNote] = useState('');

  const handleRoleSelect = (userId) => {
    switchRole(userId);
    const selected = availableUsers.find(u => u.id === userId);
    setSuccessNote(`Authenticated as ${selected.name} (${selected.role})`);
    setTimeout(() => setSuccessNote(''), 3000);
  };

  const permissionsMatrix = [
    { feature: "View Surveillance Dashboard & Outbreak Map", officer: true, epidemiologist: true, researcher: true, public: true },
    { feature: "Access Live NLP Social Media Signal Stream", officer: true, epidemiologist: true, researcher: true, public: false },
    { feature: "Test Custom Text in NLP Classifier", officer: true, epidemiologist: true, researcher: true, public: false },
    { feature: "Run 7, 14 & 30-Day Outbreak Forecasts", officer: true, epidemiologist: true, researcher: false, public: false },
    { feature: "Adjust Anomaly Detection Z-Thresholds", officer: true, epidemiologist: true, researcher: false, public: false },
    { feature: "Acknowledge & Triage Early Warning Alerts", officer: true, epidemiologist: false, researcher: false, public: false },
    { feature: "Submit Clinical Triage Notes to Sentinel", officer: true, epidemiologist: false, researcher: false, public: false },
    { feature: "Export Surveillance Data to CSV & PDF", officer: true, epidemiologist: true, researcher: true, public: false }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#091122] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Role-Based Access Governance & Identity Portal
            </h1>
            <span className="bg-teal-500/15 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-teal-500/30 font-sans">
              RBAC Matrix
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl font-sans">
            Demonstration identity provider illustrating tiered epidemiological access for state health directors, modeling epidemiologists, academic analysts, and citizen viewers.
          </p>
        </div>
      </div>

      {successNote && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 font-sans font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Active Session Card */}
      <div className="bg-[#0b1220] rounded-xl border border-teal-500/40 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-base flex items-center justify-center shrink-0 font-sans">
              {currentUser.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-sans">
                  {currentUser.name}
                </h3>
                <span className="bg-teal-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded font-sans uppercase tracking-wider">
                  ACTIVE PERSONA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Role: <strong className="text-teal-400 font-semibold">{currentUser.role}</strong> • {currentUser.organization}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('dashboard')}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto font-sans"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-xs font-sans">
          <span className="text-slate-400 text-[10px] uppercase font-bold mr-1 tracking-wider">Authorized Capabilities:</span>
          {currentUser.permissions.map((perm, idx) => (
            <span key={idx} className="bg-slate-900 text-teal-300 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
              ✓ {perm}
            </span>
          ))}
        </div>
      </div>

      {/* Preset Role Switcher Cards */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 font-sans uppercase tracking-wider">
          <KeyRound className="w-4 h-4 text-teal-400" />
          Select Access Persona (1-Click Authentication)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {availableUsers.map((user) => {
            const isSelected = currentUser.id === user.id;

            return (
              <div
                key={user.id}
                onClick={() => handleRoleSelect(user.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-500/10 border-teal-500/50 ring-1 ring-teal-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-bold text-white flex items-center justify-center text-xs shrink-0 font-sans">
                        {user.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white font-sans">
                          {user.name}
                        </h4>
                        <p className="text-[11px] text-teal-400 font-sans font-medium">
                          {user.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-sans font-semibold border border-slate-700">
                      {user.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 font-sans">
                    {user.organization}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-300 font-sans">
                    {user.permissions.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-sans">
                  <span className={`font-semibold ${isSelected ? 'text-teal-400' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Authenticated Role' : 'Click to Switch Persona'}
                  </span>
                  <button className="text-[11px] font-bold text-teal-400 hover:underline cursor-pointer">
                    Select Role →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-white mb-1 font-sans uppercase tracking-wider">
          Enterprise Public Health Access Control Matrix
        </h3>
        <p className="text-xs text-slate-400 mb-4 font-sans">
          Architectural separation between state health directors, modeling epidemiologists, and public observers.
        </p>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-sans font-semibold">
              <tr>
                <th className="py-2.5 px-3">Surveillance Capability / Feature</th>
                <th className="py-2.5 px-2 text-center">Officer</th>
                <th className="py-2.5 px-2 text-center">Epidemiologist</th>
                <th className="py-2.5 px-2 text-center">Researcher</th>
                <th className="py-2.5 px-2 text-center">Public</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60">
                  <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">
                    {row.feature}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.officer ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.epidemiologist ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.researcher ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.public ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
