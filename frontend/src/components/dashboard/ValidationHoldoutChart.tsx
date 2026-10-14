import React from 'react';
import { ErrorMetric } from '../../types';
import { ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface ValidationHoldoutChartProps {
  errorMetric: ErrorMetric;
  targetName: string;
  unit: string;
  color: string;
}

export const ValidationHoldoutChart: React.FC<ValidationHoldoutChartProps> = ({
  errorMetric,
  targetName,
  unit,
  color
}) => {
  if (!errorMetric) return null;

  const { rmse, baselineRMSE, history = [] } = errorMetric;
  const improvementPct = baselineRMSE > 0 ? ((baselineRMSE - rmse) / baselineRMSE) * 100 : 0;
  const isBeating = rmse < baselineRMSE;

  // Chart setup if history exists
  const hasHistory = history.length > 0;
  const actuals = history.map(h => h.actual);
  const forecasts = history.map(h => h.forecast);
  const allVals = [...actuals, ...forecasts];
  const minVal = Math.min(...allVals, 0);
  const maxVal = Math.max(...allVals, 1);
  const range = Math.max(maxVal - minVal, 0.01);

  const chartW = 560;
  const chartH = 140;
  const padL = 44;
  const padR = 24;
  const padT = 18;
  const padB = 26;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const getY = (v: number) => padT + innerH - ((v - minVal) / range) * innerH;
  const getX = (i: number) => padL + (i / Math.max(history.length - 1, 1)) * innerW;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-2 mb-4 pb-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight truncate">
              {targetName}: Holdout Validation & Skill
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                isBeating
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isBeating ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span className="whitespace-nowrap">
                {improvementPct > 0 ? `+${improvementPct.toFixed(1)}% Skill vs Baseline` : 'Baseline Parity'}
              </span>
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
          Empirical accuracy evaluated on unseen test months against a seasonal persistence baseline.
        </p>
      </div>

      {/* KPI Stats Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            Model RMSE
          </span>
          <div className="text-lg font-bold text-slate-900 mt-0.5">
            {rmse.toFixed(3)} <span className="text-xs font-normal text-slate-500">{unit}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
            Cross-validated holdout error
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            Persistence Baseline RMSE
          </span>
          <div className="text-lg font-bold text-slate-700 mt-0.5">
            {baselineRMSE.toFixed(3)} <span className="text-xs font-normal text-slate-500">{unit}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-light mt-0.5 block">
            Naïve multi-year climatology
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 block">
            Error Reduction
          </span>
          <div className="text-lg font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            {Math.abs(baselineRMSE - rmse).toFixed(3)} {unit}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
            Verified predictive advantage
          </span>
        </div>
      </div>

      {/* Validation History Graph */}
      {hasHistory && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-medium text-slate-700">Test Period Holdout Tracking</span>
            <div className="flex items-center gap-3 text-[10px] whitespace-nowrap shrink-0">
              <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0"></span> Actual Satellite Truth
              </span>
              <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }}></span> Model Forecast
              </span>
            </div>
          </div>

          <div className="relative w-full h-36 bg-slate-50/60 rounded-2xl border border-slate-200/80 p-1 overflow-hidden shadow-inner">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" className="w-full h-full">
              {/* Horizontal Gridlines */}
              <line x1={padL} y1={padT} x2={chartW - padR} y2={padT} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={padL} y1={padT + innerH / 2} x2={chartW - padR} y2={padT + innerH / 2} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={padL} y1={padT + innerH} x2={chartW - padR} y2={padT + innerH} stroke="#cbd5e1" strokeWidth="1" />

              {/* Y Ticks */}
              <text x={padL - 8} y={padT + 4} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">
                {maxVal.toFixed(1)}
              </text>
              <text x={padL - 8} y={padT + innerH / 2 + 3} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">
                {((maxVal + minVal) / 2).toFixed(1)}
              </text>
              <text x={padL - 8} y={padT + innerH} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">
                {minVal.toFixed(1)}
              </text>

              {/* Actual Curve (Dark Charcoal) */}
              {(() => {
                const actualPoints = history.map((h, i) => `${getX(i)},${getY(h.actual)}`).join(' L ');
                return (
                  <path
                    d={`M ${actualPoints}`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}

              {/* Forecast Curve (Themed) */}
              {(() => {
                const forecastPoints = history.map((h, i) => `${getX(i)},${getY(h.forecast)}`).join(' L ');
                return (
                  <path
                    d={`M ${forecastPoints}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.2"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}

              {/* Data Node Dots */}
              {history.map((h, i) => (
                <g key={i}>
                  {/* Actual Point */}
                  <circle cx={getX(i)} cy={getY(h.actual)} r="3.5" fill="#0f172a" />
                  {/* Forecast Point */}
                  <circle cx={getX(i)} cy={getY(h.forecast)} r="3.5" fill="#ffffff" stroke={color} strokeWidth="2" />
                  {/* Month Label */}
                  <text
                    x={getX(i)}
                    y={padT + innerH + 16}
                    fill="#64748b"
                    fontSize="9.5"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {h.month.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
