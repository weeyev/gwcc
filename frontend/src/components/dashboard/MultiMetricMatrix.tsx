import React from 'react';
import { ForecastMonthData } from '../../types';
import { Table, Flame, Sprout, Droplets, CloudRain, Calendar, Sparkles } from 'lucide-react';

interface MultiMetricMatrixProps {
  futureMonths: ForecastMonthData[];
  selectedMonthIdx: number;
  onSelectMonth: (idx: number) => void;
}

export const MultiMetricMatrix: React.FC<MultiMetricMatrixProps> = ({
  futureMonths,
  selectedMonthIdx,
  onSelectMonth
}) => {
  if (!futureMonths || futureMonths.length === 0) return null;

  // Compute 6-month aggregated metrics
  const totalRainfall = futureMonths.reduce((acc, m) => acc + (m.rainfall || 0), 0);
  const avgTemp = futureMonths.reduce((acc, m) => acc + (m.temperature || 0), 0) / futureMonths.length;
  const peakLst = Math.max(...futureMonths.map(m => m.lst || 0));
  const peakLstMonth = futureMonths.find(m => m.lst === peakLst)?.month || '';
  const minBalance = Math.min(...futureMonths.map(m => m.balance || 0));

  // Helper for thermal stress status
  const getThermalStatus = (lst: number) => {
    if (lst >= 34) return { label: 'Severe Stress', color: 'bg-red-50 text-red-700 border-red-200' };
    if (lst >= 31) return { label: 'Elevated Heat', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    if (lst >= 28) return { label: 'Moderate', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Mild / Cool', color: 'bg-sky-50 text-sky-700 border-sky-200' };
  };

  // Helper for water status
  const getWaterStatus = (balance: number) => {
    if (balance >= 20) return { label: 'Surplus', color: 'text-sky-700 bg-sky-50' };
    if (balance >= -20) return { label: 'Balanced', color: 'text-emerald-700 bg-emerald-50' };
    return { label: 'Deficit', color: 'text-amber-700 bg-amber-50' };
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-2 mb-4 pb-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <Table className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight truncate">
              Multi-Variable Environmental Outlook Matrix
            </h3>
          </div>

          <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>Click row to inspect drivers</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
          Harmonized monthly predictions across thermodynamic, biophysical, and hydrological variables.
        </p>
      </div>

      {/* 4 Summary Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Peak LST</span>
            <div className="text-sm font-bold text-slate-900">
              {peakLst.toFixed(1)} °C <span className="text-[10px] font-normal text-slate-500">({peakLstMonth})</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-100/70 text-sky-600 flex items-center justify-center shrink-0">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">6-Mo Rainfall</span>
            <div className="text-sm font-bold text-slate-900">
              {totalRainfall.toFixed(0)} mm <span className="text-[10px] font-normal text-slate-500">total</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Mean Air Temp</span>
            <div className="text-sm font-bold text-slate-900">
              {avgTemp.toFixed(1)} °C <span className="text-[10px] font-normal text-slate-500">ambient</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Moisture Trough</span>
            <div className="text-sm font-bold text-slate-900">
              {minBalance.toFixed(1)} mm <span className="text-[10px] font-normal text-slate-500">deficit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-500 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5">Forecast Horizon</th>
              <th className="py-3 px-3">Surface Heat (LST)</th>
              <th className="py-3 px-3">Air Temp (2m)</th>
              <th className="py-3 px-3">Vegetation (NDVI)</th>
              <th className="py-3 px-3">Precipitation</th>
              <th className="py-3 px-3">Evapotranspiration</th>
              <th className="py-3 px-3">Water Balance</th>
              <th className="py-3 px-3 text-right">Thermal Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {futureMonths.map((m, idx) => {
              const isSelected = idx === selectedMonthIdx;
              const status = getThermalStatus(m.lst);
              const water = getWaterStatus(m.balance);

              return (
                <tr
                  key={m.month}
                  onClick={() => onSelectMonth(idx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-50/90 font-medium text-slate-900'
                      : 'hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  {/* Month */}
                  <td className="py-3 px-3.5 flex items-center gap-2">
                    <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="font-semibold">{m.month}</span>
                    {isSelected && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-200/60 text-sky-800 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </td>

                  {/* Surface Heat */}
                  <td className="py-3 px-3 font-mono font-medium text-orange-600">
                    {m.lst.toFixed(1)} °C
                  </td>

                  {/* Air Temp */}
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {m.temperature.toFixed(1)} °C
                  </td>

                  {/* NDVI */}
                  <td className="py-3 px-3 font-mono text-emerald-700">
                    {m.ndvi.toFixed(3)}
                  </td>

                  {/* Rainfall */}
                  <td className="py-3 px-3 font-mono text-sky-700">
                    {m.rainfall.toFixed(1)} mm
                  </td>

                  {/* ET */}
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {m.evapotranspiration.toFixed(1)} mm
                  </td>

                  {/* Water Balance */}
                  <td className="py-3 px-3 font-mono">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${water.color}`}>
                      {m.balance > 0 ? `+${m.balance.toFixed(1)}` : m.balance.toFixed(1)} mm
                    </span>
                  </td>

                  {/* Thermal Status */}
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
