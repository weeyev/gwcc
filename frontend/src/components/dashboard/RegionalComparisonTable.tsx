import React from 'react';
import { places, outcomes } from '../../config';
import { MapPin, Check, ArrowRight, Sparkles } from 'lucide-react';

interface RegionalComparisonTableProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  selectedOutcome: string;
}

export const RegionalComparisonTable: React.FC<RegionalComparisonTableProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedOutcome
}) => {
  const currentOutcome = outcomes[selectedOutcome] || outcomes.heat;

  // Regional profile with simulated 6-month sparkline data points
  const regionalData = [
    {
      key: 'chengalpattu',
      name: 'Chengalpattu',
      subtext: 'Coastal Agro-Ecological Corridor',
      passes: 74,
      lst: 30.8,
      ndvi: 0.398,
      balance: -3.4,
      sparkline: [30.8, 29.4, 27.9, 26.2, 27.1, 29.5],
      tag: 'Moderate Coastal Heat',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      resilience: '88% High'
    },
    {
      key: 'chennai',
      name: 'Chennai',
      subtext: 'High-Density Urban Metropolitan',
      passes: 74,
      lst: 31.4,
      ndvi: 0.281,
      balance: -12.6,
      sparkline: [31.4, 30.1, 28.5, 27.0, 27.8, 30.2],
      tag: 'Thermal Urban Island',
      tagColor: 'bg-orange-50 text-orange-700 border-orange-200',
      resilience: '76% Watch'
    },
    {
      key: 'kanchipuram',
      name: 'Kanchipuram',
      subtext: 'Inland Semi-Arid Agricultural Hub',
      passes: 74,
      lst: 32.1,
      ndvi: 0.362,
      balance: -18.2,
      sparkline: [32.1, 30.8, 28.9, 27.2, 28.4, 31.0],
      tag: 'Elevated Inland Stress',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      resilience: '81% Stable'
    }
  ];

  // Helper to render inline SVG mini sparkline (like Image 1)
  const renderSparkline = (points: number[], isSelected: boolean) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const w = 90;
    const h = 24;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const d = `M ${coords.join(' L ')}`;

    return (
      <svg width={w} height={h} className="overflow-visible">
        <path
          d={d}
          fill="none"
          stroke={isSelected ? '#0284c7' : '#10b981'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End Point Dot */}
        {points.length > 0 && (
          <circle
            cx={coords[coords.length - 1].split(',')[0]}
            cy={coords[coords.length - 1].split(',')[1]}
            r="3"
            fill={isSelected ? '#0284c7' : '#10b981'}
          />
        )}
      </svg>
    );
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-2 mb-4 pb-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight truncate">
              Regional Telemetry & Trajectory Breakdown
            </h3>
          </div>

          <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>Click row to switch study area</span>
          </span>
        </div>

        <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
          Cross-district telemetry benchmarks comparing satellite ground truths and 6-month horizons.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-500 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5">Study Hub & Eco-Zone</th>
              <th className="py-3 px-3">Telemetry Archive</th>
              <th className="py-3 px-3">{currentOutcome.name}</th>
              <th className="py-3 px-3">6-Mo Horizon Trend</th>
              <th className="py-3 px-3">Environmental Status</th>
              <th className="py-3 px-3">Resilience Score</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {regionalData.map((r) => {
              const isSelected = selectedRegion === r.key;
              const place = places[r.key];

              return (
                <tr
                  key={r.key}
                  onClick={() => onSelectRegion(r.key)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-50/90 font-medium text-slate-900'
                      : 'hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  {/* District & Subtext */}
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-sky-200/70 text-sky-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{r.name}, Tamil Nadu</span>
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-600 text-white font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-light">
                          {place?.lat.toFixed(4)}°N, {place?.lon.toFixed(4)}°E • {r.subtext}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Telemetry Passes */}
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {r.passes} <span className="text-[10px] font-sans text-slate-400">passes</span>
                  </td>

                  {/* Target Value */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {currentOutcome.target === 'lst' && `${r.lst.toFixed(1)} °C`}
                    {currentOutcome.target === 'ndvi' && `${r.ndvi.toFixed(3)} NDVI`}
                    {currentOutcome.target === 'balance' && `${r.balance.toFixed(1)} mm`}
                  </td>

                  {/* Inline Sparkline */}
                  <td className="py-3 px-3">
                    {renderSparkline(r.sparkline, isSelected)}
                  </td>

                  {/* Environmental Status Tag */}
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${r.tagColor}`}>
                      {r.tag}
                    </span>
                  </td>

                  {/* Resilience Score */}
                  <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-800">
                    {r.resilience}
                  </td>

                  {/* Action Button */}
                  <td className="py-3 px-3 text-right">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-sky-600">
                        Switch <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
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
