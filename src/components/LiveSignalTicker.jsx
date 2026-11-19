import React, { useState } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  AlertCircle, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { useSurveillance } from '../context/SurveillanceContext';

export default function LiveSignalTicker() {
  const { posts, isSimulatingStream, setIsSimulatingStream, serverOnline } = useSurveillance();
  const [selectedPost, setSelectedPost] = useState(null);

  const latestPosts = posts.slice(0, 10);

  const getSourceBadge = (platform = "") => {
    const p = platform.toLowerCase();
    if (p.includes('reddit')) {
      return { label: 'Reddit r/health', bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
    }
    if (p.includes('bluesky') || p.includes('bsky')) {
      return { label: 'Bluesky AT', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
    }
    if (p.includes('twitter') || p.includes('x ')) {
      return { label: 'X / Public API', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
    return { label: 'Public Forum', bg: 'bg-teal-500/15 text-teal-400 border-teal-500/30' };
  };

  return (
    <div className="bg-[#090f1d] dark:bg-[#060a14] border-b border-slate-800 text-xs px-3 sm:px-6 py-2 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Stream Telemetry Status & Provenance Tag */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isSimulatingStream ? 'bg-emerald-400' : 'bg-slate-500'
              } opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isSimulatingStream ? 'bg-emerald-500' : 'bg-slate-500'
              }`} />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {isSimulatingStream ? 'STREAM ACTIVE' : 'STREAM PAUSED'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span className="text-teal-400">142 msgs/min</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400" title="Research demonstration environment using synthetic seed streams">
              [Simulated Sentinel Ingestion]
            </span>
          </div>
        </div>

        {/* Center: Horizontally Scrolling Signal Cards */}
        <div className="flex-1 overflow-hidden w-full">
          <div className="flex items-center gap-2.5 overflow-x-auto whitespace-nowrap py-0.5 no-scrollbar">
            {latestPosts.map((post, idx) => {
              const badge = getSourceBadge(post.platform);
              return (
                <div
                  key={post.id || idx}
                  onClick={() => setSelectedPost(post)}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border shadow-xs text-[11px] shrink-0 cursor-pointer transition ${
                    post.is_anomaly
                      ? 'bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/15'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                  title="Click to inspect raw signal metadata & NLP tokens"
                >
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  
                  <span className="max-w-xs md:max-w-md truncate font-medium">
                    "{post.anonymized_text}"
                  </span>

                  {post.is_anomaly && (
                    <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded text-[9px] font-bold border border-red-500/40">
                      <AlertCircle className="w-2.5 h-2.5" /> Anomaly Z≥2.5
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono">
                    {idx === 0 ? 'Just now' : `${idx * 4}s ago`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ingestion Controller */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          <button
            onClick={() => setIsSimulatingStream(!isSimulatingStream)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] font-medium transition cursor-pointer ${
              isSimulatingStream
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border-teal-500/40'
            }`}
            title={isSimulatingStream ? "Pause incoming signal simulation" : "Resume signal simulation"}
          >
            {isSimulatingStream ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>Pause Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-teal-400" />
                <span>Resume Feed</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Signal Inspection Modal if clicked */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-400" />
                <h4 className="font-bold text-white text-sm">Signal Telemetry Inspector</h4>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Anonymized Social Post</p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 mt-1 font-mono text-[11px]">
                  "{selectedPost.anonymized_text}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                  <p className="text-[10px] text-slate-400">Source Platform</p>
                  <p className="font-semibold text-white mt-0.5">{selectedPost.platform}</p>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                  <p className="text-[10px] text-slate-400">Primary Symptom</p>
                  <p className="font-semibold text-teal-400 mt-0.5">{selectedPost.symptom_category}</p>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                  <p className="text-[10px] text-slate-400">Anomaly Classification</p>
                  <p className={`font-semibold mt-0.5 ${selectedPost.is_anomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                    {selectedPost.is_anomaly ? 'Statistically Anomalous' : 'Nominal Baseline'}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                  <p className="text-[10px] text-slate-400">Verification Status</p>
                  <p className="font-semibold text-amber-400 mt-0.5">Unverified Social Signal</p>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
                <span>PII-Redacted (Zero personal identifiers retained)</span>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
