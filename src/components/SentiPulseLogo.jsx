import React from 'react';

/**
 * SentiPulse Official Brand Logo Component
 * Minimal pulse/heartbeat waveform with teal-cyan accents and clean geometric typography.
 */
export default function SentiPulseLogo({ size = 'md', showText = true, className = '' }) {
  const iconSizes = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl',
    xl: 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SentiPulse Pulse Waveform Icon */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-teal-500/5 border border-teal-500/35 shadow-sm shadow-teal-500/15 shrink-0 ${
          iconSizes[size] || iconSizes.md
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/4 h-3/4 text-teal-400"
        >
          {/* Precision ECG / Pulse Waveform */}
          <path d="M2 12h3.5l2-5 3.5 10 2.5-6.5 1.5 3.5 2-2h4" stroke="currentColor" />
          <circle cx="20.5" cy="12" r="1.2" fill="#2dd4bf" stroke="none" />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-sans tracking-tight leading-none text-white font-extrabold ${
            textSizes[size] || textSizes.md
          }`}
        >
          Senti<span className="text-teal-400 font-black">Pulse</span>
        </span>
      )}
    </div>
  );
}
