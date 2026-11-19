import React from 'react';

export default function OutbreakRiskBadge({ tier, score, showScore = true, size = "md" }) {
  const normalizedTier = (tier || "Low").toLowerCase();

  const config = {
    critical: {
      bg: 'bg-red-500/15 dark:bg-red-500/20',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-500/30',
      dot: 'bg-red-500',
      label: 'Critical Outbreak Risk',
      pulse: true
    },
    high: {
      bg: 'bg-orange-500/15 dark:bg-orange-500/20',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-500/30',
      dot: 'bg-orange-500',
      label: 'High Outbreak Risk',
      pulse: true
    },
    moderate: {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
      label: 'Moderate Risk',
      pulse: false
    },
    low: {
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
      label: 'Low / Baseline',
      pulse: false
    }
  };

  const current = config[normalizedTier] || config.low;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.2 gap-1',
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold'
  };

  const chosenSize = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${chosenSize} font-medium shadow-sm transition-all`}
      title={`${current.label} ${score !== undefined ? `(${score}%)` : ''}`}
    >
      <span className="relative flex h-2 w-2">
        {current.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.dot} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`}></span>
      </span>
      <span>{tier || 'Low'}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 font-mono text-[11px]">({score}%)</span>
      )}
    </span>
  );
}
