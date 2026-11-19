import React from 'react';
import {
  Database,
  ShieldCheck,
  Lock,
  Layers,
  Clock,
  AlertTriangle,
  Server,
  ArrowRight,
  ExternalLink,
  Cpu,
  Key
} from 'lucide-react';

export default function DataSourcesPage() {
  const dataSources = [
    {
      name: "Reddit Public Health Subreddits",
      type: "Social Media Discussion Feeds",
      cadence: "10-minute polling window",
      volume: "~140,000 posts / week",
      endpoints: "r/health, r/COVID19positive, r/Flu, r/medicine, regional subreddits",
      privacy: "Public subreddit posts only. Zero private messages or user profiles scraped. Strict regex pseudonymization.",
      compliance: "Reddit Developer Terms of Service & Data API Policy"
    },
    {
      name: "Public Health Forums & Discussion Boards",
      type: "Anonymized Web Health Boards",
      cadence: "Hourly batch aggregation",
      volume: "~65,000 threads / month",
      endpoints: "Public community forums, parent health boards, open medical query boards",
      privacy: "Only explicitly public threads ingested. Author identities stripped prior to indexing.",
      compliance: "Fair-use academic and epidemiological research protocols"
    },
    {
      name: "WHO FluNet & Global Arbovirus Benchmarks",
      type: "Official Epidemiological Baselines",
      cadence: "Weekly updates",
      volume: "Global weekly lab sample positivity",
      endpoints: "World Health Organization Open Data Portal (FluNet / DengueNet)",
      privacy: "Aggregated regional case counts without personal health identifiers.",
      compliance: "Open Health Data Public License"
    },
    {
      name: "CDC ILINet Sentinel Provider Network",
      type: "Historical Outbreak Baselines",
      cadence: "Seasonal / Weekly reports",
      volume: "50-state outpatient influenza-like illness rates",
      endpoints: "CDC FluView Data Portal",
      privacy: "Statutory public health surveillance benchmarks.",
      compliance: "US Government Open Data Directive"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#091122] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Data Ingestion Sources, Provenance & Governance
            </h1>
            <span className="bg-teal-500/15 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-teal-500/30 font-sans">
              Data Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl font-sans">
            Complete transparency into data origins, multi-tier ingestion pipelines, privacy-preserving safeguards, and epidemiological limitations.
          </p>
        </div>
      </div>

      {/* Ingestion Pipeline Architecture Workflow */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3 font-sans uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-teal-400" />
          Multi-Tier Data Ingestion & Sanitization Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-sans text-teal-400 font-semibold uppercase tracking-wider">
                Stage 1: Ingestion
              </span>
              <h4 className="font-bold text-white text-xs mt-1 mb-1.5 font-sans">
                Public API Ingestion
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Queries permitted public social API endpoints using authorized OAuth credentials. Strictly filters out private messages, closed groups, and password-protected domains.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
              Frequency: 10 mins
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-sans text-teal-400 font-semibold uppercase tracking-wider">
                Stage 2: Anonymization
              </span>
              <h4 className="font-bold text-white text-xs mt-1 mb-1.5 font-sans">
                PII Stripping & Regex
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Applies automated regex pipelines to replace usernames with <code>[USER]</code>, URLs with <code>[URL]</code>, phone numbers with <code>[PHONE]</code>, and emails with <code>[EMAIL]</code>.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-teal-400 font-sans font-semibold">
              Zero PII Retained
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-sans text-teal-400 font-semibold uppercase tracking-wider">
                Stage 3: NLP Screening
              </span>
              <h4 className="font-bold text-white text-xs mt-1 mb-1.5 font-sans">
                Filtering & Negation
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Discards figurative idioms ("spring fever", "coughing up cash"). Analyzes contextual negations ("tested negative", "no fever") to prevent false positive signal spikes.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
              5 Symptom Taxonomies
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-sans text-teal-400 font-semibold uppercase tracking-wider">
                Stage 4: Baseline Synthesis
              </span>
              <h4 className="font-bold text-white text-xs mt-1 mb-1.5 font-sans">
                Rolling Z-Score Anomaly
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Computes 14-day rolling mean (μ) and standard deviation (σ). Flags statistical spikes (Z &ge; 2.0σ) and projects 7/14/30-day forecast curves.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-teal-400 font-sans font-semibold">
              Outbreak Probability %
            </div>
          </div>

        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-white mb-4 border-b border-slate-800 pb-3 font-sans uppercase tracking-wider">
          Data Provenance & Ingestion Specifications
        </h3>

        <div className="space-y-3">
          {dataSources.map((source, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-2 font-sans"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {source.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Category: {source.type} • Cadence: {source.cadence}
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-teal-500/15 border border-teal-500/30 text-teal-300 px-2 py-0.5 rounded self-start sm:self-auto">
                  {source.volume}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="font-semibold text-slate-300">Monitored Endpoints:</span>
                  <p className="text-slate-400 mt-0.5 font-mono">{source.endpoints}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-300">Privacy & Terms Compliance:</span>
                  <p className="text-slate-400 mt-0.5">{source.privacy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodological Limitations & Caveats */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3 font-sans uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Epidemiological Limitations & Data Caveats
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
            <h4 className="font-bold text-amber-300 text-xs">
              1. Correlation Is Not Causation
            </h4>
            <p className="text-[11px] text-slate-300">
              An increase in online discussion of "cough" or "fever" may reflect news media coverage, celebrity illness announcements, or seasonal curiosity rather than an actual pathogenic transmission cluster. Independent clinical laboratory testing is mandatory.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
            <h4 className="font-bold text-amber-300 text-xs">
              2. Demographic & Digital Disparities
            </h4>
            <p className="text-[11px] text-slate-300">
              Social media user populations skew younger and more urban than the overall demographic. Vulnerable elderly individuals or rural populations may be under-represented in online syndromic signal volume.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
            <h4 className="font-bold text-amber-300 text-xs">
              3. Regional Geographic Granularity
            </h4>
            <p className="text-[11px] text-slate-300">
              Social posts rarely contain GPS coordinates. Regional assignment relies on community subreddits (e.g. r/nyc, r/Austin) or self-declared metropolitan locations. Exact individual whereabouts are neither inferred nor tracked.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
            <h4 className="font-bold text-amber-300 text-xs">
              4. Demonstration & Synthetic Sentinel Mode
            </h4>
            <p className="text-[11px] text-slate-300">
              When live third-party social API credentials are unavailable, the platform runs in a deterministic Synthetic Sentinel mode using realistic synthetic discussions clearly labeled as simulated estimates.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
