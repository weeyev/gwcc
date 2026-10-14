import React, { useState } from 'react';
import { 
  ArrowRight, 
  Gauge, 
  BarChart3, 
  CheckCircle2,
  Sparkles,
  Layers,
  Droplets
} from 'lucide-react';

interface UseCasesSectionProps {
  onOpenDashboard: (outcome?: string) => void;
}

export const UseCasesSection: React.FC<UseCasesSectionProps> = ({ onOpenDashboard }) => {
  const [urbanZone, setUrbanZone] = useState<'asphalt' | 'residential' | 'park'>('asphalt');
  const [cropZone, setCropZone] = useState<'optimal' | 'moderate' | 'stress'>('optimal');
  const [reservoirHorizon, setReservoirHorizon] = useState<'past' | 'now' | 'outlook'>('outlook');

  const urbanZones = {
    asphalt: { label: 'Asphalt Industrial', temp: '35.8°C', diff: '+8.2°C', advice: 'Deploy misting shelters & cool roofs', color: 'text-rose-600', bar: 'w-[92%] bg-rose-500' },
    residential: { label: 'Suburban Dense', temp: '31.7°C', diff: '+4.1°C', advice: 'Expand street trees & porous paving', color: 'text-orange-600', bar: 'w-[68%] bg-orange-500' },
    park: { label: 'Urban Forest', temp: '26.0°C', diff: '-1.6°C', advice: 'Benchmark ecological sanctuary', color: 'text-emerald-600', bar: 'w-[32%] bg-emerald-500' },
  };
  const currentZ = urbanZones[urbanZone];

  const cropStates = {
    optimal: { label: 'Optimal Canopy', ha: '42,000 ha (68%)', ndvi: '0.58 NDVI', status: 'Normal irrigation; high crop vigor', color: 'text-emerald-700' },
    moderate: { label: 'Moisture Watch', ha: '15,200 ha (24%)', ndvi: '0.41 NDVI', status: 'Pre-emptive deficit; canal release ready', color: 'text-amber-700' },
    stress: { label: 'Critical Stress', ha: '5,100 ha (8%)', ndvi: '0.28 NDVI', status: 'Severe drought shock; emergency draw', color: 'text-rose-700' },
  };
  const currentC = cropStates[cropZone];

  const reservoirs = {
    past: { label: 'Pre-Monsoon Low', pct: '54%', vol: '142 MCM', flow: '+4.2 m³/s', net: '-28 MCM deficit', color: 'text-amber-600', bar: 'w-[54%] bg-amber-500' },
    now: { label: 'Current Level', pct: '74%', vol: '196 MCM', flow: '+14.8 m³/s', net: '+12 MCM surplus', color: 'text-sky-700', bar: 'w-[74%] bg-sky-500' },
    outlook: { label: '6-Month Horizon', pct: '88%', vol: '234 MCM', flow: '+22.6 m³/s', net: '+38 MCM recharge', color: 'text-sky-800', bar: 'w-[88%] bg-sky-600' },
  };
  const currentR = reservoirs[reservoirHorizon];

  return (
    <section id="usecases" className="min-h-[90vh] py-8 lg:py-12 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Field Applications
        </span>
        <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight mt-2.5 mb-2">
          Built For Real Decisions Across <strong className="font-semibold text-slate-900">Vulnerable Landscapes.</strong>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-light max-w-xl mx-auto">
          Regional councils, agricultural cooperatives, and water authorities deploy GeoCast to prepare months before climate shocks materialize.
        </p>
      </div>

      {/* 3 CARDS IN A SINGLE ROW - FULL MAX-WIDTH & PROPER PADDING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* CARD 1: Urban Heat Island Mitigation */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all flex flex-col justify-between overflow-hidden">
          {/* Image Container with Inset Padding - NO Hover Scale */}
          <div className="p-3.5 pb-0">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img 
                src="/src/assets/usecase_urban_heat.jpg" 
                alt="Urban heat island thermal analysis" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              
              <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
                URBAN RESILIENCE
              </span>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-orange-600/90 backdrop-blur-md font-semibold">
                  {currentZ.temp} Peak
                </span>
                <span className="opacity-90 font-mono text-[9px]">MOD11A2 LST</span>
              </div>
            </div>
          </div>

          {/* Card Content & Interactive Widget */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-orange-700 mb-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                Thermal Micro-Climate
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                Urban Heat Island Mitigation
              </h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed mb-4">
                Pinpoint high-density asphalt zones where surface heat concentrates up to 8°C above green parks to deploy cool roofs and misting corridors.
              </p>

              {/* Interactive Widget */}
              <div className="rounded-2xl bg-orange-50/50 border border-orange-100 p-3 mb-4 text-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 mb-2">
                  <span className="flex items-center gap-1 text-orange-950 font-semibold text-[10px]">
                    <Gauge className="w-3.5 h-3.5 text-orange-600" />
                    Micro-Zone:
                  </span>
                  <div className="flex gap-1">
                    {(['asphalt', 'residential', 'park'] as const).map((zKey) => (
                      <button
                        key={zKey}
                        type="button"
                        onClick={() => setUrbanZone(zKey)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          urbanZone === zKey ? 'bg-orange-600 text-white shadow-2xs font-semibold' : 'bg-white text-slate-600 hover:bg-orange-100'
                        }`}
                      >
                        {zKey === 'asphalt' ? 'Asphalt' : zKey === 'residential' ? 'Suburbs' : 'Park'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-slate-500 text-[11px]">{currentZ.label}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{currentZ.temp}</span>
                    <span className={`text-[11px] font-bold ${currentZ.color}`}>{currentZ.diff}</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${currentZ.bar} rounded-full transition-all duration-300`}></div>
                </div>

                <div className="text-[10px] text-slate-500 font-light flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  {currentZ.advice}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDashboard('heat')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 cursor-pointer transition-colors pt-2 border-t border-slate-100"
            >
              Explore Urban Heat Lens <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: Crop Health & Drought Vulnerability */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col justify-between overflow-hidden">
          {/* Image Container with Inset Padding - NO Hover Scale */}
          <div className="p-3.5 pb-0">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img 
                src="/src/assets/usecase_agriculture.jpg" 
                alt="Agricultural canopy crop stress satellite analysis" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              
              <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
                AGRI-FOOD SECURITY
              </span>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md font-semibold">
                  {currentC.ndvi}
                </span>
                <span className="opacity-90 font-mono text-[9px]">250m MOD13Q1</span>
              </div>
            </div>
          </div>

          {/* Card Content & Interactive Widget */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-1">
                <Layers className="w-3 h-3 text-emerald-600" />
                Agronomic Canopy Telemetry
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                Crop Health & Drought Defense
              </h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed mb-4">
                Track chlorophyll vitality across regional crop hectares. Early detection of canopy moisture deficits enables targeted water releases.
              </p>

              {/* Interactive Widget */}
              <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-3 mb-4 text-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 mb-2">
                  <span className="flex items-center gap-1 text-emerald-950 font-semibold text-[10px]">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                    Canopy Cluster:
                  </span>
                  <div className="flex gap-1">
                    {(['optimal', 'moderate', 'stress'] as const).map((cKey) => (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setCropZone(cKey)}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          cropZone === cKey ? 'bg-emerald-700 text-white shadow-2xs font-semibold' : 'bg-white text-slate-600 hover:bg-emerald-100'
                        }`}
                      >
                        {cKey === 'optimal' ? '68% High' : cKey === 'moderate' ? '24% Watch' : '8% Stress'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-slate-500 text-[11px]">{currentC.ha}</span>
                  <span className={`text-xs font-bold ${currentC.color}`}>{currentC.ndvi}</span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex mb-2">
                  <div className="w-[68%] bg-emerald-500 h-full"></div>
                  <div className="w-[24%] bg-amber-400 h-full"></div>
                  <div className="w-[8%] bg-rose-500 h-full"></div>
                </div>

                <div className="text-[10px] text-slate-500 font-light flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  {currentC.status}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDashboard('vegetation')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 cursor-pointer transition-colors pt-2 border-t border-slate-100"
            >
              Explore Vegetation Outlook <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: Watershed Catchment & Reservoir Planning */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all flex flex-col justify-between overflow-hidden">
          {/* Image Container with Inset Padding - NO Hover Scale */}
          <div className="p-3.5 pb-0">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img 
                src="/src/assets/usecase_water.jpg" 
                alt="Watershed reservoir catchment satellite analysis" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              
              <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
                WATERSHED HYDROLOGY
              </span>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-sky-600/90 backdrop-blur-md font-semibold">
                  {currentR.vol} Storage
                </span>
                <span className="opacity-90 font-mono text-[9px]">ERA5 Hydrology</span>
              </div>
            </div>
          </div>

          {/* Card Content & Interactive Widget */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-sky-800 mb-1">
                <Droplets className="w-3 h-3 text-sky-600" />
                Catchment Diagnostics
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                Reservoir Inflow & Catchment
              </h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed mb-4">
                Calculate net precipitation surplus minus reference evapotranspiration to model reservoir fill curves up to 6 months before monsoons break.
              </p>

              {/* Interactive Widget */}
              <div className="rounded-2xl bg-sky-50/50 border border-sky-100 p-3 mb-4 text-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 mb-2">
                  <span className="flex items-center gap-1 text-sky-950 font-semibold text-[10px]">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    Storage Horizon:
                  </span>
                  <div className="flex gap-1">
                    {(['past', 'now', 'outlook'] as const).map((rKey) => (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => setReservoirHorizon(rKey)}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          reservoirHorizon === rKey ? 'bg-sky-700 text-white shadow-2xs font-semibold' : 'bg-white text-slate-600 hover:bg-sky-100'
                        }`}
                      >
                        {rKey === 'past' ? 'Past' : rKey === 'now' ? 'Now' : '6 Mo'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-slate-500 text-[11px]">{currentR.label}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{currentR.vol}</span>
                    <span className={`text-[11px] font-bold ${currentR.color}`}>({currentR.pct})</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${currentR.bar} rounded-full transition-all duration-300`}></div>
                </div>

                <div className="text-[10px] text-slate-500 font-light flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    Runoff: {currentR.flow}
                  </span>
                  <strong className="text-sky-800 font-medium">{currentR.net}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDashboard('water')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 cursor-pointer transition-colors pt-2 border-t border-slate-100"
            >
              Explore Hydrology Outlook <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
