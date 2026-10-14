import React from 'react';
import { ForecastMonthData, RegionConfig } from '../../types';
import { 
  FileText, 
  AlertCircle, 
  Sprout, 
  Building2, 
  Droplets, 
  Compass, 
  CheckCircle,
  TrendingUp,
  Sparkles 
} from 'lucide-react';

interface EnvironmentalBriefingProps {
  place: RegionConfig;
  futureMonths: ForecastMonthData[];
  selectedMonthIdx: number;
}

export const EnvironmentalBriefing: React.FC<EnvironmentalBriefingProps> = ({
  place,
  futureMonths,
  selectedMonthIdx
}) => {
  if (!futureMonths || futureMonths.length === 0) return null;

  const currentMonthData = futureMonths[selectedMonthIdx] || futureMonths[0];

  // Dynamic analysis derived from numbers
  const highestLstMonth = [...futureMonths].sort((a, b) => b.lst - a.lst)[0];
  const lowestBalanceMonth = [...futureMonths].sort((a, b) => a.balance - b.balance)[0];
  const peakRainMonth = [...futureMonths].sort((a, b) => b.rainfall - a.rainfall)[0];
  const avgNdvi = futureMonths.reduce((acc, m) => acc + m.ndvi, 0) / futureMonths.length;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-2 mb-4 pb-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight truncate">
              Executive Environmental & Climatic Synthesis
            </h3>
          </div>

          <span className="text-[10px] font-medium text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-sky-600 shrink-0" />
            <span>District: {place.name}</span>
          </span>
        </div>

        <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
          Autonomous multi-scale narrative analysis synthesized from 6-month thermodynamic trajectory.
        </p>
      </div>

      {/* Analytical Briefing Text */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-sky-50/30 to-white border border-slate-200/80 mb-6">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-sky-600" />
          Regional Trajectory Overview
        </h4>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
          Over the upcoming 6-month prediction cycle in <strong className="font-semibold text-slate-900">{place.name} District</strong> ({place.lat.toFixed(2)}°N, {place.lon.toFixed(2)}°E), our regularized autoregressive model projects land surface temperatures peaking in <strong className="font-semibold text-slate-900">{highestLstMonth.month}</strong> at <strong className="font-semibold text-orange-600">{highestLstMonth.lst.toFixed(1)}°C</strong>. Atmospheric 2m air temperature follows closely, reaching <strong className="font-semibold text-slate-800">{highestLstMonth.temperature.toFixed(1)}°C</strong> under elevated solar radiation forcings.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light mt-3">
          On the hydrological axis, the district experiences its sharpest moisture deficit during <strong className="font-semibold text-slate-900">{lowestBalanceMonth.month}</strong> (climatic water balance of <strong className="font-semibold text-amber-700">{lowestBalanceMonth.balance.toFixed(1)} mm</strong>), followed by monsoon precipitation reinforcement peaking in <strong className="font-semibold text-slate-900">{peakRainMonth.month}</strong> with <strong className="font-semibold text-sky-700">{peakRainMonth.rainfall.toFixed(1)} mm</strong> of total rainfall. Canopy greenness index maintains an average NDVI of <strong className="font-semibold text-emerald-700">{avgNdvi.toFixed(3)}</strong>, reflecting resilient multi-tier vegetative cover.
        </p>
      </div>

      {/* 3 Actionable Sector Advisories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Agriculture Advisory */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-xs">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Agriculture & Agroforestry</span>
            </div>
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Plan micro-irrigation scheduling for {lowestBalanceMonth.month} during the moisture deficit window. For {highestLstMonth.month}, deploy shade netting or mulch to counter peak surface radiation and soil moisture evaporation.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-100/60 text-[10px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Recommended: Drip cycle optimization
          </div>
        </div>

        {/* Urban Heat & Governance */}
        <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-orange-800 font-semibold text-xs">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>Municipal Urban Planning</span>
            </div>
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Elevated thermal readings in {highestLstMonth.month} ({highestLstMonth.lst.toFixed(1)}°C) suggest heightened urban heat island (UHI) intensity in built-up sectors. Pre-activate public hydration stations and municipal shade infrastructure.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-orange-100/60 text-[10px] text-orange-700 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Pre-alert: Cool roof & cooling centers
          </div>
        </div>

        {/* Water Management */}
        <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-sky-800 font-semibold text-xs">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>Water Resource Utilities</span>
            </div>
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Anticipate high reservoir evaporative losses ({currentMonthData.evapotranspiration.toFixed(0)} mm/mo) ahead of peak precipitation in {peakRainMonth.month}. Maximize groundwater percolation structures prior to the monsoon recharge cycle.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-sky-100/60 text-[10px] text-sky-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Priority: Infiltration basin readiness
          </div>
        </div>

      </div>
    </div>
  );
};
