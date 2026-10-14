import React, { useState } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  Droplets, 
  Sprout, 
  ShieldAlert, 
  SunMedium
} from 'lucide-react';
import { 
  tempHours, 
  alertScenarios, 
  rainData, 
  ndviSteps 
} from '../../data/featureMetrics';

export const FeaturesSection: React.FC = () => {
  const [hoveredTempHour, setHoveredTempHour] = useState<number>(4);
  const [activeAlertLead, setActiveAlertLead] = useState<'2W' | '4W' | '6W'>('6W');
  const [hoveredRainMonth, setHoveredRainMonth] = useState<number>(6); // July
  const [hoveredNdviMonth, setHoveredNdviMonth] = useState<number>(5); // June

  const currentTemp = tempHours[hoveredTempHour];
  const currentScenario = alertScenarios[activeAlertLead];
  const currentRain = rainData[hoveredRainMonth];
  const currentNdvi = ndviSteps[hoveredNdviMonth];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Executive Platform Analytics
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 tracking-tight mt-3 mb-4">
          Everything You Need To Monitor <br />
          <strong className="font-semibold text-slate-900">Complex Environmental Dynamics.</strong>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed">
          High-dimensional satellite telemetry converted into intuitive, decision-grade visual metrics. Prevent climate and agricultural surprises before regional thresholds are crossed.
        </p>
      </div>

      {/* 2x2 Bento Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ============================================================== */}
        {/* CARD 1: LAND SURFACE THERMAL MONITORING (Capsule Track Bars)  */}
        {/* Reference: Image 4 "Track your team / Employee Count"          */}
        {/* ============================================================== */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                01 / Thermal Monitoring
              </span>
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-2xs">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">Live Land Surface Temperature</h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed mb-6">
              Hourly diurnal radiometric extraction from NASA MOD11A2 satellite passes. Detect urban heat island anomalies before heatwave intensity peaks.
            </p>

            {/* Readout Pill & Anomaly Tag */}
            <div className="flex items-center justify-between mb-5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Radiometric Reading</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">{currentTemp.temp}°C</span>
                  <span className="text-xs font-medium text-orange-600">{currentTemp.time}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  {currentTemp.pass || 'Interpolated'}
                </span>
                <div className="text-[11px] text-slate-500 mt-1">{currentTemp.desc}</div>
              </div>
            </div>

            {/* CAPSULE TRACK BAR CHART (Image 4 "Track your team" Style) */}
            <div className="relative pt-8 pb-3 bg-gradient-to-b from-orange-50/30 via-white to-amber-50/20 rounded-2xl border border-orange-100/70 px-4">
              
              {/* Floating Dark Tooltip over Active Capsule Bar */}
              <div 
                className="absolute z-20 pointer-events-none transition-all duration-200"
                style={{
                  left: `${((hoveredTempHour + 0.5) / tempHours.length) * 100}%`,
                  top: '6px',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-xl shadow-lg border border-slate-700 whitespace-nowrap">
                  {currentTemp.temp}°C • {currentTemp.time}
                </div>
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 mx-auto"></div>
              </div>

              {/* Bar Columns Grid */}
              <div className="grid grid-cols-8 gap-2 sm:gap-3 items-end h-36">
                {tempHours.map((item, idx) => {
                  const isHovered = idx === hoveredTempHour;
                  // Map temperature 20-30°C to 20-95% height
                  const heightPct = Math.min(95, Math.max(25, ((item.temp - 20) / 9) * 100));

                  return (
                    <div 
                      key={item.time} 
                      className="flex flex-col items-center h-full justify-end cursor-pointer group"
                      onMouseEnter={() => setHoveredTempHour(idx)}
                      onClick={() => setHoveredTempHour(idx)}
                    >
                      {/* Background Capsule Track */}
                      <div className={`w-6 sm:w-8 h-full rounded-full flex flex-col justify-end p-1 transition-all ${
                        isHovered ? 'bg-orange-100/90 ring-2 ring-orange-400/40' : 'bg-slate-100/90'
                      }`}>
                        {/* Filled Capsule Pill inside Track */}
                        <div 
                          className={`w-full rounded-full transition-all duration-300 ${
                            isHovered 
                              ? 'bg-slate-900 shadow-md' 
                              : item.pass 
                                ? 'bg-gradient-to-t from-orange-500 to-amber-400' 
                                : 'bg-orange-400/80'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Hour Labels */}
              <div className="grid grid-cols-8 gap-2 sm:gap-3 mt-3 pt-2 border-t border-orange-100/60 text-center">
                {tempHours.map((item, idx) => (
                  <span 
                    key={item.time}
                    className={`text-[10px] transition-colors cursor-pointer ${
                      idx === hoveredTempHour ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    onMouseEnter={() => setHoveredTempHour(idx)}
                    onClick={() => setHoveredTempHour(idx)}
                  >
                    {item.time.slice(0, 2)}h
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Card Footer */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-amber-500" />
              NASA Terra/Aqua Diurnal Peak:
            </span>
            <span className="font-semibold text-orange-600">28.4°C Radiometric Max</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD 2: EXTREME ENVIRONMENTAL THREATS (Semi-Circle Gauge)      */}
        {/* Reference: Image 4 "Employment Agreement Tracker / Status"    */}
        {/* ============================================================== */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                02 / Threat Early Warning
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">Extreme Environmental Alerts</h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed mb-6">
              Multi-sensor divergence monitors alerting when heat, precipitation, or canopy loss depart beyond ±2.0 standard deviations from the historical mean.
            </p>

            {/* Warning Horizon Selector Tabs */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-medium text-slate-500">Forecasting Horizon:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
                {(['2W', '4W', '6W'] as const).map((leadKey) => (
                  <button
                    key={leadKey}
                    type="button"
                    onClick={() => setActiveAlertLead(leadKey)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeAlertLead === leadKey 
                        ? 'bg-rose-600 text-white font-semibold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {leadKey} Lead
                  </button>
                ))}
              </div>
            </div>

            {/* SEMI-CIRCULAR GAUGE CHART (Image 4 "Contact status" Style) */}
            <div className="rounded-2xl bg-gradient-to-b from-rose-50/30 via-white to-orange-50/20 border border-rose-100/70 p-5 flex flex-col items-center justify-center">
              
              {/* Semi-Circle SVG Gauge */}
              <div className="relative w-64 h-36 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 115">
                  <defs>
                    <linearGradient id="gaugeRoseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                    <linearGradient id="gaugeAmberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>

                  {/* Background Track Arc (Radius 80, Center 100, 100) */}
                  <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="#f1f5f9" 
                    strokeWidth="18" 
                    strokeLinecap="round" 
                  />

                  {/* Segment 1: Blue Baseline (First 45%) */}
                  <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="#0284c7" 
                    strokeWidth="18" 
                    strokeDasharray="251.2"
                    strokeDashoffset="125"
                    strokeLinecap="round" 
                  />

                  {/* Segment 2: Lime/Amber Intermediate (Next 30%) */}
                  <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="#84cc16" 
                    strokeWidth="18" 
                    strokeDasharray="251.2"
                    strokeDashoffset={`${251.2 - (251.2 * (currentScenario.curveOffset / 100))}`}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out" 
                  />

                  {/* Segment 3: Rose High Alarm */}
                  <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="url(#gaugeRoseGrad)" 
                    strokeWidth="18" 
                    strokeDasharray="251.2"
                    strokeDashoffset={`${251.2 - (251.2 * (currentScenario.heatStress / 100) * 0.5)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out" 
                  />
                </svg>

                {/* Big Center Metric Inside Semi-Circle (Image 4 "800" Style) */}
                <div className="absolute bottom-2 text-center">
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentScenario.curveOffset}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Risk Index ({currentScenario.sigma})
                  </div>
                </div>
              </div>

              {/* Clean Legend with Colored Dots */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-rose-100/60 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Thermal Anomaly: <strong className="text-rose-600">{currentScenario.heatStress}%</strong>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Rain Deficit: <strong className="text-amber-600">{currentScenario.rainDeficit}%</strong>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  Biomass Stress: <strong className="text-sky-700">{currentScenario.vegShock}%</strong>
                </span>
              </div>

            </div>

          </div>

          {/* Bottom Card Footer */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Automated Siren Trigger:
            </span>
            <span className="font-semibold text-rose-600">±2.0σ Sigma Bound Exceeded</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD 3: HYDROLOGY & WATER BALANCE (Paired Dual Capsule Bars)   */}
        {/* Reference: Image 5 "DealDeck / Customer Habbits"               */}
        {/* ============================================================== */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                03 / Hydrology Proxy
              </span>
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-2xs">
                <Droplets className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">Climatic Water Balance & Deficits</h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed mb-6">
              Precipitation minus potential evapotranspiration (PET). Identifies moisture drawdowns and aquifer depletion ahead of monsoon transitions.
            </p>

            {/* Readout Header */}
            <div className="flex items-center justify-between mb-5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Catchment Balance</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">{currentRain.month}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    currentRain.net >= 0 ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentRain.net >= 0 ? `+${currentRain.net}` : currentRain.net} mm/mo
                  </span>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-slate-500">Rain: <strong className="text-blue-600 font-semibold">{currentRain.rain} mm</strong></div>
                <div className="text-slate-500">PET: <strong className="text-slate-700 font-semibold">{currentRain.pet} mm</strong></div>
              </div>
            </div>

            {/* PAIRED DUAL CAPSULE BAR CHART (DealDeck "Customer Habbits" Style) */}
            <div className="relative pt-8 pb-3 bg-gradient-to-b from-sky-50/30 via-white to-cyan-50/20 rounded-2xl border border-sky-100/70 px-4">
              
              {/* DealDeck Floating Dark Tooltip with Dual Values */}
              <div 
                className="absolute z-20 pointer-events-none transition-all duration-200"
                style={{
                  left: `${((hoveredRainMonth + 0.5) / rainData.length) * 100}%`,
                  top: '6px',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-slate-900 text-white text-[10px] font-medium px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 space-y-0.5 whitespace-nowrap">
                  <div className="font-semibold text-slate-200 border-b border-slate-800 pb-0.5">
                    {currentRain.month} Balance
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>Rain: {currentRain.rain} mm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>PET: {currentRain.pet} mm</span>
                  </div>
                </div>
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 mx-auto"></div>
              </div>

              {/* Grid of Paired Bars */}
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-end h-36 border-b border-slate-200">
                {rainData.map((d, idx) => {
                  const isHovered = idx === hoveredRainMonth;
                  const maxVal = 45;
                  const rainH = Math.min(100, Math.max(12, (d.rain / maxVal) * 100));
                  const petH = Math.min(100, Math.max(12, (d.pet / maxVal) * 100));

                  return (
                    <div 
                      key={d.month}
                      className="flex items-end justify-center gap-0.5 sm:gap-1 h-full cursor-pointer group"
                      onMouseEnter={() => setHoveredRainMonth(idx)}
                      onClick={() => setHoveredRainMonth(idx)}
                    >
                      {/* Bar 1: Evapotranspiration PET (Neutral grey pill) */}
                      <div 
                        className={`w-1.5 sm:w-2 rounded-full transition-all duration-300 ${
                          isHovered ? 'bg-slate-500 shadow-sm' : 'bg-slate-300'
                        }`}
                        style={{ height: `${petH}%` }}
                      />

                      {/* Bar 2: Rain (Deep vibrant royal blue pill) */}
                      <div 
                        className={`w-2 sm:w-2.5 rounded-full transition-all duration-300 ${
                          isHovered ? 'bg-blue-600 ring-2 ring-blue-400/40 shadow-md' : 'bg-blue-500'
                        }`}
                        style={{ height: `${rainH}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Month Selector Labels Below */}
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 mt-2 text-center">
                {rainData.map((d, idx) => (
                  <span 
                    key={d.month}
                    className={`text-[10px] cursor-pointer transition-colors ${
                      idx === hoveredRainMonth ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    onMouseEnter={() => setHoveredRainMonth(idx)}
                    onClick={() => setHoveredRainMonth(idx)}
                  >
                    {d.month[0]}
                  </span>
                ))}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-3 pt-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Rainfall Inflow
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  PET Outflow
                </span>
              </div>

            </div>

          </div>

          {/* Bottom Card Footer */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-500" />
              Annual Net Catchment Balance:
            </span>
            <span className="font-semibold text-sky-600">+42.6 mm/yr Surplus</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD 4: VEGETATION CANOPY (Concentric Circular Rings)         */}
        {/* Reference: Image 5 "DealDeck / Product Statistic"              */}
        {/* ============================================================== */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                04 / Vegetation Canopy
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                <Sprout className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">Vegetation Index & Crop Analytics</h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed mb-6">
              250m Normalized Difference Vegetation Index (NDVI) tracking to measure chlorophyll concentration, crop vigour, and post-monsoon vegetative rebound.
            </p>

            {/* Readout Header */}
            <div className="flex items-center justify-between mb-5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Chlorophyll Status</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">{currentNdvi.val} NDVI</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {currentNdvi.status}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-slate-400 font-light">{currentNdvi.month} Horizon</div>
                <div className="font-semibold text-emerald-700">{currentNdvi.vigor}% Vigour Score</div>
              </div>
            </div>

            {/* CONCENTRIC RADIAL PROGRESS RINGS (DealDeck "Product Statistic" Style) */}
            <div className="rounded-2xl bg-gradient-to-b from-emerald-50/30 via-white to-green-50/20 border border-emerald-100/70 p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Concentric Rings SVG */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Outer Track: Canopy Chlorophyll (Radius 46) */}
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="46" 
                    fill="none" 
                    stroke="#059669" 
                    strokeWidth="8" 
                    strokeDasharray="289"
                    strokeDashoffset={`${289 - (289 * (currentNdvi.vigor / 100))}`}
                    strokeLinecap="round" 
                    className="transition-all duration-500 ease-out"
                  />

                  {/* Middle Track: Foliage Density (Radius 34) */}
                  <circle cx="60" cy="60" r="34" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="34" 
                    fill="none" 
                    stroke="#84cc16" 
                    strokeWidth="8" 
                    strokeDasharray="213.6"
                    strokeDashoffset={`${213.6 - (213.6 * ((currentNdvi.vigor * 0.85) / 100))}`}
                    strokeLinecap="round" 
                    className="transition-all duration-500 ease-out"
                  />

                  {/* Inner Track: Soil Moisture Retention (Radius 22) */}
                  <circle cx="60" cy="60" r="22" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="22" 
                    fill="none" 
                    stroke="#0284c7" 
                    strokeWidth="8" 
                    strokeDasharray="138.2"
                    strokeDashoffset={`${138.2 - (138.2 * ((currentNdvi.vigor * 0.72) / 100))}`}
                    strokeLinecap="round" 
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                {/* Center Value */}
                <div className="absolute text-center">
                  <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {currentNdvi.val}
                  </div>
                  <div className="text-[9px] font-semibold text-emerald-700 uppercase">
                    NDVI
                  </div>
                </div>
              </div>

              {/* Right Side Breakdown Legend (Image 5 Style) */}
              <div className="space-y-3 text-xs w-full">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    Canopy Chlorophyll
                  </span>
                  <span className="font-bold text-slate-900">{currentNdvi.vigor}%</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
                    Foliage Density
                  </span>
                  <span className="font-bold text-slate-900">{Math.round(currentNdvi.vigor * 0.85)}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                    Substrate Moisture
                  </span>
                  <span className="font-bold text-slate-900">{Math.round(currentNdvi.vigor * 0.72)}%</span>
                </div>
              </div>

            </div>

            {/* Interactive Month Buttons */}
            <div className="flex items-center justify-between gap-1 mt-4 pt-3 border-t border-emerald-100/60">
              {ndviSteps.map((step, idx) => (
                <button
                  key={step.month}
                  type="button"
                  onMouseEnter={() => setHoveredNdviMonth(idx)}
                  onClick={() => setHoveredNdviMonth(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    hoveredNdviMonth === idx 
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {step.month}
                </button>
              ))}
            </div>

          </div>

          {/* Bottom Card Footer */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              Seasonal Canopy Rebound:
            </span>
            <span className="font-semibold text-emerald-600">+39.5% Post-Monsoon Recovery</span>
          </div>
        </div>

      </div>
    </section>
  );
};
