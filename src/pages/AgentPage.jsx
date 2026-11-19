import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Send,
  Cpu,
  ShieldCheck,
  TrendingUp,
  MapPin,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Download,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Layers,
  Radio,
  FileText,
  Search,
  Sparkles,
  Info,
  Clock,
  Compass,
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import OutbreakRiskBadge from '../components/OutbreakRiskBadge';
import { useSurveillance } from '../context/SurveillanceContext';
import { queryAgentRemote } from '../services/api';
import { runClientAgentQuery, generateRegionDossier } from '../services/clientAgent';

export default function AgentPage({ setActivePage }) {
  const { regions = [], alerts = [], serverOnline = false } = useSurveillance();

  const [selectedRegionId, setSelectedRegionId] = useState('BR-SP');
  const [activeDossier, setActiveDossier] = useState(() => {
    try {
      return generateRegionDossier('BR-SP', regions, alerts);
    } catch (e) {
      console.error("Failed to generate initial dossier:", e);
      return null;
    }
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [dossierCopied, setDossierCopied] = useState(false);

  // Update dossier when selected region changes
  useEffect(() => {
    if (selectedRegionId) {
      try {
        const dossier = generateRegionDossier(selectedRegionId, regions, alerts);
        setActiveDossier(dossier);
      } catch (e) {
        console.error("Failed to update dossier:", e);
      }
    }
  }, [selectedRegionId, regions, alerts]);

  // Initial welcome conversation log
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: {
        agent_name: 'SentiPulse Intelligence',
        summary: 'SentiPulse Operational Epidemiological Intelligence Assistant online.',
        detailed_analysis: 
          'Connected directly to live syndromic surveillance telemetry across 10 global sentinel nodes.\n\n' +
          '• **Disease Dominance**: Dengue is currently leading threat velocity in **São Paulo, Brazil** (+3.65σ anomaly).\n' +
          '• **Secondary Respiratory Hub**: New York Metro reports 88.4% Outbreak Risk with Influenza-Like Illness (+3.42σ).\n' +
          '• **Triage Queue**: 4 unverified automated alerts awaiting laboratory corroboration.\n\n' +
          'Select any sentinel node on the left for a structured briefing or ask specific multi-variable inquiries.',
        key_metrics: [
          { label: "Tracked Sentinels", value: "10 Global Hubs" },
          { label: "Surveillance Mode", value: serverOnline ? "REST API Connected" : "Autonomous Client Engine", highlight: true },
          { label: "Confidence Floor", value: "Z ≥ 2.50σ Anomaly" },
          { label: "Update Cadence", value: "Continuous 10-Min" }
        ],
        recommendations: [
          "Cross-reference São Paulo signals with municipal Dengue serotype PCR panels.",
          "Monitor New York emergency department respiratory admissions for ILI surge."
        ],
        suggested_followups: [
          "From which area is Dengue dominating?",
          "Which regions have Critical risk level right now?",
          "Compare New York vs California outbreak indicators",
          "What symptoms are surging most rapidly this week?"
        ]
      }
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Suggested prompt chips
  const suggestedQueries = [
    "From which area is Dengue dominating?",
    "Which regions have Critical risk level right now?",
    "Compare New York vs California outbreak indicators",
    "What symptoms are surging most rapidly this week?",
    "What public health interventions are recommended for São Paulo?",
    "How is the Anomaly Z-Score and outbreak risk score calculated?",
    "What is the forecast trajectory for the next 14 to 30 days?",
    "Are there any unverified early warning alerts needing triage?"
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isThinking) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setThinkingStep('Querying 10 global sentinel telemetry nodes...');
    await new Promise(r => setTimeout(r, 350));
    setThinkingStep('Synthesizing rolling anomaly Z-scores & ICD-10 taxonomy...');
    await new Promise(r => setTimeout(r, 350));
    setThinkingStep('Compiling structured epidemiological intelligence report...');
    await new Promise(r => setTimeout(r, 300));

    try {
      let agentResponse = null;

      if (serverOnline) {
        agentResponse = await queryAgentRemote(textToSend);
      }

      if (!agentResponse) {
        agentResponse = runClientAgentQuery(textToSend, regions, alerts);
      }

      // If the response contains a regional intelligence node, also sync the left dossier
      if (agentResponse?.regional_intelligence?.node_id) {
        setSelectedRegionId(agentResponse.regional_intelligence.node_id);
        setActiveDossier(agentResponse);
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: agentResponse
        }
      ]);
    } catch (err) {
      console.error("Error executing query:", err);
      const fallback = runClientAgentQuery(textToSend, regions, alerts);
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: fallback
        }
      ]);
    } finally {
      setIsThinking(false);
      setThinkingStep('');
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyDossier = () => {
    if (!activeDossier) return;
    const dossierText = `
=== SENTIPULSE INTELLIGENCE — EPIDEMIOLOGICAL DOSSIER ===
Report: ${activeDossier.report_title || activeDossier.summary || 'Surveillance Report'}
Region: ${activeDossier.regional_intelligence?.region_name || 'Global Sentinel'}
Generated: ${new Date().toISOString()}

1. REGIONAL INTELLIGENCE
- Detected Patterns: ${activeDossier.regional_intelligence?.detected_syndromic_patterns || 'N/A'}
- Signal Frequency: ${activeDossier.regional_intelligence?.signal_frequency || 'N/A'}
- Historical Comparison: ${activeDossier.regional_intelligence?.historical_comparison || 'N/A'}

2. AI FINDINGS
- Observed Trends: ${activeDossier.ai_findings?.observed_trends || 'N/A'}
- Unusual Combinations: ${activeDossier.ai_findings?.unusual_combinations || 'N/A'}
- Emerging Clusters: ${activeDossier.ai_findings?.potential_emerging_clusters || 'N/A'}

3. RISK ASSESSMENT
- Risk Tier: ${activeDossier.risk_assessment?.risk_classification || 'N/A'} (${activeDossier.risk_assessment?.risk_score || 0}%)
- Model Confidence: ${activeDossier.risk_assessment?.model_confidence || 'N/A'}
- Supporting Evidence: ${activeDossier.risk_assessment?.supporting_evidence || 'N/A'}
- Important Limitations: ${activeDossier.risk_assessment?.important_limitations || 'N/A'}

4. RECOMMENDED INVESTIGATION
- Target Review: ${(activeDossier.recommended_investigation?.regions_requiring_review || []).join('; ')}
- Validation Signals: ${(activeDossier.recommended_investigation?.signals_needing_validation || []).join('; ')}
- Monitoring Priorities: ${(activeDossier.recommended_investigation?.suggested_monitoring_priorities || []).join('; ')}

CONFIDENTIALITY & ETHICS:
Non-clinical demonstration intelligence. Derived from public open-source signals.
    `.trim();

    navigator.clipboard.writeText(dossierText);
    setDossierCopied(true);
    setTimeout(() => setDossierCopied(false), 2000);
  };

  const handleExportTranscript = () => {
    const transcriptText = messages.map(m => {
      if (m.sender === 'user') return `[EPIDEMIOLOGIST QUERY - ${m.timestamp}]\n${m.text}\n`;
      const d = m.data || {};
      return `[SENTIPULSE INTELLIGENCE - ${m.timestamp}]\n${d.summary || ''}\n\n${d.detailed_analysis || ''}\n\nRecommendations:\n${(d.recommendations || []).join('\n')}\n`;
    }).join('\n==============================\n\n');

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentipulse_intelligence_transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 min-w-0">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                AI Epidemiologist — SentiPulse Intelligence Workspace
              </h1>
              <span className="bg-teal-500/10 text-teal-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-teal-500/20 font-sans">
                Structured Surveillance RAG
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-sans">
              AI-powered syndromic intelligence and public-health analytical assistant.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto text-xs font-sans">
          <button
            onClick={copyDossier}
            className="px-3.5 py-1.5 rounded-lg bg-[#070b14] border border-slate-800 hover:border-teal-500 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Copy structured dossier"
          >
            {dossierCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
            <span>{dossierCopied ? 'Dossier Copied' : 'Copy Dossier'}</span>
          </button>

          <button
            onClick={handleExportTranscript}
            className="px-3.5 py-1.5 rounded-lg bg-[#070b14] border border-slate-800 hover:border-teal-500 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Export conversation history"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Transcript</span>
          </button>

          <button
            onClick={() => setMessages([messages[0]])}
            className="px-2.5 py-1.5 rounded-lg bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Intelligence Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start min-w-0">
        
        {/* LEFT PANE: Structured Intelligence Dossier (7 Cols) */}
        <div className="xl:col-span-7 space-y-4 min-w-0">
          
          {/* Node Selector Bar */}
          <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-semibold text-slate-300 font-sans flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                Select Sentinel Node for Structured Dossier:
              </span>
              <span className="text-xs text-slate-400 font-sans">
                {regions.length} Active Nodes
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 font-sans">
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegionId(reg.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    selectedRegionId === reg.id
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                      : 'bg-[#070b14] hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    reg.risk_tier === 'Critical' ? 'bg-rose-400 animate-pulse' :
                    reg.risk_tier === 'High' ? 'bg-orange-400' :
                    reg.risk_tier === 'Moderate' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span>{reg.name ? reg.name.split(',')[0] : reg.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Structured Intelligence Report Card */}
          {activeDossier ? (
            <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-xs space-y-4 p-5 font-sans">
              
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                      Surveillance Dossier
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {activeDossier.regional_intelligence?.node_id || selectedRegionId}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1.5 font-sans">
                    {activeDossier.report_title || `Epidemiological Intelligence Dossier: ${activeDossier.regional_intelligence?.region_name || 'Node'}`}
                  </h2>
                </div>

                {activeDossier.risk_assessment && (
                  <div className="flex items-center gap-2">
                    <OutbreakRiskBadge 
                      tier={activeDossier.risk_assessment.risk_classification} 
                      score={activeDossier.risk_assessment.risk_score} 
                      size="md" 
                    />
                  </div>
                )}
              </div>

              {/* SECTION 1: Regional Intelligence */}
              <div className="rounded-lg bg-[#070b14]/70 border border-slate-800/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    1. Regional Intelligence
                  </h3>
                  <span className="text-xs text-slate-400 font-sans">
                    Population: <span className="font-mono text-slate-300">{activeDossier.regional_intelligence?.population_monitored || 'N/A'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="bg-[#0b1220] p-3 rounded-lg border border-slate-800/60">
                    <span className="text-[11px] text-slate-400 block font-medium">Detected Syndromic Patterns</span>
                    <p className="text-white mt-1 leading-relaxed">
                      {activeDossier.regional_intelligence?.detected_syndromic_patterns || 'No acute syndromic cluster detected.'}
                    </p>
                  </div>
                  <div className="bg-[#0b1220] p-3 rounded-lg border border-slate-800/60">
                    <span className="text-[11px] text-slate-400 block font-medium">Signal Frequency & Velocity</span>
                    <p className="text-white mt-1 leading-relaxed">
                      {activeDossier.regional_intelligence?.signal_frequency || 'Baseline monitoring active.'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0b1220] p-3 rounded-lg border border-slate-800/60 text-xs text-slate-300">
                  <span className="text-[11px] text-slate-400 block font-medium">Historical Seasonal Comparison</span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {activeDossier.regional_intelligence?.historical_comparison || 'Operating within seasonal variance limits.'}
                  </p>
                </div>
              </div>

              {/* SECTION 2: AI Findings */}
              <div className="rounded-lg bg-[#070b14]/70 border border-slate-800/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    2. AI Findings & Pattern Detection
                  </h3>
                  <span className="text-[11px] bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full font-medium">
                    Model Inference
                  </span>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Observed Transmission Trends:</strong>{' '}
                      {activeDossier.ai_findings?.observed_trends || 'No statistical anomalies flagged.'}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Unusual Symptom Combinations:</strong>{' '}
                      {activeDossier.ai_findings?.unusual_combinations || 'Standard respiratory and febrile symptoms.'}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                    <div>
                      <strong className="text-white">Potential Emerging Clusters:</strong>{' '}
                      {activeDossier.ai_findings?.potential_emerging_clusters || 'Dispersed background chatter.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Risk Assessment */}
              <div className="rounded-lg bg-[#070b14]/70 border border-slate-800/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    3. Risk Assessment & Model Confidence
                  </h3>
                  <span className="text-xs text-slate-400">
                    Classification: <strong className="text-white">{activeDossier.risk_assessment?.risk_classification || 'Moderate'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800/60">
                    <span className="text-[11px] text-slate-400 block font-medium">Model Confidence</span>
                    <span className="text-teal-400 font-bold block mt-1 font-mono">
                      {activeDossier.risk_assessment?.model_confidence || '85.0%'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b1220] border border-slate-800/60">
                    <span className="text-[11px] text-slate-400 block font-medium">Supporting Laboratory Evidence</span>
                    <span className="text-slate-200 block mt-1">
                      {activeDossier.risk_assessment?.supporting_evidence || 'No laboratory reports linked.'}
                    </span>
                  </div>
                </div>

                {/* Analytical Limitations Alert */}
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-300 block mb-0.5">Analytical Limitations:</strong>
                  {activeDossier.risk_assessment?.important_limitations || 'Simulated surveillance research prototype.'}
                </div>
              </div>

              {/* SECTION 4: Recommended Investigation */}
              <div className="rounded-lg bg-[#070b14]/70 border border-slate-800/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    4. Recommended Epidemiological Investigation
                  </h3>
                  <span className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                    Action Protocols
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block font-semibold mb-1">Regions Requiring Review:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(activeDossier.recommended_investigation?.regions_requiring_review || [selectedRegionId]).map((r, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-[#0b1220] text-slate-200 text-xs border border-slate-700/80">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block font-semibold mb-1">Signals Needing Laboratory Validation:</span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      {(activeDossier.recommended_investigation?.signals_needing_validation || ['Zero-PII social symptom tokens']).map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block font-semibold mb-1">Suggested Monitoring Priorities:</span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      {(activeDossier.recommended_investigation?.suggested_monitoring_priorities || ['Maintain regular 10-minute polling.']).map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Attribution and Ground Truth Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>Synthesized by SentiPulse Intelligence RAG Engine (Zero PII Compliance)</span>
                </span>
                {activeDossier.target_page && setActivePage && (
                  <button
                    onClick={() => setActivePage(activeDossier.target_page)}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View in {activeDossier.target_page.toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl font-sans">
              <Brain className="w-8 h-8 text-teal-400 mx-auto mb-2 animate-pulse" />
              <p className="text-xs">Generating Epidemiological Dossier...</p>
            </div>
          )}

        </div>

        {/* RIGHT PANE: Conversational Intelligence Console (5 Cols) */}
        <div className="xl:col-span-5 bg-[#0b1220]/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-xs flex flex-col h-[750px] min-w-0 font-sans">
          
          {/* Console Header */}
          <div className="p-4 border-b border-slate-800/80 bg-[#070b14] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-sans">
                Conversational Intelligence Console
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {messages.length} Queries
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg, idx) => {
              if (msg.sender === 'user') {
                return (
                  <div key={idx} className="flex justify-end animate-in fade-in">
                    <div className="max-w-[85%] bg-teal-600 text-white rounded-xl rounded-tr-xs px-3.5 py-2.5 shadow-xs text-xs font-sans">
                      <p className="font-medium text-[13px]">{msg.text}</p>
                      <span className="text-[10px] opacity-75 mt-1 block text-right font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              }

              const data = msg.data || {};
              const fullText = `${data.summary || ''}\n\n${data.detailed_analysis || ''}`;

              return (
                <div key={idx} className="flex items-start gap-2.5 animate-in fade-in">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 bg-[#070b14] border border-slate-800/80 rounded-xl rounded-tl-xs p-4 shadow-2xs space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {data.agent_name || 'SentiPulse Intelligence'}
                        </span>
                        <span className="text-[10px] text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 font-medium">
                          RAG Response
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(fullText, idx)}
                        className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
                        title="Copy text"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="text-teal-200 text-xs font-medium leading-relaxed bg-teal-950/40 p-3 rounded-lg border border-teal-500/20">
                      {data.summary || 'Surveillance report ready.'}
                    </div>

                    <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-line space-y-1">
                      {data.detailed_analysis}
                    </div>

                    {/* Key Metrics Chips */}
                    {data.key_metrics && data.key_metrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                        {data.key_metrics.map((km, mIdx) => (
                          <div key={mIdx} className="p-2 rounded bg-[#0b1220] border border-slate-800 text-xs">
                            <span className="text-slate-400 block text-[11px]">{km.label}</span>
                            <span className={`font-semibold block mt-0.5 ${km.highlight ? 'text-rose-400' : 'text-slate-200'}`}>
                              {km.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Followup Chips */}
                    {data.suggested_followups && data.suggested_followups.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Follow-up Inquiries:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {data.suggested_followups.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSend(sug)}
                              className="px-2.5 py-1 rounded bg-[#0b1220] hover:bg-teal-500 hover:text-slate-950 text-xs text-slate-300 border border-slate-800 transition cursor-pointer flex items-center gap-1"
                            >
                              <span>{sug}</span>
                              <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-start gap-2.5 animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 animate-pulse">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#070b14] border border-slate-800 rounded-xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs text-xs flex items-center gap-2 text-slate-300 font-sans">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <span className="text-xs">{thinkingStep}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Pills */}
          <div className="p-2.5 border-t border-slate-800/80 bg-[#070b14] overflow-x-auto whitespace-nowrap flex items-center gap-1.5 no-scrollbar font-sans">
            {suggestedQueries.slice(0, 4).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1 rounded-md bg-[#0b1220] hover:bg-teal-500 hover:text-slate-950 text-slate-300 border border-slate-800 transition cursor-pointer shrink-0 font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Query Input */}
          <div className="p-3.5 border-t border-slate-800/80 bg-[#070b14]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 font-sans"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask SentiPulse Intelligence e.g., 'From which area is dengue dominating?'..."
                className="flex-1 rounded-lg border border-slate-700 bg-[#0b1220] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500 transition font-sans"
              />
              <button
                type="submit"
                disabled={isThinking || !inputQuery.trim()}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
