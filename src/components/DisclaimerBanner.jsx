import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Info, Lock } from 'lucide-react';

export default function DisclaimerBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#0b1322] border-b border-amber-500/30 text-amber-200/90 text-xs px-4 py-1.5 transition-all">
      <div className="w-full px-2 sm:px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs text-amber-200/90 leading-tight">
            <strong className="font-semibold text-amber-300">Surveillance Demonstration Protocol:</strong>{' '}
            Signals and risk levels represent statistical syndromic models, not verified clinical diagnoses or official declarations.
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-mono text-amber-300 hover:text-amber-100 shrink-0 cursor-pointer"
        >
          <span>{expanded ? 'Hide Governance' : 'Governance & Privacy'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="w-full px-2 sm:px-4 mt-2 pt-2 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-[11px]">
          <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Automated PII Neutralization</p>
              <p className="text-slate-400 mt-0.5">Usernames, URLs, emails, and phone numbers are scrubbed at ingestion. No identifiable records stored.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Laboratory Corroboration Gate</p>
              <p className="text-slate-400 mt-0.5">All signals remain categorized as "Unverified Early Indicator" until cross-referenced with PCR lab data.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Non-Clinical Decision Support</p>
              <p className="text-slate-400 mt-0.5">Designed for public health epidemiologists and regional surveillance officers, never individual patient triage.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
