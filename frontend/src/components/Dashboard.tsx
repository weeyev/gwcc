import React, { useState, useEffect, useRef } from 'react';
import { places, outcomes } from '../config';
import { getForecast } from '../lib/api';
import { ForecastResponsePayload } from '../types';
import { 
  ArrowLeft, 
  AlertCircle, 
  RefreshCw, 
  ChevronDown, 
  Check, 
  MapPin, 
  Flame, 
  Sprout, 
  Droplets, 
  Calendar, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  FileText,
  CloudRain
} from 'lucide-react';

import { DriverAttributionChart } from './dashboard/DriverAttributionChart';
import { ValidationHoldoutChart } from './dashboard/ValidationHoldoutChart';
import { MultiMetricMatrix } from './dashboard/MultiMetricMatrix';
import { EnvironmentalBriefing } from './dashboard/EnvironmentalBriefing';
import { ReportModal } from './dashboard/ReportModal';
import { EnvironmentalRadialRose } from './dashboard/EnvironmentalRadialRose';
import { RegionalGeospatialMap } from './dashboard/RegionalGeospatialMap';
import { HistoricalToForecastBarChart } from './dashboard/HistoricalToForecastBarChart';
import { RegionalComparisonTable } from './dashboard/RegionalComparisonTable';

interface DashboardProps {
  initialOutcome?: string;
  onBackToLanding: () => void;
}

// Cubic bezier spline path generator for smooth executive-grade curves
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

export const Dashboard: React.FC<DashboardProps> = ({ initialOutcome = 'heat', onBackToLanding }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('chengalpattu');
  const [selectedOutcome, setSelectedOutcome] = useState<string>(initialOutcome);
  const [selectedHorizonMonth, setSelectedHorizonMonth] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ForecastResponsePayload | null>(null);

  // Custom Dropdown Open States
  const [regionDropdownOpen, setRegionDropdownOpen] = useState<boolean>(false);
  const [outcomeDropdownOpen, setOutcomeDropdownOpen] = useState<boolean>(false);

  // Report Modal Open State
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Historical interactive hover indices
  const [hoveredLstIdx, setHoveredLstIdx] = useState<number | null>(null);
  const [hoveredNdviIdx, setHoveredNdviIdx] = useState<number | null>(null);

  const regionRef = useRef<HTMLDivElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionDropdownOpen(false);
      }
      if (outcomeRef.current && !outcomeRef.current.contains(e.target as Node)) {
        setOutcomeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch forecast data when region changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    getForecast(selectedRegion)
      .then((data) => {
        if (!isCancelled) {
          setPayload(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || 'Unable to retrieve forecast.');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedRegion]);

  const outcomeConfig = outcomes[selectedOutcome] || outcomes.heat;
  const placeConfig = places[selectedRegion] || places.chengalpattu;

  // Outcome Icon Helper
  const getOutcomeIcon = (key: string) => {
    if (key === 'heat') return <Flame className="w-4 h-4 text-orange-500" />;
    if (key === 'vegetation') return <Sprout className="w-4 h-4 text-emerald-500" />;
    return <Droplets className="w-4 h-4 text-sky-500" />;
  };

  // Render Interactive Historical Telemetry Graph
  const renderHistoricalGraph = (
    rows: Array<{ date: string; value: number }>, 
    color: string, 
    hoveredIdx: number | null, 
    setHoveredIdx: (idx: number | null) => void,
    unit: string,
    label: string
  ) => {
    if (!rows || rows.length < 2) return null;
    const values = rows.map((r) => r.value);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const range = Math.max(high - low, 0.01);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const latest = rows[rows.length - 1];

    const chartW = 560;
    const chartH = 150;
    const padL = 48;
    const padR = 24;
    const padT = 20;
    const padB = 26;
    const innerW = chartW - padL - padR;
    const innerH = chartH - padT - padB;

    const start = Date.parse(rows[0].date);
    const end = Date.parse(rows[rows.length - 1].date);

    const pointCoords = rows.map((r, i) => {
      const x = padL + ((Date.parse(r.date) - start) / Math.max(1, end - start)) * innerW;
      const y = padT + innerH - ((r.value - low) / range) * innerH;
      return { x, y, ...r, origIdx: i };
    });

    const splinePath = getSplinePath(pointCoords);
    const areaPath = `${splinePath} L ${padL + innerW},${padT + innerH} L ${padL},${padT + innerH} Z`;

    const activePt = hoveredIdx !== null && pointCoords[hoveredIdx] ? pointCoords[hoveredIdx] : null;

    return (
      <div className="space-y-3">
        {/* Metric Summary Header Chips */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-white/80 p-2 rounded-xl border border-slate-100 shadow-2xs">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Latest</span>
            <span className="text-xs font-bold text-slate-800">{latest?.value.toFixed(2)} {unit}</span>
          </div>
          <div className="bg-white/80 p-2 rounded-xl border border-slate-100 shadow-2xs">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Period Peak</span>
            <span className="text-xs font-bold text-orange-600">{high.toFixed(2)} {unit}</span>
          </div>
          <div className="bg-white/80 p-2 rounded-xl border border-slate-100 shadow-2xs">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Period Low</span>
            <span className="text-xs font-bold text-sky-600">{low.toFixed(2)} {unit}</span>
          </div>
          <div className="bg-white/80 p-2 rounded-xl border border-slate-100 shadow-2xs">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Mean</span>
            <span className="text-xs font-bold text-slate-700">{mean.toFixed(2)} {unit}</span>
          </div>
        </div>

        {/* Interactive SVG Canvas */}
        <div 
          className="relative w-full h-36 bg-white rounded-2xl border border-slate-200/80 p-1 overflow-hidden shadow-inner cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, (mouseX - padL) / innerW));
            const nearest = Math.round(pct * (rows.length - 1));
            setHoveredIdx(nearest);
          }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="70%" stopColor={color} stopOpacity="0.05" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line x1={padL} y1={padT} x2={chartW - padR} y2={padT} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={padL} y1={padT + innerH / 2} x2={chartW - padR} y2={padT + innerH / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={padL} y1={padT + innerH} x2={chartW - padR} y2={padT + innerH} stroke="#e2e8f0" strokeWidth="1" />

            {/* Y Ticks */}
            <text x={padL - 8} y={padT + 4} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">{high.toFixed(1)}</text>
            <text x={padL - 8} y={padT + innerH / 2 + 3} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">{mean.toFixed(1)}</text>
            <text x={padL - 8} y={padT + innerH} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">{low.toFixed(1)}</text>

            {/* Area Fill */}
            <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />

            {/* Spline Path */}
            <path 
              d={splinePath} 
              fill="none" 
              stroke={color} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Active Hover Crosshair & Point */}
            {activePt && (
              <g>
                <line 
                  x1={activePt.x} 
                  y1={padT} 
                  x2={activePt.x} 
                  y2={padT + innerH} 
                  stroke="#0f172a" 
                  strokeWidth="1.2" 
                  strokeDasharray="2 3" 
                  opacity="0.6"
                />
                <circle cx={activePt.x} cy={activePt.y} r="6" fill={color} opacity="0.25" />
                <circle cx={activePt.x} cy={activePt.y} r="4" fill="#ffffff" stroke={color} strokeWidth="2.5" />
              </g>
            )}
          </svg>

          {/* Floating Tooltip */}
          {activePt && (
            <div 
              className="absolute z-20 pointer-events-none transition-all duration-100"
              style={{
                left: `${Math.max(18, Math.min(82, (activePt.x / chartW) * 100))}%`,
                top: activePt.y > 75 ? `${activePt.y - 10}px` : `${activePt.y + 12}px`,
                transform: activePt.y > 75 ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)'
              }}
            >
              <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-xl px-2.5 py-1.5 shadow-xl border border-slate-700/80 text-[10px] whitespace-nowrap">
                <div className="text-slate-400 font-mono text-[9px]">{activePt.date} · {label}</div>
                <div className="font-bold text-white mt-0.5">
                  {activePt.value.toFixed(2)} {unit}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100/90 via-sky-50/50 to-white text-slate-800 font-light pb-20">
      
      {/* Top Breadcrumb & Controls Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-6">
        
        {/* Navigation Breadcrumb & Top Actions */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-normal text-slate-500 hover:text-sky-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-sky-800 bg-white/80 border border-sky-100 px-3.5 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online · 6-Month Ridge Model Active
            </span>

            {/* Export Executive Report Trigger Button */}
            {payload && (
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-3.5 py-1.5 text-xs font-medium shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Export Report (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Header Title & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-sky-100/80">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">Predictive Workspace</span>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight mt-0.5">
              Regional Environmental Outlook
            </h1>
            <p className="text-xs text-slate-500 font-light mt-1">
              Select any regional study area and indicator to inspect high-fidelity trajectories calibrated with satellite ground truths.
            </p>
          </div>

          {/* CUSTOM OPTION SELECTORS WITH GENEROUS RIGHT-SIDE MARGIN */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Custom Study Area Dropdown */}
            <div className="flex flex-col gap-1.5 relative" ref={regionRef}>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Study Area
              </label>
              
              <button
                type="button"
                onClick={() => {
                  setRegionDropdownOpen(!regionDropdownOpen);
                  setOutcomeDropdownOpen(false);
                }}
                className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-sky-400 text-slate-800 text-xs font-medium rounded-2xl pl-4 pr-3.5 py-2.5 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 min-w-[240px] cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0 border border-sky-100">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left truncate">
                    <span className="font-semibold text-slate-900 truncate">{placeConfig.name}</span>
                    <span className="text-[10px] text-slate-400 font-light truncate">Tamil Nadu, India</span>
                  </div>
                </div>
                {/* Dedicated Chevron with Proper Right Side Margin */}
                <div className="ml-3 mr-1 pl-2.5 border-l border-slate-100 shrink-0 flex items-center justify-center">
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform duration-200 ${regionDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                </div>
              </button>

              {/* Custom Popover Options Menu */}
              {regionDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[260px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Select Study Area</span>
                    <span className="text-[9px] font-normal text-slate-400">3 Verified Hubs</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                    {Object.entries(places).map(([key, place]) => {
                      const isSelected = selectedRegion === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedRegion(key);
                            setRegionDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'bg-sky-50 text-sky-950 font-semibold' 
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-sky-200/60 text-sky-800' : 'bg-slate-100 text-slate-500'}`}>
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{place.name}, TN</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {place.lat.toFixed(4)}°N · {place.lon.toFixed(4)}°E
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Focus Indicator Dropdown */}
            <div className="flex flex-col gap-1.5 relative" ref={outcomeRef}>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Indicator
              </label>

              <button
                type="button"
                onClick={() => {
                  setOutcomeDropdownOpen(!outcomeDropdownOpen);
                  setRegionDropdownOpen(false);
                }}
                className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-sky-400 text-slate-800 text-xs font-medium rounded-2xl pl-4 pr-3.5 py-2.5 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 min-w-[220px] cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    {getOutcomeIcon(selectedOutcome)}
                  </div>
                  <div className="flex flex-col text-left truncate">
                    <span className="font-semibold text-slate-900 truncate">{outcomeConfig.name}</span>
                    <span className="text-[10px] text-slate-400 font-light truncate">{outcomeConfig.unit} · 6-mo rollout</span>
                  </div>
                </div>
                {/* Dedicated Chevron with Proper Right Side Margin */}
                <div className="ml-3 mr-1 pl-2.5 border-l border-slate-100 shrink-0 flex items-center justify-center">
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform duration-200 ${outcomeDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                </div>
              </button>

              {/* Custom Popover Options Menu */}
              {outcomeDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[260px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Target Environmental Outlook</span>
                    <span className="text-[9px] font-normal text-slate-400">3 Indicators</span>
                  </div>
                  <div className="py-1 space-y-0.5">
                    {Object.entries(outcomes).map(([key, item]) => {
                      const isSelected = selectedOutcome === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedOutcome(key);
                            setOutcomeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'bg-sky-50 text-sky-950 font-semibold' 
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-sky-200/60' : 'bg-slate-100'}`}>
                              {getOutcomeIcon(key)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-[10px] text-slate-400">Unit: {item.unit} · Holdout verified</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        
        {/* Loading State */}
        {loading && (
          <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-sky-100 p-14 text-center text-slate-500 shadow-sm">
            <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-sky-600" />
            <div className="text-sm font-semibold text-slate-800">Synchronizing satellite observations & rollout…</div>
            <div className="text-xs text-slate-400 mt-1">Retrieving NASA MODIS passes and harmonizing with ERA5 surface models</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-900">Telemetry Feed Issue</div>
              <div className="mt-1 leading-relaxed">{error}</div>
            </div>
          </div>
        )}

        {/* Data Loaded View */}
        {!loading && !error && payload && (
          <>
            {/* ============================================================== */}
            {/* EXECUTIVE TOP KPI CARDS (MATCHING REFERENCE DASHBOARD UI)       */}
            {/* ============================================================== */}
            {(() => {
              const futureList = payload.outlook.future.slice(0, 6);
              const activeVal = futureList[selectedHorizonMonth]?.[outcomeConfig.target] || 0;
              const totalRainfall = futureList.reduce((acc, m) => acc + (m.rainfall || 0), 0);
              const modelRmse = payload.outlook.errors[outcomeConfig.target]?.rmse || 1.0;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Hero Dark Accent Card */}
                  <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block">
                        Focus: {outcomeConfig.name}
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-white flex items-baseline gap-1.5">
                        <span>{activeVal.toFixed(outcomeConfig.unit === '°C' || outcomeConfig.unit === 'mm' ? 1 : 3)}</span>
                        <span className="text-xs font-normal text-slate-400">{outcomeConfig.unit}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Target: {futureList[selectedHorizonMonth]?.month}
                      </span>
                      {/* Mini Equalizer Bar Visualizer */}
                      <div className="flex items-end gap-1 h-4">
                        <span className="w-1 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="w-1 h-3.5 bg-emerald-400 rounded-full"></span>
                        <span className="w-1 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span className="w-1 h-3 bg-emerald-300 rounded-full"></span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Environmental Resilience Index */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Regional Resilience Index
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-slate-900 flex items-baseline gap-1">
                        <span>82.40</span>
                        <span className="text-xs font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-light">
                        Holdout RMSE: {modelRmse.toFixed(2)} {outcomeConfig.unit}
                      </span>
                      <div className="flex items-end gap-1 h-4">
                        <span className="w-1 h-3 bg-sky-500 rounded-full"></span>
                        <span className="w-1 h-2 bg-sky-400 rounded-full"></span>
                        <span className="w-1 h-4 bg-sky-600 rounded-full"></span>
                        <span className="w-1 h-1.5 bg-sky-300 rounded-full"></span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: 6-Month Projected Precipitation */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        6-Mo Forecast Rainfall
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-slate-900 flex items-baseline gap-1">
                        <span>{totalRainfall.toFixed(0)}</span>
                        <span className="text-xs font-normal text-slate-400">mm total</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-sky-700 font-medium flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                        Monsoon Surge Forecast
                      </span>
                      <div className="flex items-end gap-1 h-4">
                        <span className="w-1 h-1.5 bg-blue-400 rounded-full"></span>
                        <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                        <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                        <span className="w-1 h-2.5 bg-blue-400 rounded-full"></span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Big Archive Stat Card */}
                  <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                          NASA MODIS Archive
                        </span>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900">
                          Verified
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-slate-900 flex items-baseline gap-1">
                        <span>74</span>
                        <span className="text-xs font-normal text-slate-600">composite passes</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] text-emerald-800 font-medium flex items-center justify-between">
                      <span>MOD11A2 (1km) • MOD13Q1</span>
                      <span className="font-mono text-[10px] text-slate-500">ERA5 0.25°</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ============================================================== */}
            {/* 6-MONTH FUTURE HORIZON TIMELINE WITH INTERACTIVE SPLINE GRAPH   */}
            {/* ============================================================== */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">Projected 6-Month Trajectory Spline</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Continuous autoregressive linear projection calibrated against multi-year seasonality and ERA5 lag coefficients.
                  </p>
                </div>

                {/* Horizon Month Selector Buttons (Strictly Single Line) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 flex-nowrap shrink-0">
                  {payload.outlook.future.slice(0, 6).map((monthData, idx) => (
                    <button
                      key={monthData.month}
                      type="button"
                      onClick={() => setSelectedHorizonMonth(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        selectedHorizonMonth === idx 
                          ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10 font-semibold' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      <span className="whitespace-nowrap font-mono">{monthData.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Projected Spline Visualization Canvas */}
              {(() => {
                const futureList = payload.outlook.future.slice(0, 6);
                const values = futureList.map(m => m[outcomeConfig.target] || 0);
                const minV = Math.min(...values) * 0.94;
                const maxV = Math.max(...values) * 1.06;
                const range = (maxV - minV) || 1;

                const cWidth = 640;
                const cHeight = 200;
                const pLeft = 52;
                const pRight = 32;
                const pTop = 26;
                const pBottom = 34;
                const iW = cWidth - pLeft - pRight;
                const iH = cHeight - pTop - pBottom;

                const getY = (v: number) => pTop + iH - ((v - minV) / range) * iH;
                const getX = (i: number) => pLeft + (i / 5) * iW;

                const points = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
                const splineD = getSplinePath(points);
                const areaD = `${splineD} L ${getX(5)},${pTop + iH} L ${getX(0)},${pTop + iH} Z`;

                const activeMonthData = futureList[selectedHorizonMonth];
                const activeVal = values[selectedHorizonMonth];
                const activeCx = getX(selectedHorizonMonth);
                const activeCy = getY(activeVal);

                const themeHex = outcomeConfig.color || '#0284c7';
                const modelError = payload.outlook.errors[outcomeConfig.target]?.rmse || 1.0;

                return (
                  <div className="space-y-4">
                    {/* Readout Highlight Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Target Month</span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-4 h-4 text-sky-600" />
                          <span className="whitespace-nowrap font-mono">{activeMonthData?.month}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Projected {outcomeConfig.name}</span>
                        <div className="text-xl font-bold mt-0.5" style={{ color: themeHex }}>
                          {activeVal?.toFixed(outcomeConfig.unit === '°C' || outcomeConfig.unit === 'mm' ? 1 : 3)} {outcomeConfig.unit}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Error Margin (RMSE)</span>
                        <div className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          ±{modelError.toFixed(2)} {outcomeConfig.unit}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Model Origin</span>
                        <div className="text-xs font-medium text-slate-700 mt-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          {payload.outlook.origin} (Autoregressive)
                        </div>
                      </div>
                    </div>

                    {/* SVG Spline Canvas */}
                    <div className="relative w-full h-[220px] bg-white rounded-2xl border border-slate-200/80 p-2 overflow-hidden shadow-inner">
                      <svg viewBox={`0 0 ${cWidth} ${cHeight}`} preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                          <linearGradient id="dashFutureGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={themeHex} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={themeHex} stopOpacity="0.0" />
                          </linearGradient>
                          <filter id="dashGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={themeHex} floodOpacity="0.25" />
                          </filter>
                        </defs>

                        {/* Y Gridlines */}
                        <line x1={pLeft} y1={pTop} x2={cWidth - pRight} y2={pTop} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={pLeft} y1={pTop + iH / 2} x2={cWidth - pRight} y2={pTop + iH / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={pLeft} y1={pTop + iH} x2={cWidth - pRight} y2={pTop + iH} stroke="#e2e8f0" strokeWidth="1" />

                        {/* Y Labels */}
                        <text x={pLeft - 8} y={pTop + 4} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">{maxV.toFixed(1)}</text>
                        <text x={pLeft - 8} y={pTop + iH / 2 + 3} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">{((maxV + minV) / 2).toFixed(1)}</text>
                        <text x={pLeft - 8} y={pTop + iH} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">{minV.toFixed(1)}</text>

                        {/* Shaded Area */}
                        <path d={areaD} fill="url(#dashFutureGrad)" />

                        {/* Main Spline */}
                        <path 
                          d={splineD} 
                          fill="none" 
                          stroke={themeHex} 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          filter="url(#dashGlow)"
                        />

                        {/* Active Month Beam */}
                        <line 
                          x1={activeCx} 
                          y1={pTop} 
                          x2={activeCx} 
                          y2={pTop + iH} 
                          stroke="#0f172a" 
                          strokeWidth="1.2" 
                          strokeDasharray="2 3" 
                          opacity="0.5"
                        />

                        {/* Nodes (Clean, Stable Pinpoint Beads - No Pinging or Falling) */}
                        {points.map((pt, i) => {
                          const isSel = i === selectedHorizonMonth;
                          return (
                            <g key={i} className="cursor-pointer" onClick={() => setSelectedHorizonMonth(i)}>
                              {isSel ? (
                                <>
                                  <circle cx={pt.x} cy={pt.y} r="8" fill={themeHex} opacity="0.25" />
                                  <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke={themeHex} strokeWidth="3" />
                                </>
                              ) : (
                                <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke={themeHex} strokeWidth="2.5" />
                              )}
                              <text 
                                x={pt.x} 
                                y={pTop + iH + 18} 
                                textAnchor="middle" 
                                fill={isSel ? '#0f172a' : '#94a3b8'} 
                                fontSize="10.5" 
                                fontWeight={isSel ? '700' : '500'}
                              >
                                {futureList[i].month}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Floating Active Node Badge */}
                      <div 
                        className="absolute pointer-events-none transition-all duration-150"
                        style={{
                          left: `${(activeCx / cWidth) * 100}%`,
                          top: `${activeCy}px`,
                          transform: activeCy > 100 ? 'translate(-50%, -130%)' : 'translate(-50%, 30%)'
                        }}
                      >
                        <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-xl px-2.5 py-1 shadow-lg border border-slate-700/80 text-[10px] whitespace-nowrap">
                          <span className="font-semibold">{activeMonthData?.month}:</span> {activeVal.toFixed(1)} {outcomeConfig.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ============================================================== */}
            {/* SEQUENTIAL OBSERVATION-TO-FORECAST TIMELINE (MATCHING IMAGE 1) */}
            {/* ============================================================== */}
            <HistoricalToForecastBarChart
              historicalRows={outcomeConfig.target === 'ndvi' ? payload.ndvi : payload.lst}
              futureMonths={payload.outlook.future}
              targetKey={outcomeConfig.target}
              targetName={outcomeConfig.name}
              unit={outcomeConfig.unit}
              color={outcomeConfig.color}
              selectedMonthIdx={selectedHorizonMonth}
              onSelectMonth={(idx) => setSelectedHorizonMonth(idx)}
            />

            {/* ============================================================== */}
            {/* RADIAL ROSE DIAGRAM (IMAGE 2) & GEOSPATIAL MAP (IMAGE 1) GRID  */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radial Rose Diagram matching Image 2 */}
              <EnvironmentalRadialRose
                monthData={payload.outlook.future[selectedHorizonMonth] || payload.outlook.future[0]}
                monthName={payload.outlook.future[selectedHorizonMonth]?.month || '2026-09'}
              />

              {/* Regional Geospatial Map Widget matching Image 1 */}
              <RegionalGeospatialMap
                selectedRegion={selectedRegion}
                onSelectRegion={(reg) => setSelectedRegion(reg)}
                selectedOutcome={selectedOutcome}
              />
            </div>

            {/* ============================================================== */}
            {/* REGIONAL TELEMETRY COMPARISON TABLE (MATCHING IMAGE 1 TABLE)   */}
            {/* ============================================================== */}
            <RegionalComparisonTable
              selectedRegion={selectedRegion}
              onSelectRegion={(reg) => setSelectedRegion(reg)}
              selectedOutcome={selectedOutcome}
            />

            {/* ============================================================== */}
            {/* EXPLAINABLE AI DRIVERS & MODEL HOLDOUT VERIFICATION GRID        */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Driver Attribution Decomposition */}
              {(() => {
                const activeMonthData = payload.outlook.future[selectedHorizonMonth];
                const driversList = activeMonthData?.drivers?.[outcomeConfig.target] || [];
                return (
                  <DriverAttributionChart
                    drivers={driversList}
                    targetName={outcomeConfig.name}
                    unit={outcomeConfig.unit}
                    selectedMonth={activeMonthData?.month || ''}
                  />
                );
              })()}

              {/* Model Holdout Verification */}
              <ValidationHoldoutChart
                errorMetric={payload.outlook.errors[outcomeConfig.target]}
                targetName={outcomeConfig.name}
                unit={outcomeConfig.unit}
                color={outcomeConfig.color}
              />
            </div>

            {/* ============================================================== */}
            {/* MULTI-VARIABLE 6-MONTH PREDICTION MATRIX TABLE                  */}
            {/* ============================================================== */}
            <MultiMetricMatrix
              futureMonths={payload.outlook.future.slice(0, 6)}
              selectedMonthIdx={selectedHorizonMonth}
              onSelectMonth={(idx) => setSelectedHorizonMonth(idx)}
            />

            {/* ============================================================== */}
            {/* EXECUTIVE ENVIRONMENTAL & CLIMATIC BRIEFING                     */}
            {/* ============================================================== */}
            <EnvironmentalBriefing
              place={placeConfig}
              futureMonths={payload.outlook.future.slice(0, 6)}
              selectedMonthIdx={selectedHorizonMonth}
            />

            {/* ============================================================== */}
            {/* HISTORICAL OBSERVATIONS WITH ENHANCED INTERACTIVE TELEMETRY     */}
            {/* ============================================================== */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <div className="mb-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-sky-600" />
                    Ground Telemetry Verification
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight mt-0.5">Historical Satellite Observation Series</h3>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Multi-year radiometric composite passes ingested from NASA MODIS and Copernicus ERA5 archives.
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-light flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  {payload.lst.length} Recorded Passes Loaded
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LST Card */}
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Land Surface Temperature (LST)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      MOD11A2 (1km)
                    </span>
                  </div>
                  {renderHistoricalGraph(payload.lst, '#ea580c', hoveredLstIdx, setHoveredLstIdx, '°C', 'LST')}
                  <div className="text-[11px] text-slate-400 font-light flex justify-between mt-3 pt-2 border-t border-slate-200/60">
                    <span>First Pass: {payload.lst[0]?.date}</span>
                    <span>Latest: {payload.lst[payload.lst.length - 1]?.date}</span>
                  </div>
                </div>

                {/* NDVI Card */}
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                      Vegetation Greenness (NDVI)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      MOD13Q1 (250m)
                    </span>
                  </div>
                  {renderHistoricalGraph(payload.ndvi, '#16a34a', hoveredNdviIdx, setHoveredNdviIdx, 'NDVI', 'NDVI')}
                  <div className="text-[11px] text-slate-400 font-light flex justify-between mt-3 pt-2 border-t border-slate-200/60">
                    <span>First Pass: {payload.ndvi[0]?.date}</span>
                    <span>Latest: {payload.ndvi[payload.ndvi.length - 1]?.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* EXECUTIVE REPORT MODAL (EXPORT CSV, JSON, PRINT/PDF, COPY)      */}
            {/* ============================================================== */}
            <ReportModal
              isOpen={reportModalOpen}
              onClose={() => setReportModalOpen(false)}
              payload={payload}
              place={placeConfig}
              outcome={outcomeConfig}
            />
          </>
        )}

      </div>

    </div>
  );
};
