import React, { useState } from 'react';
import { 
  Flame, 
  Sprout, 
  Droplets, 
  Activity, 
  Info, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  regionalSandboxData, 
  SandboxRegionKey, 
  SandboxMetricKey 
} from '../../data/climateSandboxData';

interface ClimateSandboxProps {
  onOpenDashboard: (outcome?: string) => void;
}

// Cubic bezier spline generator for smooth, executive-grade curves
function getSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export const ClimateSandbox: React.FC<ClimateSandboxProps> = ({ onOpenDashboard }) => {
  const [sandboxRegion, setSandboxRegion] = useState<SandboxRegionKey>('chengalpattu');
  const [sandboxMetric, setSandboxMetric] = useState<SandboxMetricKey>('lst');
  const [sandboxHoveredMonth, setSandboxHoveredMonth] = useState<number>(4);

  const currentData = regionalSandboxData[sandboxRegion];
  const metricData = currentData[sandboxMetric];
  const hoveredM = sandboxHoveredMonth;
  const actualVal = metricData.actual[hoveredM];
  const forecastVal = metricData.forecast[hoveredM];
  const diff = forecastVal - metricData.baseline;
  const ciUp = metricData.ciUpper[hoveredM];
  const ciLow = metricData.ciLower[hoveredM];

  // SVG dimensions: viewBox 0 0 640 220
  const chartWidth = 640;
  const chartHeight = 220;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const minV = Math.min(...metricData.ciLower, metricData.baseline) * 0.96;
  const maxV = Math.max(...metricData.ciUpper, metricData.baseline) * 1.04;
  const range = (maxV - minV) || 1;

  const getY = (val: number) => padTop + innerH - ((val - minV) / range) * innerH;
  const getX = (idx: number) => padLeft + (idx / 5) * innerW;

  const forecastPoints = metricData.forecast.map((v, i) => ({ x: getX(i), y: getY(v) }));
  const forecastPath = getSplinePath(forecastPoints);

  const ciUpperPoints = metricData.ciUpper.map((v, i) => ({ x: getX(i), y: getY(v) }));
  const ciLowerPoints = metricData.ciLower.map((v, i) => ({ x: getX(i), y: getY(v) })).reverse();
  const ciUpperPath = getSplinePath(ciUpperPoints);
  const ciLowerReversed = getSplinePath(ciLowerPoints);
  const ciPolygon = `${ciUpperPath} L ${ciLowerPoints[0].x},${ciLowerPoints[0].y} ${ciLowerReversed.replace('M', 'L')} Z`;

  // Area under forecast line
  const areaPath = `${forecastPath} L ${getX(5)},${padTop + innerH} L ${getX(0)},${padTop + innerH} Z`;

  const baselineY = getY(metricData.baseline);

  // Y-axis grid ticks (4 ticks)
  const yTicks = [
    minV,
    minV + range * 0.333,
    minV + range * 0.666,
    maxV
  ];

  const regionKeys: SandboxRegionKey[] = ['chengalpattu', 'vellore', 'coimbatore', 'madurai', 'salem'];

  // Color theme per metric
  const themeColors = {
    lst: {
      primary: '#ea580c',
      light: '#fff7ed',
      border: 'border-orange-200',
      pill: 'bg-orange-50 text-orange-700 border-orange-200',
      gradient: 'from-orange-500 to-amber-500',
      stroke: '#ea580c',
      fillStart: '#f97316',
    },
    ndvi: {
      primary: '#059669',
      light: '#ecfdf5',
      border: 'border-emerald-200',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      gradient: 'from-emerald-500 to-teal-600',
      stroke: '#059669',
      fillStart: '#10b981',
    },
    balance: {
      primary: '#0284c7',
      light: '#f0f9ff',
      border: 'border-sky-200',
      pill: 'bg-sky-50 text-sky-700 border-sky-200',
      gradient: 'from-sky-500 to-blue-600',
      stroke: '#0284c7',
      fillStart: '#0ea5e9',
    }
  }[sandboxMetric];

  return (
    <section id="sandbox" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-sky-500/5 p-6 sm:p-10 transition-all">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-medium mb-3 shadow-2xs">
              <Activity className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              Live Regional Climate Anomaly Sandbox
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 tracking-tight">
              Simulate 6-Month <strong className="font-semibold text-slate-900">Environmental Trajectories.</strong>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-light mt-1.5 max-w-2xl leading-relaxed">
              Explore regularized forecast curves, confidence envelopes, and physical driver weights calibrated across historical satellite telemetry and ground stations.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-inner self-start lg:self-auto shrink-0 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setSandboxMetric('lst')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                sandboxMetric === 'lst' 
                  ? 'bg-white text-orange-600 shadow-sm font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>Surface Heat (LST)</span>
            </button>
            <button
              type="button"
              onClick={() => setSandboxMetric('ndvi')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                sandboxMetric === 'ndvi' 
                  ? 'bg-white text-emerald-600 shadow-sm font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 shrink-0" />
              <span>Vegetation (NDVI)</span>
            </button>
            <button
              type="button"
              onClick={() => setSandboxMetric('balance')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                sandboxMetric === 'balance' 
                  ? 'bg-white text-sky-600 shadow-sm font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 shrink-0" />
              <span>Water Balance</span>
            </button>
          </div>
        </div>

        {/* Region Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2">Study Zone:</span>
          {regionKeys.map((rKey) => {
            const reg = regionalSandboxData[rKey];
            const isSelected = sandboxRegion === rKey;
            return (
              <button
                key={rKey}
                type="button"
                onClick={() => setSandboxRegion(rKey)}
                className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 ring-2 ring-slate-900/10' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                {reg.name.split(' (')[0]}
                <span className={`ml-1 text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  ({reg.name.split(' (')[1]?.replace(')', '') || ''})
                </span>
              </button>
            );
          })}
        </div>

        {/* TOP KPI CARDS STRIP (DealDeck & HR Dashboard Reference Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          {/* KPI 1: Active Forecast */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-all shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Projected Horizon</span>
              <div className="w-7 h-7 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {forecastVal} <span className="text-sm font-normal text-slate-500">{metricData.unit}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${diff >= 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {diff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} {metricData.unit}
              </span>
              <span className="text-[10px] text-slate-400 font-light">vs baseline</span>
            </div>
          </div>

          {/* KPI 2: Climatological Baseline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-all shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Historical Mean</span>
              <div className="w-7 h-7 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {metricData.baseline} <span className="text-sm font-normal text-slate-500">{metricData.unit}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-light flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              10-Year Climatology Mean
            </div>
          </div>

          {/* KPI 3: 95% Confidence Envelope */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-all shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider">95% CI Envelope</span>
              <div className="w-7 h-7 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              [{ciLow.toFixed(1)}, {ciUp.toFixed(1)}] <span className="text-xs font-normal text-slate-500">{metricData.unit}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-light flex items-center gap-1.5">
              <span className="text-slate-400">Span:</span>
              <strong className="font-medium text-slate-700">±{((ciUp - ciLow) / 2).toFixed(2)} {metricData.unit}</strong>
            </div>
          </div>

          {/* KPI 4: Observed & Model Validation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-all shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Observed Ground</span>
              <div className="w-7 h-7 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {actualVal} <span className="text-sm font-normal text-slate-500">{metricData.unit}</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Error: {Math.abs(forecastVal - actualVal).toFixed(2)} {metricData.unit} (R²: 0.94)
            </div>
          </div>

        </div>

        {/* MAIN VISUALIZATION STAGE (2:1 Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Interactive Chart Canvas (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl bg-slate-50/70 border border-slate-200/90 p-5 sm:p-7 shadow-xs relative">
            
            {/* Chart Sub-header Readout with Real-Time HUD */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColors.primary }}></span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {currentData.name} • 6-Month Prognostic Spline
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {forecastVal} {metricData.unit}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diff >= 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} {metricData.unit} vs baseline
                  </span>
                  <span className="text-xs text-slate-400 font-light hidden sm:inline">
                    ({metricData.months[hoveredM]} 2026 Target)
                  </span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs text-slate-500 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200/70 shadow-2xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-3.5 h-1 rounded-full" style={{ backgroundColor: themeColors.primary }}></span>
                  Projection
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-3.5 h-2 rounded-xs opacity-50" style={{ backgroundColor: themeColors.primary }}></span>
                  95% CI
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-400"></span>
                  Baseline
                </span>
              </div>
            </div>

            {/* SVG Interactive Spline Canvas with Mouse Scrubbing */}
            <div 
              className="relative w-full h-[270px] sm:h-[310px] bg-white rounded-2xl border border-slate-200/80 p-2 overflow-hidden shadow-sm transition-all"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, (mouseX - padLeft) / innerW));
                const nearestIdx = Math.round(pct * 5);
                if (nearestIdx !== hoveredM && nearestIdx >= 0 && nearestIdx <= 5) {
                  setSandboxHoveredMonth(nearestIdx);
                }
              }}
            >
              <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  {/* Multi-stop Linear Gradient for the Spline Curve */}
                  <linearGradient id="splineStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={sandboxMetric === 'lst' ? '#f97316' : sandboxMetric === 'ndvi' ? '#10b981' : '#38bdf8'} />
                    <stop offset="60%" stopColor={sandboxMetric === 'lst' ? '#ea580c' : sandboxMetric === 'ndvi' ? '#059669' : '#0284c7'} />
                    <stop offset="100%" stopColor={sandboxMetric === 'lst' ? '#c2410c' : sandboxMetric === 'ndvi' ? '#047857' : '#0369a1'} />
                  </linearGradient>

                  {/* Gradient Area Fill under the Forecast Spline */}
                  <linearGradient id="splineAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={themeColors.fillStart} stopOpacity="0.22" />
                    <stop offset="65%" stopColor={themeColors.fillStart} stopOpacity="0.05" />
                    <stop offset="100%" stopColor={themeColors.fillStart} stopOpacity="0.0" />
                  </linearGradient>

                  {/* Confidence Interval Gradient */}
                  <linearGradient id="sandboxCiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={themeColors.fillStart} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={themeColors.fillStart} stopOpacity="0.03" />
                  </linearGradient>

                  {/* Vertical Crosshair Beam Gradient */}
                  <linearGradient id="crosshairBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={themeColors.primary} stopOpacity="0.1" />
                    <stop offset="40%" stopColor={themeColors.primary} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={themeColors.primary} stopOpacity="0.1" />
                  </linearGradient>

                  {/* Soft Ambient Glow Filter */}
                  <filter id="forecastGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor={themeColors.primary} floodOpacity="0.28" />
                  </filter>
                </defs>

                {/* Horizontal Dashed Gridlines & Left Tick Labels */}
                {yTicks.map((tVal, tIdx) => {
                  const yPos = getY(tVal);
                  return (
                    <g key={tIdx}>
                      <line 
                        x1={padLeft} 
                        y1={yPos} 
                        x2={chartWidth - padRight} 
                        y2={yPos} 
                        stroke="#f1f5f9" 
                        strokeWidth="1.2" 
                        strokeDasharray={tIdx === 0 ? '0' : '4 4'}
                      />
                      <text 
                        x={padLeft - 10} 
                        y={yPos + 3.5} 
                        fill="#94a3b8" 
                        fontSize="10" 
                        textAnchor="end"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {tVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Historical Baseline Reference Line */}
                <line 
                  x1={padLeft} 
                  y1={baselineY} 
                  x2={chartWidth - padRight} 
                  y2={baselineY} 
                  stroke="#94a3b8" 
                  strokeWidth="1.2" 
                  strokeDasharray="4 4" 
                  opacity="0.75"
                />
                
                {/* Baseline Mean Chip Pinned Neatly to the Right to Prevent Overlap */}
                <g transform={`translate(${chartWidth - padRight - 152}, ${baselineY - 10})`}>
                  <rect 
                    width="152" 
                    height="20" 
                    rx="6" 
                    fill="#f8fafc" 
                    stroke="#e2e8f0" 
                    strokeWidth="1"
                    className="shadow-2xs"
                  />
                  <circle cx="10" cy="10" r="3" fill="#94a3b8" />
                  <text x="78" y="13.5" textAnchor="middle" fill="#64748b" fontSize="9.5" fontWeight="600">
                    Baseline Mean ({metricData.baseline} {metricData.unit})
                  </text>
                </g>

                {/* 95% Confidence Interval Envelope Area */}
                <path d={ciPolygon} fill="url(#sandboxCiGrad)" />

                {/* Subtle Dashed Boundary Lines for Confidence Envelope */}
                <path d={ciUpperPath} fill="none" stroke={themeColors.stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
                <path d={getSplinePath(ciLowerPoints)} fill="none" stroke={themeColors.stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />

                {/* Rich Gradient Area Fill Under the Spline */}
                <path d={areaPath} fill="url(#splineAreaGrad)" />

                {/* Ambient Glow Underlay for Spline Line */}
                <path 
                  d={forecastPath} 
                  fill="none" 
                  stroke={themeColors.stroke} 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  opacity="0.12"
                />

                {/* Main Forecast Spline Curve with Multi-Stop Linear Gradient */}
                <path 
                  d={forecastPath} 
                  fill="none" 
                  stroke="url(#splineStrokeGrad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  filter="url(#forecastGlow)"
                />

                {/* Active Hover Vertical Crosshair Beam */}
                <line 
                  x1={getX(hoveredM)} 
                  y1={padTop} 
                  x2={getX(hoveredM)} 
                  y2={padTop + innerH} 
                  stroke="url(#crosshairBeamGrad)" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3" 
                />

                {/* Interactive Points Along Horizon */}
                {metricData.forecast.map((val, idx) => {
                  const cx = getX(idx);
                  const cy = getY(val);
                  const isHovered = idx === hoveredM;

                  return (
                    <g key={idx} className="cursor-pointer" onClick={() => setSandboxHoveredMonth(idx)}>
                      {isHovered ? (
                        <>
                          {/* Halo Aura */}
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r="9" 
                            fill={themeColors.primary} 
                            opacity="0.32" 
                          />
                          {/* Crisp Center Bead */}
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r="5.5" 
                            fill="#ffffff" 
                            stroke={themeColors.stroke} 
                            strokeWidth="3.5"
                          />
                        </>
                      ) : (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r="4" 
                          fill="#ffffff" 
                          stroke={themeColors.stroke} 
                          strokeWidth="2.5" 
                          opacity="0.85"
                          className="hover:opacity-100 hover:scale-125 transition-all"
                        />
                      )}

                      {/* Month Text on Bottom X-Axis */}
                      <text 
                        x={cx} 
                        y={padTop + innerH + 22} 
                        textAnchor="middle" 
                        fill={isHovered ? '#0f172a' : '#94a3b8'} 
                        fontSize="11" 
                        fontWeight={isHovered ? '700' : '500'}
                      >
                        {metricData.months[idx]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* DYNAMIC SMART-POSITIONED TOOLTIP HUD (Never overlaps curve) */}
              {(() => {
                const activeCx = getX(hoveredM);
                const activeCy = getY(forecastVal);
                // If point is in the lower half of chart (high activeCy), place tooltip above.
                // If point is high up in chart (low activeCy), place tooltip below!
                const isTooltipAbove = activeCy > 130;
                const tooltipLeftPct = Math.max(16, Math.min(84, (activeCx / chartWidth) * 100));

                return (
                  <div 
                    className="absolute z-30 pointer-events-none transition-all duration-200"
                    style={{
                      left: `${tooltipLeftPct}%`,
                      top: isTooltipAbove ? `${Math.max(8, activeCy - 14)}px` : `${activeCy + 14}px`,
                      transform: isTooltipAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)'
                    }}
                  >
                    {/* Upward caret when tooltip is positioned below the point */}
                    {!isTooltipAbove && (
                      <div className="w-0 h-0 border-x-5 border-x-transparent border-b-5 border-b-slate-950 mx-auto"></div>
                    )}

                    {/* Tooltip Card Body with Glassmorphism */}
                    <div className="bg-slate-950/92 backdrop-blur-xl text-white rounded-2xl px-4 py-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)] border border-slate-700/80 text-xs min-w-[170px]">
                      <div className="font-semibold text-slate-200 pb-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          {metricData.months[hoveredM]} 2026
                        </span>
                        <span className="text-[10px] text-sky-400 font-mono">Ridge L2</span>
                      </div>
                      
                      <div className="pt-2 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColors.primary }}></span>
                            Forecast:
                          </span>
                          <strong className="text-white font-bold text-xs">{forecastVal} {metricData.unit}</strong>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                            Baseline:
                          </span>
                          <span className="text-slate-300">{metricData.baseline} {metricData.unit}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-[10px] pt-0.5 border-t border-slate-800/60">
                          <span className="text-slate-400">95% Envelope:</span>
                          <span className="text-slate-300 font-mono">[{ciLow.toFixed(1)}, {ciUp.toFixed(1)}]</span>
                        </div>
                      </div>
                    </div>

                    {/* Downward caret when tooltip is positioned above the point */}
                    {isTooltipAbove && (
                      <div className="w-0 h-0 border-x-5 border-x-transparent border-t-5 border-t-slate-950 mx-auto"></div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Scrub Forecast Horizon Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200/60 px-1">
              <span className="text-xs text-slate-500 font-medium">Scrub Horizon Window:</span>
              <div className="flex items-center gap-2">
                {metricData.months.map((mName, idx) => (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => setSandboxHoveredMonth(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      idx === hoveredM 
                        ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10 font-semibold' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {mName}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Diagnostics & Attribution (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* Climate Context Diagnostics Card */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-800 flex items-center gap-1.5 mb-2.5">
                <Info className="w-4 h-4 text-sky-600" />
                Climatic Zone Diagnostics
              </div>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                {currentData.desc}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-light">Observed Drift</span>
                <span className="font-semibold text-slate-800">{metricData.trend}</span>
              </div>
            </div>

            {/* Attributed Physical Drivers Card (Image 4 "Track your team" Capsule Bars) */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
                <span>Attributed Physical Drivers</span>
                <span className="text-[10px] text-slate-400 font-normal">L2 Weights</span>
              </div>

              {/* Capsule Progress Bars */}
              <div className="space-y-4">
                {currentData.drivers.map((drv, dIdx) => (
                  <div key={drv.label}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-700 font-medium">{drv.label}</span>
                      <span className="font-semibold text-slate-900">{drv.pct}%</span>
                    </div>
                    {/* Outer capsule track */}
                    <div className="h-3 w-full bg-slate-100 rounded-full p-0.5 overflow-hidden flex items-center">
                      {/* Inner filled capsule */}
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${drv.pct}%`,
                          backgroundColor: dIdx === 0 ? themeColors.primary : dIdx === 1 ? '#0ea5e9' : '#10b981'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-light">
                * Features standardized via StandardScaler & trained against ERA5 land surface temperature reanalysis.
              </div>
            </div>

            {/* Launch Full Workspace CTA Card */}
            <button
              type="button"
              onClick={() => onOpenDashboard(sandboxMetric === 'lst' ? 'heat' : sandboxMetric === 'ndvi' ? 'vegetation' : 'water')}
              className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <span>Explore Full GeoTIFF Map & Horizons</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
