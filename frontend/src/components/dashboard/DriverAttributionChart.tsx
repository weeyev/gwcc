import React from 'react';
import { DriverEffect } from '../../types';
import { Sliders, Sparkles } from 'lucide-react';

interface DriverAttributionChartProps {
  drivers: DriverEffect[];
  targetName: string;
  unit: string;
  selectedMonth: string;
}

export const DriverAttributionChart: React.FC<DriverAttributionChartProps> = ({
  drivers,
  targetName,
  unit,
  selectedMonth
}) => {
  if (!drivers || drivers.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-center text-xs text-slate-500">
        No driver attribution coefficients recorded for this horizon window.
      </div>
    );
  }

  // Find max absolute effect to scale horizontal bars symmetrically
  const maxAbsEffect = Math.max(...drivers.map(d => Math.abs(d.effect)), 0.001);

  // Sort drivers by absolute effect magnitude descending
  const sortedDrivers = [...drivers].sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-2 mb-4 pb-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight whitespace-nowrap">
              Driver Decomposition & Attribution
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 shrink-0 whitespace-nowrap">
              {selectedMonth}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-normal shrink-0 whitespace-nowrap">
            <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <span className="w-2 h-2 rounded-sm bg-orange-500 shrink-0"></span> Positive Driver
            </span>
            <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <span className="w-2 h-2 rounded-sm bg-sky-500 shrink-0"></span> Mitigating Driver
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
          Explainable AI (XAI): isolating physical atmospheric variables and prior land conditions driving {targetName.toLowerCase()}.
        </p>
      </div>

      <div className="space-y-3.5">
        {sortedDrivers.map((driver) => {
          const isPositive = driver.effect >= 0;
          const absPct = Math.min(100, (Math.abs(driver.effect) / maxAbsEffect) * 100);
          const formattedVal = `${isPositive ? '+' : ''}${driver.effect.toFixed(
            unit === '°C' || unit === 'mm' ? 2 : 4
          )} ${unit}`;

          return (
            <div key={driver.key} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-sky-600 transition-colors"></span>
                  {driver.label}
                </span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    isPositive ? 'text-orange-600' : 'text-sky-600'
                  }`}
                >
                  {formattedVal}
                </span>
              </div>

              {/* Bidirectional Bar Canvas */}
              <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden flex items-center">
                {/* Center Baseline Indicator */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 z-10" />

                {/* Left (Negative) Bar */}
                <div className="w-1/2 h-full flex justify-end">
                  {!isPositive && (
                    <div
                      className="h-full bg-gradient-to-l from-sky-500 to-sky-400 rounded-l-full transition-all duration-300"
                      style={{ width: `${absPct}%` }}
                    />
                  )}
                </div>

                {/* Right (Positive) Bar */}
                <div className="w-1/2 h-full flex justify-start">
                  {isPositive && (
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-r-full transition-all duration-300"
                      style={{ width: `${absPct}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-start sm:items-center justify-between gap-3 text-[11px] text-slate-400 font-light">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          Ridge L2 regularized coefficients calibrated with Copernicus ERA5 atmospheric reanalysis.
        </span>
        <span className="shrink-0 font-mono text-[10px] text-slate-400">
          Scale: ±{maxAbsEffect.toFixed(2)} {unit}
        </span>
      </div>
    </div>
  );
};
