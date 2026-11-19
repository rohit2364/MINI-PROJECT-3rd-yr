import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { useSurveillance } from '../context/SurveillanceContext';
import { queryAgentRemote } from '../services/api';
import { runClientAgentQuery } from '../services/clientAgent';

export default function FloatingAgentWidget({ setActivePage }) {
  const { regions, alerts, serverOnline } = useSurveillance();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      summary: "I'm SentiPulse Intelligence. Ask me about disease dominance, hotspot comparisons, or forecast trajectories.",
      metrics: null
    }
  ]);

  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  const handleSend = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim() || isThinking) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setQuery('');
    setIsThinking(true);

    try {
      let res = null;
      if (serverOnline) {
        res = await queryAgentRemote(q);
      }
      if (!res) {
        res = runClientAgentQuery(q, regions, alerts);
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          summary: res.summary,
          detailed: res.detailed_analysis,
          metrics: res.key_metrics,
          followups: res.suggested_followups
        }
      ]);
    } catch (err) {
      const fallback = runClientAgentQuery(q, regions, alerts);
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          summary: fallback.summary,
          detailed: fallback.detailed_analysis,
          metrics: fallback.key_metrics,
          followups: fallback.suggested_followups
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-xs shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-teal-400/30 font-sans"
          aria-label="Open SentiPulse Intelligence Assistant"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-300 animate-ping absolute"></span>
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="tracking-wide">Ask SentiPulse AI</span>
          <Sparkles className="w-3.5 h-3.5 text-teal-200" />
        </button>
      )}

      {/* Slide-out Chat Drawer / Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[540px] bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 font-sans">
          
          {/* Header */}
          <div className="px-4 py-3 bg-[#080d19] border-b border-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-tight text-white font-sans">SentiPulse Intelligence Console</h4>
                <p className="text-[11px] text-teal-400 font-sans leading-tight">Epidemiological Reasoning</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (setActivePage) setActivePage('agent');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Expand to Full Page"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            {messages.map((m, idx) => {
              if (m.sender === 'user') {
                return (
                  <div key={idx} className="flex justify-end">
                    <div className="bg-teal-600 text-white rounded-2xl rounded-tr-xs px-3.5 py-2 max-w-[85%] shadow-2xs text-[11px]">
                      {m.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-navy-950 p-3 rounded-2xl rounded-tl-xs border border-slate-200 dark:border-navy-800 text-[11px] space-y-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                      {m.summary}
                    </p>

                    {m.detailed && (
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                        {m.detailed}
                      </p>
                    )}

                    {m.metrics && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {m.metrics.slice(0, 2).map((km, i) => (
                          <div key={i} className="p-1.5 rounded bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-[10px]">
                            <span className="text-slate-400 block truncate">{km.label}</span>
                            <span className="font-bold font-mono text-teal-600 dark:text-teal-400 block truncate">{km.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {m.followups && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {m.followups.slice(0, 2).map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(sug)}
                            className="px-2 py-0.5 rounded-full bg-white dark:bg-navy-900 hover:bg-teal-500 hover:text-white border border-slate-200 dark:border-navy-800 text-[10px] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] p-2 bg-slate-50 dark:bg-navy-950 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                <span>Sentinel AI is analyzing live surveillance data...</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d19] flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono">
            {["Where is Dengue dominating?", "Which regions are Critical?", "Compare NY vs CA"].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-slate-700 dark:text-slate-300 transition whitespace-nowrap cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about outbreaks, areas, or symptoms..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={isThinking || !query.trim()}
                className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 transition cursor-pointer shadow-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
