import React, { useState } from 'react';
import { ObservationPoint, ForecastMonthData } from '../../types';
import { BarChart3, Sparkles } from 'lucide-react';

interface HistoricalToForecastBarChartProps {
  historicalRows: ObservationPoint[];
  futureMonths: ForecastMonthData[];
  targetKey: 'lst' | 'ndvi' | 'balance';
  targetName: string;
  unit: string;
  color: string;
  selectedMonthIdx: number;
  onSelectMonth: (idx: number) => void;
}

export const HistoricalToForecastBarChart: React.FC<HistoricalToForecastBarChartProps> = ({
  historicalRows,
  futureMonths,
  targetKey,
  targetName,
  unit,
  color,
  selectedMonthIdx,
  onSelectMonth
}) => {
  const [hoveredBar, setHoveredBar] = useState<{ label: string; value: number; isForecast: boolean } | null>(null);

  // Take the last 12 historical passes and all 6 forecast months
  const recentHistory = (historicalRows || []).slice(-12);
  const futureList = (futureMonths || []).slice(0, 6);

  if (recentHistory.length === 0 && futureList.length === 0) return null;

  const historyBars = recentHistory.map((h) => ({
    label: h.date.slice(5), // MM-DD
    fullLabel: h.date,
    value: h.value,
    isForecast: false,
    forecastIdx: -1
  }));

  const forecastBars = futureList.map((m, idx) => ({
    label: m.month.slice(5), // MM
    fullLabel: m.month,
    value: m[targetKey] || 0,
    isForecast: true,
    forecastIdx: idx
  }));

  const allBars = [...historyBars, ...forecastBars];
  const allValues = allBars.map(b => b.value);
  const maxVal = Math.max(...allValues, 1) * 1.12;
  const minVal = Math.min(...allValues, 0) >= 0 ? 0 : Math.min(...allValues) * 1.1;
  const range = maxVal - minVal || 1;

  const chartW = 680;
  const chartH = 180;
  const padL = 40;
  const padR = 24;
  const padT = 24;
  const padB = 28;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const barWidth = Math.min(18, (innerW / allBars.length) * 0.65);
  const stepX = innerW / allBars.length;

  const activeForecastVal = futureList[selectedMonthIdx]?.[targetKey] || 0;
  const activeMonthLabel = futureList[selectedMonthIdx]?.month || '';

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-2 mb-4 pb-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <BarChart3 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight truncate">
              Harmonized Telemetry & Rollout Sequence
            </h3>
          </div>

          <div className="flex items-center gap-3 text-[10px] whitespace-nowrap shrink-0">
            <div className="flex items-center gap-1.5 text-slate-500 font-normal shrink-0 whitespace-nowrap">
              <span className="w-2 h-2 rounded-sm bg-slate-300 shrink-0"></span> Ground Observation
            </div>
            <div className="flex items-center gap-1.5 text-slate-800 font-medium shrink-0 whitespace-nowrap">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }}></span> 6-Month Projected
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
          Sequential {targetName.toLowerCase()} progression crossing from historical observations (slate) into active 6-month projections (vibrant).
        </p>
      </div>

      {/* SVG Bar Chart Canvas */}
      <div className="relative w-full h-[220px] bg-slate-50/50 rounded-2xl border border-slate-100 p-2 overflow-hidden">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" className="w-full h-full">
          {/* Horizontal Gridlines & Y-Ticks */}
          {[0.25, 0.5, 0.75, 1.0].map((pct, i) => {
            const val = minVal + pct * range;
            const y = padT + innerH - pct * innerH;
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padL - 8} y={y + 3.5} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Dotted Cutoff Boundary Dividing History & Forecast */}
          {(() => {
            const cutoffX = padL + historyBars.length * stepX;
            return (
              <g>
                <line
                  x1={cutoffX}
                  y1={padT - 6}
                  x2={cutoffX}
                  y2={padT + innerH}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <text x={cutoffX - 6} y={padT - 10} fill="#64748b" fontSize="8.5" textAnchor="end" fontWeight="600">
                  OBSERVATION CUTOFF
                </text>
                <text x={cutoffX + 6} y={padT - 10} fill={color} fontSize="8.5" textAnchor="start" fontWeight="bold">
                  PROJECTED ROLLOUT →
                </text>
              </g>
            );
          })()}

          {/* Render All Bars */}
          {allBars.map((b, i) => {
            const x = padL + i * stepX + (stepX - barWidth) / 2;
            const barH = Math.max(4, ((b.value - minVal) / range) * innerH);
            const y = padT + innerH - barH;
            const isSelected = b.isForecast && b.forecastIdx === selectedMonthIdx;

            return (
              <g
                key={i}
                className="cursor-pointer transition-all duration-200"
                onClick={() => {
                  if (b.isForecast) onSelectMonth(b.forecastIdx);
                }}
                onMouseEnter={() => setHoveredBar({ label: b.fullLabel, value: b.value, isForecast: b.isForecast })}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Bar Rectangle */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="3.5"
                  fill={
                    b.isForecast
                      ? isSelected
                        ? color
                        : `${color}cc`
                      : '#cbd5e1'
                  }
                  className="transition-colors hover:brightness-110"
                />

                {/* Selected Halo Pill over Active Forecast Month */}
                {isSelected && (
                  <g>
                    <line x1={x + barWidth / 2} y1={padT} x2={x + barWidth / 2} y2={y} stroke={color} strokeWidth="1" strokeDasharray="2 2" />
                    <rect
                      x={x + barWidth / 2 - 28}
                      y={y - 20}
                      width="56"
                      height="16"
                      rx="5"
                      fill="#0f172a"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 9}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {b.value.toFixed(1)} {unit}
                    </text>
                  </g>
                )}

                {/* X-Axis Labels */}
                <text
                  x={x + barWidth / 2}
                  y={padT + innerH + 16}
                  fill={isSelected ? '#0f172a' : '#94a3b8'}
                  fontSize="8.5"
                  fontWeight={isSelected ? '700' : '500'}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Readout Tooltip */}
        {hoveredBar && (
          <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-md text-white rounded-xl px-3 py-1.5 shadow-xl border border-slate-700/80 text-[10px] pointer-events-none">
            <span className="text-slate-400 font-mono">{hoveredBar.label}</span>
            <div className="font-bold text-white mt-0.5">
              {hoveredBar.value.toFixed(2)} {unit} ({hoveredBar.isForecast ? 'Forecast Step' : 'Satellite Ground Pass'})
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-light">
        <span>Active Month Target: <strong className="text-slate-800 font-semibold">{activeMonthLabel} ({activeForecastVal.toFixed(1)} {unit})</strong></span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          Click any green bar to inspect drivers
        </span>
      </div>
    </div>
  );
};
