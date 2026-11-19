import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  trendPositiveIsGood = false,
  comparisonPeriod = 'vs 30d baseline',
  subtitle,
  icon: Icon,
  accentColor = 'teal',
  sparklineData = [35, 42, 48, 55, 68, 80, 92],
  isSimulated = false
}) {
  const getTrendColor = () => {
    if (!trend) return 'text-slate-400';
    if (trendDirection === 'neutral') return 'text-slate-400';
    if (trendDirection === 'up') {
      return trendPositiveIsGood ? 'text-emerald-400' : 'text-rose-400';
    }
    return trendPositiveIsGood ? 'text-rose-400' : 'text-emerald-400';
  };

  const getTrendIcon = () => {
    if (trendDirection === 'neutral') return <Minus className="w-3 h-3 inline mr-1 shrink-0" />;
    if (trendDirection === 'down') return <TrendingDown className="w-3 h-3 inline mr-1 shrink-0" />;
    return <TrendingUp className="w-3 h-3 inline mr-1 shrink-0" />;
  };

  const accentStyles = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const iconAccent = accentStyles[accentColor] || accentStyles.teal;

  return (
    <div className="bg-[#0b1220]/90 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-5 shadow-xs transition-colors duration-200 flex flex-col justify-between min-h-[148px] min-w-0">
      
      {/* Top Header: Concise Label & Icon */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-400 font-sans tracking-normal truncate">
            {title}
          </span>
          {Icon && (
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${iconAccent}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Large Numerical Value */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            {value}
          </h3>
        </div>
      </div>

      {/* Bottom Section: Trend Indicator & Supporting Description */}
      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {trend ? (
            <span className={`text-xs font-medium font-sans flex items-center shrink-0 ${getTrendColor()}`}>
              {getTrendIcon()}
              {trend}
            </span>
          ) : null}
          <span className="text-[11px] text-slate-500 font-sans truncate">
            {subtitle || comparisonPeriod}
          </span>
        </div>

        {/* Mini Sparkline Bar Indicator */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="flex items-end gap-1 h-3.5 shrink-0 opacity-80" aria-hidden="true">
            {sparklineData.map((val, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-xs ${
                  idx === sparklineData.length - 1
                    ? 'bg-teal-400'
                    : 'bg-slate-700'
                }`}
                style={{ height: `${Math.max(20, Math.min(100, val))}%` }}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
