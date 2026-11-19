import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  ShieldCheck,
  Cpu,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Radio,
  FileCode,
  Tag
} from 'lucide-react';
import { useSurveillance } from '../context/SurveillanceContext';
import { SYMPTOM_TAXONOMY_INFO } from '../data/mockData';

export default function SocialMediaInsightsPage() {
  const { posts, analyzePost, regions } = useSurveillance();

  const [inputText, setInputText] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US-NY');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [persistToFeed, setPersistToFeed] = useState(true);

  // Pre-filled sample texts to test NLP features
  const samplePrompts = [
    { label: "Acute ILI Spike", text: "Woke up with severe chills and 103 fever along with an agonizing dry cough in Queens. Urgent care line was around the block!" },
    { label: "Negation Handling", text: "Tested negative for flu and had no fever, but suffering from mild sore throat and runny nose." },
    { label: "Slang / Noise Filter", text: "Caught extreme disco fever at the club last night! Best DJ ever @dancemusic http://tickets.live" },
    { label: "Pediatric GI Cluster", text: "Preschool director confirmed 9 children home with acute vomiting and diarrhea. Norovirus outbreak suspected." }
  ];

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzePost(inputText, persistToFeed, selectedRegion);
      setAnalysisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filtered posts stream
  const filteredPosts = posts.filter((p) => {
    if (filterCategory !== 'all' && p.symptom_category !== filterCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.raw_text.toLowerCase().includes(q) ||
        p.anonymized_text.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="bg-[#091122] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Social Media Natural Language Processing & Anonymization Engine
            </h1>
            <span className="bg-teal-500/15 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-teal-500/30 font-sans">
              NLP Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl font-sans">
            Automated stream ingestion with zero PII retention, 4-word lookbehind negation handling, idiomatic noise filtering, and syndromic cluster mapping.
          </p>
        </div>
      </div>

      {/* Interactive NLP Test Workbench */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Live NLP Classification Workbench
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Input any raw social post to test anonymization (PII redaction), negation analysis, and syndromic weighting.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-sans font-medium text-teal-400 bg-teal-500/15 px-2.5 py-0.5 rounded border border-teal-500/30">
            Zero PII Retention
          </span>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] text-slate-400 font-sans font-medium">Quick Test Presets:</span>
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(s.text);
                setAnalysisResult(null);
              }}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-teal-500 text-slate-300 transition cursor-pointer font-sans font-medium"
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., Severe fever, chills, and productive cough across our entire office in Austin today. Doctor mentioned RSV..."
              className="w-full rounded-xl border border-slate-800 bg-[#070b14] p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:border-teal-500 outline-none transition font-sans"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span>Assign Region:</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 outline-none"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={persistToFeed}
                  onChange={(e) => setPersistToFeed(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Persist in live telemetry stream</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Classifying...' : 'Analyze with NLP'}</span>
            </button>
          </div>
        </form>

        {/* Live Analysis Output Inspection */}
        {analysisResult && (
          <div className="mt-5 pt-4 border-t border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-teal-400" />
                NLP Engine Classification Output:
              </h4>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-sans ${
                analysisResult.is_health_related
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {analysisResult.is_health_related ? 'Health-Relevant Signal' : 'Discarded / Non-Health'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs">
              
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider font-sans">Anonymized Text (Zero PII):</span>
                <p className="mt-1 font-mono text-[11px] text-slate-200 bg-slate-950 p-2.5 rounded border border-slate-800 break-words">
                  "{analysisResult.anonymized_text}"
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider font-sans">Primary Symptom Category:</span>
                <p className="mt-1 font-semibold text-white text-sm font-sans">
                  {analysisResult.category_label || analysisResult.primary_category}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {analysisResult.detected_symptoms?.map((s, idx) => (
                    <span key={idx} className="bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
                      +{s}
                    </span>
                  ))}
                  {(!analysisResult.detected_symptoms || analysisResult.detected_symptoms.length === 0) && (
                    <span className="text-slate-400 text-[11px] font-sans">No active symptoms</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between font-sans">
                  <span className="text-slate-400">Confidence Score:</span>
                  <span className="font-bold text-teal-400 font-mono">
                    {(analysisResult.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between font-sans">
                  <span className="text-slate-400">Urgency Assessment:</span>
                  <span className={`font-bold font-sans ${
                    analysisResult.urgency_level === 'Critical' ? 'text-red-400' :
                    analysisResult.urgency_level === 'High' ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {analysisResult.urgency_level}
                  </span>
                </div>
                {analysisResult.rejection_reason && (
                  <div className="mt-2 text-red-400 bg-red-500/10 p-2 rounded text-[11px] border border-red-500/25 font-sans">
                    <strong>Reason:</strong> {analysisResult.rejection_reason}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Symptom Category Taxonomies Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white font-sans uppercase tracking-wider">
          Active Syndromic Keyword Dictionaries & Clinical Weights
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SYMPTOM_TAXONOMY_INFO.map((tax) => (
            <div
              key={tax.category}
              className="bg-[#0b1220] rounded-xl border border-slate-800 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-bold text-xs text-white leading-tight">
                    {tax.category}
                  </span>
                  <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-teal-400 font-bold">
                    w={tax.severity_weight}
                  </span>
                </div>

                <div className="space-y-1 my-2">
                  {tax.subcategories.slice(0, 3).map((sub, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                <span>Associated: {tax.associated_diseases[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Signal Stream Table */}
      <div className="bg-[#0b1220] rounded-xl border border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-400" />
              Processed Social Media Signal Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live ingest stream scored and categorized by the NLP pipeline.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords..."
                className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none w-36 sm:w-48 font-sans"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-200 outline-none font-sans"
            >
              <option value="all">All Categories</option>
              <option value="Respiratory Illness">Respiratory</option>
              <option value="Febrile & Systemic">Febrile & Systemic</option>
              <option value="Gastrointestinal">Gastrointestinal</option>
              <option value="Vector-Borne / Rash">Vector-Borne</option>
              <option value="Noise / Filtered">Noise / Filtered</option>
            </select>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[10px] text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded">
                    {post.platform}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">• {post.timestamp}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Region: <span className="text-white font-bold">{post.region_id}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-300">
                    {post.symptom_category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    post.urgency === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    post.urgency === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {post.urgency}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans mb-2">
                "{post.anonymized_text}"
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-800 font-mono">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 text-[10px]">Tokens:</span>
                  {post.detected_symptoms.length > 0 ? (
                    post.detected_symptoms.map((s, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-800 text-teal-400 px-1.5 py-0.2 rounded text-[10px]">
                        +{s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-[10px]">None (Filtered noise)</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>Confidence: {(post.confidence * 100).toFixed(0)}%</span>
                  {post.is_anomaly && (
                    <span className="text-red-400 font-bold flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Anomaly Z≥2.0
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
